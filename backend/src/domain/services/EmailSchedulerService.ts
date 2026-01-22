import { Email } from '../entities/Email';
import { EmailRepository } from '../repositories/EmailRepository';
import { EmailQueue } from '../../infra/queue/EmailQueue';

export class EmailSchedulerService {
  constructor(
    private emailRepo: EmailRepository,
    private queue: EmailQueue
  ) { }

  async schedule(email: Email): Promise<Email> {
    // Save to database first
    const savedEmail = await this.emailRepo.create(email);

    // Add to queue with delay
    await this.queue.add(savedEmail);

    return savedEmail;
  }

  async scheduleMultiple(emails: Email[]): Promise<Email[]> {
    const savedEmails: Email[] = [];

    for (const email of emails) {
      const saved = await this.schedule(email);
      savedEmails.push(saved);
    }

    return savedEmails;
  }
}
