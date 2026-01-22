import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
        avatar?: string;
    };
}

export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.isAuthenticated() || !req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}
