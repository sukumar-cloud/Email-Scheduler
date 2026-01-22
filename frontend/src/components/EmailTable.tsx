'use client';

import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/Table';
import { format } from 'date-fns';
import { Clock, Mail } from 'lucide-react';
import type { Email } from '@/types';

interface EmailTableProps {
    emails: Email[];
    loading: boolean;
    type: 'scheduled' | 'sent';
}

export function EmailTable({ emails, loading, type }: EmailTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {type === 'scheduled' ? (
                        <Clock className="text-gray-400" size={32} />
                    ) : (
                        <Mail className="text-gray-400" size={32} />
                    )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No {type} emails
                </h3>
                <p className="text-gray-500">
                    {type === 'scheduled'
                        ? 'Schedule your first email campaign to get started'
                        : 'Sent emails will appear here'}
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>{type === 'scheduled' ? 'Scheduled For' : 'Sent At'}</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {emails.map((email) => (
                    <TableRow key={email.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                {email.recipient}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{email.subject}</div>
                        </TableCell>
                        <TableCell>
                            {type === 'scheduled' && email.scheduledAt
                                ? format(new Date(email.scheduledAt), 'MMM d, yyyy h:mm a')
                                : email.sentAt
                                    ? format(new Date(email.sentAt), 'MMM d, yyyy h:mm a')
                                    : '-'}
                        </TableCell>
                        <TableCell>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${email.status === 'SENT'
                                        ? 'bg-green-100 text-green-800'
                                        : email.status === 'SCHEDULED'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {email.status}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
