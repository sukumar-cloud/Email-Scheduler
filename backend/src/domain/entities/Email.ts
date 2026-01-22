export class Email {
  id: string;
  userId?: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  sentAt?: Date;
  status: 'SCHEDULED' | 'SENT' | 'FAILED';
  jobId?: string;

  constructor(params: {
    id: string;
    userId?: string;
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: Date;
    sentAt?: Date;
    status: 'SCHEDULED' | 'SENT' | 'FAILED';
    jobId?: string;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.sender = params.sender;
    this.recipient = params.recipient;
    this.subject = params.subject;
    this.body = params.body;
    this.scheduledAt = params.scheduledAt;
    this.sentAt = params.sentAt;
    this.status = params.status;
    this.jobId = params.jobId;
  }
}
