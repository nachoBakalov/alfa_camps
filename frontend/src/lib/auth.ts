type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

export function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new Error('Invalid JWT token');
  }

  const payloadJson = decodeBase64Url(parts[1]);
  const payload = JSON.parse(payloadJson) as JwtPayload;

  return payload;
}
