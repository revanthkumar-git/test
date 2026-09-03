import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required to access this resource.',
    });
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired access token.',
    });
    return;
  }
};