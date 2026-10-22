import { Request, Response, NextFunction } from 'express';

/**
 * Fallback 404 handler for unknown API routes.
 */
export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error = new Error(`API endpoint not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Standard centralized Express error handler.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}
