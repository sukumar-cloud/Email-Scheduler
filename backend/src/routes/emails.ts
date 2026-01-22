import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { EmailRepositoryImpl } from '../infra/repositories/EmailRepositoryImpl';
import { EmailQueue } from '../infra/queue/EmailQueue';
import { EmailSchedulerService } from '../domain/services/EmailSchedulerService';
import { Email } from '../domain/entities/Email';
import { parseCSV } from '../utils/csvParser';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const emailRepo = new EmailRepositoryImpl();
const emailQueue = new EmailQueue();
const schedulerService = new EmailSchedulerService(emailRepo, emailQueue);

// Schedule emails
router.post('/schedule', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const {
            subject,
            body,
            emailsText,
            sender,
            startTime,
            delayBetweenEmails, // in seconds
            hourlyLimit,
        } = req.body;

        // Validation
        if (!subject || !body || !emailsText || !sender) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Parse emails from text/CSV
        const recipients = parseCSV(emailsText);
        if (recipients.length === 0) {
            res.status(400).json({ error: 'No valid email addresses found' });
            return;
        }

        // Parse start time
        const scheduledStartTime = startTime ? new Date(startTime) : new Date();
        const delayMs = (delayBetweenEmails || 10) * 1000; // Default 10 seconds

        // Create email objects with staggered scheduling
        const emails: Email[] = [];
        for (let i = 0; i < recipients.length; i++) {
            const scheduledAt = new Date(scheduledStartTime.getTime() + i * delayMs);

            const email = new Email({
                id: uuidv4(),
                userId: req.user!.id,
                sender,
                recipient: recipients[i],
                subject,
                body,
                scheduledAt,
                status: 'SCHEDULED',
                jobId: `email-${uuidv4()}`,
            });

            emails.push(email);
        }

        // Schedule all emails
        await schedulerService.scheduleMultiple(emails);

        res.json({
            message: 'Emails scheduled successfully',
            count: emails.length,
            startTime: scheduledStartTime,
            emails: emails.map(e => ({
                id: e.id,
                recipient: e.recipient,
                scheduledAt: e.scheduledAt,
            })),
        });
    } catch (error) {
        console.error('Error scheduling emails:', error);
        res.status(500).json({ error: 'Failed to schedule emails' });
    }
});

// Get scheduled emails
router.get('/scheduled', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const emails = await emailRepo.findByUserId(req.user!.id, 'SCHEDULED');
        res.json({ emails });
    } catch (error) {
        console.error('Error fetching scheduled emails:', error);
        res.status(500).json({ error: 'Failed to fetch scheduled emails' });
    }
});

// Get sent emails
router.get('/sent', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const emails = await emailRepo.findByUserId(req.user!.id, 'SENT');
        res.json({ emails });
    } catch (error) {
        console.error('Error fetching sent emails:', error);
        res.status(500).json({ error: 'Failed to fetch sent emails' });
    }
});


export default router;
