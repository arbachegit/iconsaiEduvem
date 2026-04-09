/* ═══════════════════════════════════════════════════════════
   safe-eval — Avaliador matemático seguro pra expressões do
   textarea do ExerciseWindow quando o aluno termina com "=".

   Copiado verbatim do iconsaiStats.
   ═══════════════════════════════════════════════════════════ */

export function safeEval(expr: string): number | null {
  if (!expr || typeof expr !== 'string') return null;

  // Normaliza: vírgula decimal brasileira → ponto
  const normalized = expr.replace(/,/g, '.').trim();

  // Whitelist rígida: só chars matemáticos
  if (!/^[\d+\-*/.()\s^]+$/.test(normalized)) return null;

  // Não pode ter três operadores seguidos
  if (/[+\-*/^]{3,}/.test(normalized)) return null;

  // Converte ^ em ** (potência JS)
  const jsExpr = normalized.replace(/\^/g, '**');

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${jsExpr})`)();
    if (typeof result !== 'number') return null;
    if (!isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

/** Formata um resultado numérico pra exibição amigável. */
export function formatResult(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const abs = Math.abs(n);
  if (abs >= 0.01 && abs < 1e6) {
    return n.toFixed(4).replace(/\.?0+$/, '');
  }
  return n.toPrecision(6);
}
