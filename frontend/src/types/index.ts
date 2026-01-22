export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    googleId: string;
}

export interface Email {
    id: string;
    userId: string;
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: string;
    sentAt?: string;
    status: 'SCHEDULED' | 'SENT' | 'FAILED';
    jobId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleEmailRequest {
    subject: string;
    body: string;
    emailsText: string;
    sender: string;
    startTime?: string;
    delayBetweenEmails?: number;
    hourlyLimit?: number;
}

export interface ScheduleEmailResponse {
    message: string;
    count: number;
    startTime: string;
    emails: Array<{
        id: string;
        recipient: string;
        scheduledAt: string;
    }>;
}

export interface EmailsResponse {
    emails: Email[];
}

export interface UserResponse {
    user: User;
}
