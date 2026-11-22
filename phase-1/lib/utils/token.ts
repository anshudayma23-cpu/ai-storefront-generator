import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyToken(token: string, hashedToken: string): boolean {
  const incomingHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashedToken));
}
