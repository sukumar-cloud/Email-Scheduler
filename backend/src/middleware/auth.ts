import { Request, Response, NextFunction, RequestHandler } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
        avatar?: string;
    };
}

export const requireAuth: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authReq = req as AuthenticatedRequest;
    const isAuthenticated = (req as any).isAuthenticated?.bind(req);

    if (!isAuthenticated?.() || !authReq.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
};
