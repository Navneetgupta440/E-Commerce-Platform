import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'novacart-mern-super-secret-jwt-token-key-2025';

export interface TokenPayload {
  id: string;
  role: 'user' | 'admin';
}

/**
 * Generates signed JSON Web Token valid for 30 days.
 */
export function generateToken(id: string, role: 'user' | 'admin'): string {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * Verifies given JWT token and returns decoded payload.
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
