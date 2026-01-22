import { Email } from '../../domain/entities/Email';
import { EmailRepository } from '../../domain/repositories/EmailRepository';
import { prisma } from '../../config/database';

export class EmailRepositoryImpl implements EmailRepository {
  async create(email: Email): Promise<Email> {
    const created = await prisma.email.create({
      data: {
        id: email.id,
        userId: email.userId!,
        sender: email.sender,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        scheduledAt: email.scheduledAt,
        status: email.status,
        jobId: email.jobId,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Email | null> {
    const email = await prisma.email.findUnique({ where: { id } });
    return email ? this.mapToEntity(email) : null;
  }

  async markSent(id: string, sentAt: Date): Promise<void> {
    await prisma.email.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt,
      },
    });
  }

  async markFailed(id: string): Promise<void> {
    await prisma.email.update({
      where: { id },
      data: { status: 'FAILED' },
    });
  }

  async findScheduled(userId?: string): Promise<Email[]> {
    const emails = await prisma.email.findMany({
      where: {
        status: 'SCHEDULED',
        ...(userId && { userId }),
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return emails.map(this.mapToEntity);
  }

  async findSent(userId?: string): Promise<Email[]> {
    const emails = await prisma.email.findMany({
      where: {
        status: 'SENT',
        ...(userId && { userId }),
      },
      orderBy: { sentAt: 'desc' },
    });

    return emails.map(this.mapToEntity);
  }

  async findByUserId(userId: string, status?: 'SCHEDULED' | 'SENT' | 'FAILED'): Promise<Email[]> {
    const emails = await prisma.email.findMany({
      where: {
        userId,
        ...(status && { status: status?.toUpperCase() }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return emails.map(this.mapToEntity);
  }

  async findByStatus(status: 'SCHEDULED' | 'SENT' | 'FAILED'): Promise<Email[]> {
    const emails = await prisma.email.findMany({
      where: {
        status: status?.toUpperCase(),
      },
      orderBy: { createdAt: 'desc' },
    });

    return emails.map(this.mapToEntity);
  }

  private mapToEntity(data: any): Email {
    return new Email({
      id: data.id,
      userId: data.userId,
      sender: data.sender,
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      scheduledAt: data.scheduledAt,
      sentAt: data.sentAt,
      status: data.status,
      jobId: data.jobId,
    });
  }
}
