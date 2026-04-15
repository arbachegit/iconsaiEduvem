#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  deploy.sh — iconsaiEduvem → eduvem.iconsai.ai
# ═══════════════════════════════════════════════════════════════════════
#
# Uso:
#   bash scripts/deploy.sh           # build + rsync + restart + verify
#   bash scripts/deploy.sh --skip-build   # pula o next build (usa .next existente)
#
# Infra real (veja memory project_eduvem_infra.md):
#   droplet:  198.199.88.189
#   path:     /opt/eduvem/app
#   service:  eduvem
#   porta:    3010
#
# Por que sem --exclude='start.sh':
#   O start.sh vive no repo e é idêntico ao de produção. Quando um rsync
#   anterior teve exclude, o arquivo sumiu em produção (causa desconhecida)
#   e o serviço entrou em crashloop. Incluir no rsync garante restauração
#   automática a cada deploy e mantém uma única fonte de verdade.
#   O .env.local continua excluído (dados específicos de produção).

set -e

DROPLET="root@198.199.88.189"
APP_PATH="/opt/eduvem/app"
SERVICE="eduvem"
RSH='ssh -o ServerAliveInterval=10 -o ServerAliveCountMax=6 -o ConnectTimeout=20 -o ConnectionAttempts=8 -o TCPKeepAlive=yes'

cd "$(dirname "$0")/.."

SKIP_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    *) echo "opção desconhecida: $arg"; exit 1 ;;
  esac
done

GIT_SHA=$(git rev-parse --short HEAD)
echo "▶ deploy iconsaiEduvem → $DROPLET (commit $GIT_SHA)"

if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "▶ limpando .next"
  rm -rf .next
  echo "▶ next build"
  npx next build --no-lint
else
  echo "▶ pulando build (--skip-build)"
fi

if [ ! -d .next/standalone ]; then
  echo "✗ .next/standalone ausente — rode sem --skip-build primeiro"
  exit 1
fi

echo "▶ rsync standalone"
rsync -avz -e "$RSH" --partial --partial-dir=.rsync-partial --timeout=180 \
  .next/standalone/ "$DROPLET:$APP_PATH/" \
  --exclude='.env.local' | tail -3

echo "▶ rsync static"
rsync -avz -e "$RSH" --partial --partial-dir=.rsync-partial --timeout=180 \
  .next/static/ "$DROPLET:$APP_PATH/.next/static/" | tail -3

echo "▶ rsync public"
rsync -avz -e "$RSH" --partial --partial-dir=.rsync-partial --timeout=180 \
  public/ "$DROPLET:$APP_PATH/public/" | tail -3

echo "▶ rsync start.sh (entrypoint do systemd)"
rsync -avz -e "$RSH" --timeout=60 start.sh "$DROPLET:$APP_PATH/start.sh" | tail -2

echo "▶ restart $SERVICE"
ssh -o ServerAliveInterval=10 -o ConnectTimeout=20 "$DROPLET" "
  chown -R www-data:www-data $APP_PATH
  chmod +x $APP_PATH/start.sh
  systemctl reset-failed $SERVICE 2>/dev/null || true
  systemctl restart $SERVICE
  sleep 3
  systemctl is-active $SERVICE
"

echo "▶ verify (build id stamp no HTML)"
sleep 2
LIVE=$(curl -s https://eduvem.iconsai.ai/ | grep -oE '<!--[a-f0-9]+_[0-9]+-->' | head -1)
echo "  produção: $LIVE"
echo "  esperado: <!--${GIT_SHA}_...-->"

if [[ "$LIVE" == "<!--${GIT_SHA}_"* ]]; then
  echo "✓ deploy OK"
else
  echo "✗ build id na produção NÃO corresponde ao commit local"
  exit 2
fi
