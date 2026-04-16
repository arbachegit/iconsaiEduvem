#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  deploy.sh — iconsaiEduvem → eduvem.iconsai.ai
#  Implementa o pipeline canônico anti-deploy-fantasma (8 fases).
# ═══════════════════════════════════════════════════════════════════════
#
# Uso:
#   bash scripts/deploy.sh                     # build completo + deploy
#   bash scripts/deploy.sh --skip-build        # reusa .next existente
#   bash scripts/deploy.sh --skip-pre-check    # ignora git status check
#   bash scripts/deploy.sh --rollback          # restaura .next.previous
#
# PRINCÍPIO NUCLEAR: PROVA DE FRESCOR. Cada deploy DEVE responder SIM a:
#   1. BUILD_ID em produção é diferente do anterior?
#   2. HTML servido em / contém o commit SHA do push atual?
#   3. /api/build-info devolve o SHA esperado?

set -euo pipefail

DROPLET="root@198.199.88.189"
DOMAIN="eduvem.iconsai.ai"
APP_PATH="/opt/eduvem/app"
SERVICE="eduvem"
RSH='ssh -o ServerAliveInterval=10 -o ServerAliveCountMax=6 -o ConnectTimeout=20 -o ConnectionAttempts=8 -o TCPKeepAlive=yes'
SSH_OPTS='-o ServerAliveInterval=10 -o ConnectTimeout=20'

cd "$(dirname "$0")/.."

SKIP_BUILD=0
SKIP_PRE_CHECK=0
DO_ROLLBACK=0
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    --skip-pre-check) SKIP_PRE_CHECK=1 ;;
    --rollback) DO_ROLLBACK=1 ;;
    *) echo "✗ opção desconhecida: $arg"; exit 1 ;;
  esac
done

GIT_SHA=$(git rev-parse --short HEAD)
PREV_REMOTE_SHA=$(curl -fsS "https://$DOMAIN/api/build-info" 2>/dev/null | sed -nE 's/.*"sha":"([^"]+)".*/\1/p' || echo 'unknown')

# ─── ROLLBACK ────────────────────────────────────────────────────────────
if [ "$DO_ROLLBACK" -eq 1 ]; then
  echo "▶ ROLLBACK: restaurando .next.previous em produção"
  ssh $SSH_OPTS "$DROPLET" "
    set -e
    cd $APP_PATH
    if [ ! -d .next.previous ]; then echo '✗ não há .next.previous — nada a fazer'; exit 1; fi
    mv .next .next.broken-\$(date +%s)
    cp -r .next.previous .next
    chown -R www-data:www-data .next
    systemctl restart $SERVICE
    sleep 3
    systemctl is-active $SERVICE
  "
  echo "✓ rollback aplicado"
  exit 0
fi

# ─── [0] PRE-CHECK ───────────────────────────────────────────────────────
echo "▶ [0] PRE-CHECK"
if [ "$SKIP_PRE_CHECK" -eq 0 ]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "  ⚠ working tree tem mudanças não commitadas:"
    git status --short
    echo "  use --skip-pre-check pra ignorar (não recomendado)"
    exit 1
  fi
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  echo "  branch: $BRANCH"
  echo "  commit local: $GIT_SHA"
  echo "  produção atual: $PREV_REMOTE_SHA"
else
  echo "  pulado (--skip-pre-check)"
fi

# ─── [1] SANITIZE + [2] STAMP + [3] BUILD ────────────────────────────────
if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "▶ [1] SANITIZE — rm -rf .next/ node_modules/.cache/"
  rm -rf .next node_modules/.cache 2>/dev/null || true

  echo "▶ [2] STAMP — gerando BUILD_ID via prebuild + next.config.js"
  # npm run build dispara prebuild (que escreve public/build-id.txt)
  # E next.config.js gera generateBuildId baseado em git sha + timestamp
  echo "▶ [3] BUILD — npm run build"
  npm run build 2>&1 | tail -8
else
  echo "▶ [1-3] pulados (--skip-build)"
fi

# ─── [4] AUDIT-LOCAL ─────────────────────────────────────────────────────
echo "▶ [4] AUDIT-LOCAL"
[ -d .next/standalone ] || { echo "  ✗ .next/standalone ausente"; exit 1; }
[ -d .next/static ]    || { echo "  ✗ .next/static ausente"; exit 1; }
[ -f public/build-id.txt ] || { echo "  ⚠ public/build-id.txt ausente — gerando manualmente"; mkdir -p public && (echo "$GIT_SHA"; date -u +%s) > public/build-id.txt; }
LOCAL_BUILDID=$(head -1 public/build-id.txt)
echo "  local BUILD_ID stamp: $LOCAL_BUILDID"
echo "  .next/static dirs: $(ls .next/static | head -5 | tr '\n' ' ')"

# ─── [5] PUBLISH (rsync com --delete + excludes seguros) ─────────────────
echo "▶ [5] PUBLISH (rsync --delete --checksum, com excludes pra preservar runtime files)"

# 5.1) Backup .next atual em .next.previous (no servidor) pra rollback
ssh $SSH_OPTS "$DROPLET" "
  set -e
  cd $APP_PATH
  if [ -d .next ]; then
    rm -rf .next.previous
    cp -r .next .next.previous
  fi
" 2>&1 | tail -3 || echo "  ⚠ backup .next.previous falhou (provavelmente sem .next anterior)"

# 5.2) Standalone — sync com --delete mas EXCLUI:
#   - start.sh (mantido pelo systemd, rsynced separado abaixo)
#   - .env.local (vars de produção)
#   - public/ (vai sincronizar separado)
#   - .next/static/ (vai sincronizar separado pra ter --delete escopado)
echo "▶ [5.1] rsync standalone --delete"
rsync -avz --checksum --delete -e "$RSH" --partial --partial-dir=.rsync-partial --timeout=180 \
  --exclude='.env.local' \
  --exclude='start.sh' \
  --exclude='public' \
  --exclude='.next/static' \
  --exclude='.next.previous' \
  .next/standalone/ "$DROPLET:$APP_PATH/" 2>&1 | tail -3

# 5.3) Static — sync com --delete remove chunks órfãos de builds antigos
echo "▶ [5.2] rsync static --delete (remove chunks órfãos)"
rsync -avz --checksum --delete -e "$RSH" --partial --partial-dir=.rsync-partial --timeout=180 \
  .next/static/ "$DROPLET:$APP_PATH/.next/static/" 2>&1 | tail -3

# 5.4) Public — sync com --delete remove assets órfãos
echo "▶ [5.3] rsync public --delete"
rsync -avz --checksum --delete -e "$RSH" --partial --partial-dir=.rsync-partial --timeout=180 \
  public/ "$DROPLET:$APP_PATH/public/" 2>&1 | tail -3

# 5.5) start.sh — restaura caso tenha sumido (sem --delete)
echo "▶ [5.4] rsync start.sh"
rsync -avz -e "$RSH" --timeout=60 start.sh "$DROPLET:$APP_PATH/start.sh" 2>&1 | tail -2

# ─── [6] RESTART (stop → sleep → start → is-active) ──────────────────────
echo "▶ [6] RESTART (stop → sleep 2 → start → is-active)"
ssh $SSH_OPTS "$DROPLET" "
  set -e
  chown -R www-data:www-data $APP_PATH
  chmod +x $APP_PATH/start.sh
  systemctl reset-failed $SERVICE 2>/dev/null || true
  systemctl stop $SERVICE
  sleep 2
  systemctl start $SERVICE
  sleep 3
  systemctl is-active $SERVICE
" 2>&1 | tail -3

# ─── [7] PROVE ──────────────────────────────────────────────────────────
echo "▶ [7] PROVE — exigindo SIM em 3 perguntas"
sleep 2

# 1. BUILD_ID em produção é diferente do anterior?
LIVE_HTML=$(curl -fsS "https://$DOMAIN/" || echo "")
LIVE_STAMP=$(echo "$LIVE_HTML" | grep -oE '<!--[a-f0-9]+_[0-9]+-->' | head -1)
LIVE_BUILDID=$(echo "$LIVE_STAMP" | sed -E 's/<!--(.*)-->/\1/')
echo "  HTML stamp: $LIVE_STAMP"

# 2. HTML servido em / contém o SHA esperado?
if ! echo "$LIVE_BUILDID" | grep -q "^${GIT_SHA}_"; then
  echo "  ✗ HTML stamp não bate. esperado: <!--${GIT_SHA}_*-->"
  echo "  ! ROLLBACK SUGERIDO: bash scripts/deploy.sh --rollback"
  exit 2
fi
echo "  ✓ HTML stamp bate ($GIT_SHA)"

# 3. /api/build-info devolve o SHA esperado?
BI_RESP=$(curl -fsS "https://$DOMAIN/api/build-info" || echo "{}")
BI_SHA=$(echo "$BI_RESP" | sed -nE 's/.*"sha":"([^"]+)".*/\1/p')
if [ "$BI_SHA" != "$GIT_SHA" ]; then
  echo "  ✗ /api/build-info sha=$BI_SHA, esperado=$GIT_SHA"
  echo "  resposta completa: $BI_RESP"
  echo "  ! ROLLBACK SUGERIDO: bash scripts/deploy.sh --rollback"
  exit 2
fi
echo "  ✓ /api/build-info sha=$BI_SHA"

# Bonus: verifica que assets estáticos do build novo respondem 200
CSS_HREF=$(echo "$LIVE_HTML" | grep -oE '/_next/static/css/[a-f0-9]+\.css' | head -1)
if [ -n "$CSS_HREF" ]; then
  CSS_STATUS=$(curl -fsS -o /dev/null -w "%{http_code}" "https://$DOMAIN$CSS_HREF" || echo 0)
  echo "  ✓ CSS asset $CSS_HREF → $CSS_STATUS"
  [ "$CSS_STATUS" = "200" ] || { echo "  ✗ CSS não respondeu 200"; exit 2; }
fi

echo ""
echo "✓ DEPLOY PROVADO: $DOMAIN serve $GIT_SHA (anterior: $PREV_REMOTE_SHA)"
