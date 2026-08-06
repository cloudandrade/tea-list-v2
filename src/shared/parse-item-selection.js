/**
 * Interpreta seleção no estilo de impressão:
 * - vírgula separa itens/grupos: 6,8,12
 * - hífen indica faixa inclusiva: 48-52
 * - combinação: 2,8,16,22-28
 */
export function parseItemSelection(input, { maxNumber } = {}) {
  const raw = String(input || '').trim();

  if (!raw) {
    return { ok: false, message: 'Informe os números dos itens (ex.: 2,8,16,22-28).' };
  }

  if (!/^[\d\s,\-]+$/.test(raw)) {
    return {
      ok: false,
      message: 'Use apenas números, vírgulas e hífens (ex.: 2,8,16,22-28).',
    };
  }

  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { ok: false, message: 'Informe os números dos itens (ex.: 2,8,16,22-28).' };
  }

  const numbers = new Set();

  for (const part of parts) {
    if (part.includes('-')) {
      const rangeParts = part.split('-').map((value) => value.trim()).filter(Boolean);

      if (rangeParts.length !== 2) {
        return {
          ok: false,
          message: `Faixa inválida: "${part}". Use o formato início-fim (ex.: 22-28).`,
        };
      }

      const start = Number(rangeParts[0]);
      const end = Number(rangeParts[1]);

      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1) {
        return {
          ok: false,
          message: `Faixa inválida: "${part}". Use números inteiros a partir de 1.`,
        };
      }

      if (end < start) {
        return {
          ok: false,
          message: `Faixa inválida: "${part}". O número final deve ser maior ou igual ao inicial.`,
        };
      }

      for (let current = start; current <= end; current += 1) {
        numbers.add(current);
      }
      continue;
    }

    const number = Number(part);

    if (!Number.isInteger(number) || number < 1) {
      return {
        ok: false,
        message: `Número inválido: "${part}". Use inteiros a partir de 1.`,
      };
    }

    numbers.add(number);
  }

  const sortedNumbers = [...numbers].sort((left, right) => left - right);

  if (sortedNumbers.length === 0) {
    return { ok: false, message: 'Nenhum item válido foi informado.' };
  }

  if (maxNumber != null) {
    const outOfRange = sortedNumbers.filter((number) => number > maxNumber);

    if (outOfRange.length > 0) {
      return {
        ok: false,
        message: `Os números ${outOfRange.join(', ')} excedem a quantidade de itens (${maxNumber}).`,
      };
    }
  }

  return { ok: true, numbers: sortedNumbers };
}
