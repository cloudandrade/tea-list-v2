export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateNewUser(input) {
  const name = String(input?.name || '').trim();
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || '');

  if (name.length < 2) {
    return 'Informe seu nome completo.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Informe um e-mail válido.';
  }

  if (password.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  return null;
}
