import { Request, Response, NextFunction } from 'express';
import { admin } from '../core/firebase/firebase.admin';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Middleware to verify Firebase ID token from Authorization header
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.userId = decodedToken.uid;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
