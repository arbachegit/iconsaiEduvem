#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  post-deploy-verify.sh — prova de frescor independente do deploy.sh
# ═══════════════════════════════════════════════════════════════════════
#
# Uso:
#   bash scripts/post-deploy-verify.sh                    # usa HEAD local
#   bash scripts/post-deploy-verify.sh <expected-sha>     # checa contra sha custom
#
# Sai com:
#   0 — produção serve o SHA esperado
#   2 — DEPLOY FANTASMA (sha em prod não bate)
#   3 — endpoint inalcançável
set -euo pipefail

DOMAIN="eduvem.iconsai.ai"
EXPECTED_SHA="${1:-$(git rev-parse --short HEAD)}"

cd "$(dirname "$0")/.."

echo "▶ verificando https://$DOMAIN contra commit $EXPECTED_SHA"

# Endpoint /api/build-info (fonte de verdade)
BI_RESP=$(curl -fsS --max-time 15 "https://$DOMAIN/api/build-info" 2>&1 || true)
if [ -z "$BI_RESP" ] || ! echo "$BI_RESP" | grep -q '"sha"'; then
  echo "  ✗ /api/build-info inalcançável ou sem campo sha"
  echo "  resposta: $BI_RESP"
  exit 3
fi
BI_SHA=$(echo "$BI_RESP" | sed -nE 's/.*"sha":"([^"]+)".*/\1/p')
BI_BUILD=$(echo "$BI_RESP" | sed -nE 's/.*"buildId":"([^"]+)".*/\1/p')

# HTML stamp (segunda fonte)
LIVE_HTML=$(curl -fsS --max-time 15 "https://$DOMAIN/" 2>&1 || true)
LIVE_STAMP=$(echo "$LIVE_HTML" | grep -oE '<!--[a-f0-9]+_[0-9]+-->' | head -1 || echo "")

echo "  /api/build-info: sha=$BI_SHA buildId=$BI_BUILD"
echo "  HTML stamp:      $LIVE_STAMP"
echo "  esperado:        $EXPECTED_SHA"

if [ "$BI_SHA" != "$EXPECTED_SHA" ]; then
  echo ""
  echo "✗ DEPLOY FANTASMA: produção serve sha=$BI_SHA, esperado=$EXPECTED_SHA"
  echo "  ROLLBACK: bash scripts/deploy.sh --rollback"
  exit 2
fi

# Cross-check com HTML
if ! echo "$LIVE_STAMP" | grep -q "^<!--${EXPECTED_SHA}_"; then
  echo ""
  echo "⚠ /api/build-info bate mas HTML stamp diverge — possível dessync server.js vs static."
  echo "  HTML stamp: $LIVE_STAMP"
  exit 2
fi

# Bonus: CSS asset
CSS_HREF=$(echo "$LIVE_HTML" | grep -oE '/_next/static/css/[a-f0-9]+\.css' | head -1)
if [ -n "$CSS_HREF" ]; then
  CSS_STATUS=$(curl -fsS --max-time 10 -o /dev/null -w "%{http_code}" "https://$DOMAIN$CSS_HREF" || echo 0)
  if [ "$CSS_STATUS" != "200" ]; then
    echo "✗ CSS asset $CSS_HREF respondeu $CSS_STATUS (esperado 200) — chunks órfãos?"
    exit 2
  fi
  echo "  ✓ CSS asset $CSS_HREF → 200"
fi

echo ""
echo "✓ Deploy provado: $DOMAIN serve $EXPECTED_SHA"
