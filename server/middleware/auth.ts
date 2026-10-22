import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Users, IUserDocument } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: Omit<IUserDocument, 'password'>;
}

/**
 * Middleware to protect private routes by verifying JWT token in Authorization header.
 */
export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);

      const user = await Users.findById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'User belonging to this token no longer exists' });
        return;
      }

      // Strip hashed password from user object
      const { password, ...safeUser } = user;
      req.user = safeUser;
      next();
      return;
    } catch (error) {
      console.error('JWT verification failed:', error);
      res.status(401).json({ message: 'Not authorized, invalid or expired token' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }
}

/**
 * Middleware to verify that the authenticated user possesses the 'admin' role.
 */
export function admin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Administrator privileges required' });
  }
}
