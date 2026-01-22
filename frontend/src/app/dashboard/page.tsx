'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, emailAPI } from '@/lib/api';
import type { User, Email } from '@/types';
import { format } from 'date-fns';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
    const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
    const [sentEmails, setSentEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const currentUser = await authAPI.getCurrentUser();
        if (!currentUser) {
            router.push('/');
            return;
        }
        setUser(currentUser);
        await fetchEmails();
    };

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const [scheduled, sent] = await Promise.all([
                emailAPI.getScheduledEmails(),
                emailAPI.getSentEmails(),
            ]);
            setScheduledEmails(scheduled);
            setSentEmails(sent);
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authAPI.logout();
        router.push('/');
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const emails = activeTab === 'scheduled' ? scheduledEmails : sentEmails;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFA' }}>
            {/* Left Sidebar */}
            <div style={{
                width: '260px',
                minHeight: '900px',
                background: '#FFFFFF',
                borderRight: '1px solid #E5E7EB',
                paddingTop: '20px',
                paddingRight: '16px',
                paddingBottom: '8px',
                paddingLeft: '8px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Logo */}
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '32px' }}>OUTBOX EMAIL</h1>

                {/* User Profile */}
                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#4F46E5' }}>
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{user.name || 'User'}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginLeft: '40px' }}>{user.email}</div>
                </div>

                {/* Compose Button */}
                <button
                    onClick={() => router.push('/compose')}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '24px'
                    }}
                >
                    Compose
                </button>

                {/* Navigation */}
                <div style={{ marginBottom: '16px', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    CORE
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: activeTab === 'scheduled' ? '#F3F4F6' : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            color: activeTab === 'scheduled' ? '#1F2937' : '#6B7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <span>📅 Scheduled</span>
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{scheduledEmails.length}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('sent')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: activeTab === 'sent' ? '#F3F4F6' : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            color: activeTab === 'sent' ? '#1F2937' : '#6B7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <span>✈️ Sent</span>
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{sentEmails.length}</span>
                    </button>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: 'auto',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    🚪 Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar */}
                <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search"
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                background: '#F9FAFB',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔍</span>
                    </div>
                    <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>⚙️</button>
                    <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>🔔</button>
                </div>

                {/* Email List */}
                <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : emails.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#9CA3AF' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No {activeTab} emails</div>
                            <div style={{ fontSize: '14px' }}>Click "Compose" to schedule your first email</div>
                        </div>
                    ) : (
                        <div>
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    onClick={() => setSelectedEmail(email)}
                                    style={{
                                        background: '#FFFFFF',
                                        borderBottom: '1px solid #F3F4F6',
                                        padding: '16px 24px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>To: {email.recipient}</span>
                                                <span style={{ fontSize: '12px', padding: '2px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '4px' }}>
                                                    {activeTab === 'scheduled' ? '⏰ ' + format(new Date(email.scheduledAt), 'h:mm a') : '✓ Sent'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>{email.subject}</div>
                                            <div style={{ fontSize: '13px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '600px' }}>
                                                {(() => {
                                                    let bodyText = email.body;

                                                    // Parse JSON if needed
                                                    if (bodyText.startsWith('{') || bodyText.startsWith('[')) {
                                                        try {
                                                            const parsed = JSON.parse(bodyText);
                                                            if (parsed.text && Array.isArray(parsed.text)) {
                                                                bodyText = parsed.text.map((item: any) => item.content || '').join(' ');
                                                            }
                                                        } catch (e) {
                                                            // Use original if parsing fails
                                                        }
                                                    }

                                                    // Remove line breaks and trim
                                                    return bodyText.replace(/\n/g, ' ').trim();
                                                })()}
                                            </div>
                                        </div>
                                        <button style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>⭐</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* Email Detail View */}
            {selectedEmail && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50
                    }}
                    onClick={() => setSelectedEmail(null)}
                >
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            maxWidth: '800px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => setSelectedEmail(null)}
                                style={{
                                    padding: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    fontSize: '20px'
                                }}
                            >
                                ←
                            </button>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', flex: 1 }}>
                                {selectedEmail.subject}
                            </h2>
                            <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>⭐</button>
                            <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>🗑️</button>
                            <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>👤</button>
                        </div>

                        {/* Email Content */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                            {/* Sender Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#10B981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#FFFFFF'
                                    }}>
                                        {selectedEmail.sender.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                                            {selectedEmail.sender.split('@')[0]}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                            &lt;{selectedEmail.sender}&gt;
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                                            to me
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                        {format(new Date(selectedEmail.scheduledAt), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>

                            {/* Email Body */}
                            <div style={{ fontSize: '14px', color: '#1F2937', lineHeight: '1.8' }}>
                                {(() => {
                                    let bodyText = selectedEmail.body;

                                    // Check if body is JSON format
                                    if (bodyText.startsWith('{') || bodyText.startsWith('[')) {
                                        try {
                                            const parsed = JSON.parse(bodyText);
                                            if (parsed.text && Array.isArray(parsed.text)) {
                                                // Extract plain text from JSON structure
                                                bodyText = parsed.text.map((item: any) => item.content || '').join('\n\n');
                                            }
                                        } catch (e) {
                                            // If parsing fails, use original text
                                        }
                                    }

                                    return bodyText.split('\n').map((line, index) => {
                                        // Check if line contains the highlighted text pattern
                                        if (line.includes('⚡') || line.includes('Extremely Exclusive')) {
                                            return (
                                                <div key={index} style={{
                                                    background: '#FEF9C3',
                                                    border: '2px solid #FDE047',
                                                    borderLeft: '4px solid #FACC15',
                                                    padding: '12px 16px',
                                                    margin: '16px 0',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    color: '#713F12',
                                                    fontWeight: '500'
                                                }}>
                                                    {line}
                                                </div>
                                            );
                                        }
                                        // Check if line starts with "To explore" (continuation of highlight)
                                        if (line.includes('FLY OUT FIX') || line.includes('To explore securing')) {
                                            return (
                                                <div key={index} style={{
                                                    background: '#FEF9C3',
                                                    border: '2px solid #FDE047',
                                                    borderLeft: '4px solid #FACC15',
                                                    padding: '12px 16px',
                                                    margin: '16px 0',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    color: '#713F12'
                                                }}>
                                                    {line}
                                                </div>
                                            );
                                        }
                                        // Check if line starts with P.S. (make it italic)
                                        if (line.startsWith('P.S.')) {
                                            return (
                                                <div key={index} style={{
                                                    fontStyle: 'italic',
                                                    color: '#6B7280',
                                                    marginTop: '16px'
                                                }}>
                                                    {line}
                                                </div>
                                            );
                                        }
                                        // Regular line
                                        return line ? <div key={index} style={{ marginBottom: '8px' }}>{line}</div> : <div key={index} style={{ height: '8px' }} />;
                                    });
                                })()}
                            </div>

                            {/* Status Badge */}
                            {selectedEmail.status === 'SCHEDULED' && (
                                <div style={{
                                    marginTop: '24px',
                                    padding: '12px 16px',
                                    background: '#FEF3C7',
                                    border: '1px solid #FDE68A',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: '#92400E'
                                }}>
                                    ⏰ <strong>Scheduled for:</strong> {format(new Date(selectedEmail.scheduledAt), 'MMMM d, yyyy \'at\' h:mm a')}
                                </div>
                            )}

                            {selectedEmail.status === 'SENT' && selectedEmail.sentAt && (
                                <div style={{
                                    marginTop: '24px',
                                    padding: '12px 16px',
                                    background: '#D1FAE5',
                                    border: '1px solid #A7F3D0',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: '#065F46'
                                }}>
                                    ✓ <strong>Sent on:</strong> {format(new Date(selectedEmail.sentAt), 'MMMM d, yyyy \'at\' h:mm a')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
