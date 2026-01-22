import { Email } from '../entities/Email';

export interface EmailRepository {
  create(email: Email): Promise<Email>;
  findById(id: string): Promise<Email | null>;
  markSent(id: string, sentAt: Date): Promise<void>;
  markFailed(id: string): Promise<void>;
  findScheduled(userId?: string): Promise<Email[]>;
  findSent(userId?: string): Promise<Email[]>;
  findByUserId(userId: string, status?: 'SCHEDULED' | 'SENT' | 'FAILED'): Promise<Email[]>;
}
