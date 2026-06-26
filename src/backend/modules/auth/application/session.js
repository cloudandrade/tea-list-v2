import crypto from 'crypto';

const COOKIE_NAME = 'tea_list_v2_session';
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.AUTH_SECRET || 'dev-secret-change-me';
}

function encodeBase64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(user) {
  const payload = encodeBase64Url({
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + ONE_WEEK_SECONDS,
  });

  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [payload, signature] = token.split('.');
  const expectedSignature = sign(payload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

  if (!data?.sub || data.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return data;
}

export function setSessionCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function getSessionCookie(cookieStore) {
  return cookieStore.get(COOKIE_NAME)?.value;
}
