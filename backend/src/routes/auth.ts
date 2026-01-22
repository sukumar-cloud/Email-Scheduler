import { Router } from 'express';
import passport from '../config/auth';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initiate Google OAuth
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}?error=auth_failed`,
    }),
    (req, res) => {
        // Successful authentication
        res.redirect(`${FRONTEND_URL}/dashboard`);
    }
);

// Get current user
router.get('/me', (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            res.status(500).json({ error: 'Logout failed' });
            return;
        }
        res.json({ message: 'Logged out successfully' });
    });
});

export default router;
