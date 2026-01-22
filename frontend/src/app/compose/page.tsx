'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Paperclip, Clock, Send } from 'lucide-react';
import { emailAPI } from '@/lib/api';
import type { ScheduleEmailRequest } from '@/types';

export default function ComposePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        sender: 'oliver.brown@domain.io',
        recipient: '',
        subject: '',
        body: '',
        emailsText: '',
        delayBetweenEmails: 0,
        hourlyLimit: 0,
        scheduledTime: '',
    });
    const [emailCount, setEmailCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSendLater, setShowSendLater] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setFormData({ ...formData, emailsText: text });

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const matches = text.match(emailRegex);
            setEmailCount(matches ? new Set(matches).size : 0);
        };
        reader.readAsText(file);
    };

    const handleSchedule = async (time?: string) => {
        setError('');
        setLoading(true);

        try {
            const data: ScheduleEmailRequest = {
                subject: formData.subject,
                body: formData.body,
                emailsText: formData.emailsText || formData.recipient,
                sender: formData.sender,
                startTime: time || formData.scheduledTime || new Date().toISOString(),
                delayBetweenEmails: formData.delayBetweenEmails,
                hourlyLimit: formData.hourlyLimit,
            };

            await emailAPI.scheduleEmails(data);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to schedule emails');
        } finally {
            setLoading(false);
        }
    };

    const getScheduleTime = (option: string): string => {
        const now = new Date();
        switch (option) {
            case 'tomorrow':
                now.setDate(now.getDate() + 1);
                now.setHours(9, 0, 0, 0);
                break;
            case 'tomorrow_10':
                now.setDate(now.getDate() + 1);
                now.setHours(10, 0, 0, 0);
                break;
            case 'tomorrow_11':
                now.setDate(now.getDate() + 1);
                now.setHours(11, 0, 0, 0);
                break;
            case 'tomorrow_3pm':
                now.setDate(now.getDate() + 1);
                now.setHours(15, 0, 0, 0);
                break;
        }
        return now.toISOString();
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FFFFFF' }}>
            {/* Main Compose Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    borderBottom: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => router.push('/dashboard')}
                            style={{
                                padding: '4px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px'
                            }}
                        >
                            <ArrowLeft size={18} style={{ color: '#374151' }} />
                        </button>
                        <h1 style={{ fontSize: '14px', fontWeight: '400', color: '#111827', margin: 0 }}>
                            Compose New Email
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => document.getElementById('csv-upload')?.click()}
                            style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                            title="Upload CSV or TXT file"
                        >
                            <Paperclip size={18} style={{ color: '#6B7280' }} />
                        </button>
                        <button
                            onClick={() => setShowSendLater(!showSendLater)}
                            style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        >
                            <Clock size={18} style={{ color: '#6B7280' }} />
                        </button>
                        <button
                            onClick={() => handleSchedule()}
                            disabled={loading || !formData.sender || !formData.subject}
                            style={{
                                padding: '6px 16px',
                                background: '#FFFFFF',
                                border: '1px solid #10B981',
                                color: '#10B981',
                                borderRadius: '6px',
                                fontSize: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: (loading || !formData.sender || !formData.subject) ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ margin: '16px 24px', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                {/* Email Fields */}
                <div style={{ padding: '32px 64px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ fontSize: '14px', color: '#374151', width: '120px', textAlign: 'right', paddingRight: '24px' }}>
                            From
                        </label>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <input
                                type="email"
                                value={formData.sender}
                                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                                placeholder="oliver.brown@domain.io"
                                style={{
                                    flex: 1,
                                    padding: '4px 0',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#111827'
                                }}
                            />
                            <button style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                                ×
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ fontSize: '14px', color: '#374151', width: '120px', textAlign: 'right', paddingRight: '24px' }}>
                            To
                        </label>
                        <input
                            type="text"
                            value={formData.recipient}
                            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                            placeholder="recipient@example.com"
                            style={{
                                flex: 1,
                                padding: '4px 0',
                                border: 'none',
                                outline: 'none',
                                fontSize: '14px',
                                color: '#9CA3AF'
                            }}
                        />
                    </div>

                    {emailCount > 0 && (
                        <div style={{ marginLeft: '144px', fontSize: '14px', color: '#10B981' }}>
                            ✓ {emailCount} recipient{emailCount !== 1 ? 's' : ''} loaded
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ fontSize: '14px', color: '#374151', width: '120px', textAlign: 'right', paddingRight: '24px' }}>
                            Subject
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Subject"
                            style={{
                                flex: 1,
                                padding: '4px 0',
                                border: 'none',
                                outline: 'none',
                                fontSize: '14px',
                                color: '#9CA3AF'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '144px', gap: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{ fontSize: '14px', color: '#374151' }}>Delay between 2 emails</label>
                            <input
                                type="number"
                                value={formData.delayBetweenEmails}
                                onChange={(e) => setFormData({ ...formData, delayBetweenEmails: parseInt(e.target.value) || 0 })}
                                placeholder="00"
                                style={{
                                    width: '64px',
                                    padding: '4px 8px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}
                                min="0"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{ fontSize: '14px', color: '#374151' }}>Hourly Limit</label>
                            <input
                                type="number"
                                value={formData.hourlyLimit}
                                onChange={(e) => setFormData({ ...formData, hourlyLimit: parseInt(e.target.value) || 0 })}
                                placeholder="00"
                                style={{
                                    width: '64px',
                                    padding: '4px 8px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Body Editor */}
                <div style={{ flex: 1, padding: '0 64px 32px 64px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, border: '1px solid #D1D5DB', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Toolbar */}
                        <div style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #D1D5DB',
                            background: '#F9FAFB',
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center'
                        }}>
                            <button style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>B</span>
                            </button>
                            <button style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                <span style={{ fontSize: '14px', fontStyle: 'italic' }}>I</span>
                            </button>
                            <button style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                <span style={{ fontSize: '14px', textDecoration: 'underline' }}>U</span>
                            </button>
                        </div>

                        {/* Text Area */}
                        <div style={{ flex: 1, padding: '16px', background: '#FFFFFF' }}>
                            <textarea
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Type Your Reply..."
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    outline: 'none',
                                    resize: 'none',
                                    fontSize: '14px',
                                    color: '#374151',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.6'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Later Sidebar */}
            {showSendLater && (
                <div style={{
                    width: '288px',
                    borderLeft: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '24px', flex: 1 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '24px', marginTop: 0 }}>
                            Send Later
                        </h3>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '8px' }}>
                                Pick date & time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledTime}
                                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <button
                                onClick={() => handleSchedule(getScheduleTime('tomorrow'))}
                                style={{
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}
                            >
                                Tomorrow
                            </button>
                            <button
                                onClick={() => handleSchedule(getScheduleTime('tomorrow_10'))}
                                style={{
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}
                            >
                                Tomorrow, 10:00 AM
                            </button>
                            <button
                                onClick={() => handleSchedule(getScheduleTime('tomorrow_11'))}
                                style={{
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}
                            >
                                Tomorrow, 11:00 AM
                            </button>
                            <button
                                onClick={() => handleSchedule(getScheduleTime('tomorrow_3pm'))}
                                style={{
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}
                            >
                                Tomorrow, 3:00 PM
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '24px', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowSendLater(false)}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: '#FFFFFF',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSchedule(formData.scheduledTime)}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: '#10B981',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    color: '#FFFFFF',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden file upload */}
            <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="csv-upload"
            />
        </div>
    );
}
