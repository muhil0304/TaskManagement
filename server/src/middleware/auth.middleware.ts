import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'default-jwt-secret-key-change-me-in-production';
    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token is invalid or expired' });
  }
};