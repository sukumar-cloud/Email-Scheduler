import axios from 'axios';
import type { User, Email, ScheduleEmailRequest, ScheduleEmailResponse, EmailsResponse, UserResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authAPI = {
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const response = await api.get<UserResponse>('/api/auth/me');
            return response.data.user;
        } catch (error) {
            return null;
        }
    },

    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
    },

    getGoogleAuthUrl: (): string => {
        return `${API_URL}/api/auth/google`;
    },
};

export const emailAPI = {
    scheduleEmails: async (data: ScheduleEmailRequest): Promise<ScheduleEmailResponse> => {
        const response = await api.post<ScheduleEmailResponse>('/api/emails/schedule', data);
        return response.data;
    },

    getScheduledEmails: async (): Promise<Email[]> => {
        const response = await api.get<EmailsResponse>('/api/emails/scheduled');
        return response.data.emails;
    },

    getSentEmails: async (): Promise<Email[]> => {
        const response = await api.get<EmailsResponse>('/api/emails/sent');
        return response.data.emails;
    },
};

export default api;
