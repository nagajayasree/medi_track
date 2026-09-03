import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

interface MediTrackJwtPayload {
  userId: string;
}

function isMediTrackJwtPayload(
  payload: unknown,
): payload is MediTrackJwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    typeof (payload as { userId: unknown }).userId === 'string'
  );
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ error: 'JWT secret is not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!isMediTrackJwtPayload(decoded)) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
