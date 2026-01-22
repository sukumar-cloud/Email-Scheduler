'use client';

import React, { useState } from 'react';
import { X, Clock, Send, Paperclip, Bold, Italic, Underline, List, ListOrdered, AlignLeft, Link2, Image as ImageIcon } from 'lucide-react';
import { emailAPI } from '@/lib/api';
import type { ScheduleEmailRequest } from '@/types';

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ComposeModal({ isOpen, onClose, onSuccess }: ComposeModalProps) {
    const [formData, setFormData] = useState({
        sender: '',
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

            // Count emails
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
            onSuccess();
            onClose();

            // Reset form
            setFormData({
                sender: '',
                recipient: '',
                subject: '',
                body: '',
                emailsText: '',
                delayBetweenEmails: 0,
                hourlyLimit: 0,
                scheduledTime: '',
            });
            setEmailCount(0);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={20} className="text-gray-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">Compose New Email</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Attach file">
                            <Paperclip size={20} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Schedule">
                            <Clock size={20} className="text-gray-600" onClick={() => setShowSendLater(!showSendLater)} />
                        </button>
                        <button
                            onClick={() => handleSchedule()}
                            disabled={loading || !formData.sender || !formData.subject}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Send size={16} />
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Compose Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Email Fields */}
                        <div className="px-6 py-3 space-y-3 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-16">From</label>
                                <input
                                    type="email"
                                    value={formData.sender}
                                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                                    placeholder="oliver.brown@domain.io"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-16">To</label>
                                <input
                                    type="text"
                                    value={formData.recipient}
                                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                    placeholder="recipient@example.com or upload CSV"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label
                                    htmlFor="csv-upload"
                                    className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                >
                                    Upload CSV
                                </label>
                            </div>
                            {emailCount > 0 && (
                                <div className="text-sm text-green-600 ml-20">
                                    ✓ {emailCount} recipient{emailCount !== 1 ? 's' : ''} loaded
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-16">Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Subject"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Delay between 2 emails</label>
                                    <input
                                        type="number"
                                        value={formData.delayBetweenEmails}
                                        onChange={(e) => setFormData({ ...formData, delayBetweenEmails: parseInt(e.target.value) || 0 })}
                                        placeholder="00"
                                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Hourly Limit</label>
                                    <input
                                        type="number"
                                        value={formData.hourlyLimit}
                                        onChange={(e) => setFormData({ ...formData, hourlyLimit: parseInt(e.target.value) || 0 })}
                                        placeholder="00"
                                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rich Text Toolbar */}
                        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-1">
                            <button className="p-2 hover:bg-gray-100 rounded" title="Bold"><Bold size={16} className="text-gray-600" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Italic"><Italic size={16} className="text-gray-600" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Underline"><Underline size={16} className="text-gray-600" /></button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Align"><AlignLeft size={16} className="text-gray-600" /></button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Bullet List"><List size={16} className="text-gray-600" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Numbered List"><ListOrdered size={16} className="text-gray-600" /></button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Link"><Link2 size={16} className="text-gray-600" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Image"><ImageIcon size={16} className="text-gray-600" /></button>
                        </div>

                        {/* Body Editor */}
                        <div className="flex-1 px-6 py-4 overflow-auto">
                            <textarea
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Type Your Reply..."
                                className="w-full h-full resize-none focus:outline-none text-sm text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Right: Send Later Sidebar */}
                    {showSendLater && (
                        <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Later</h3>

                            <div className="space-y-2 mb-6">
                                <label className="text-sm text-gray-600">Pick date & time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => handleSchedule(getScheduleTime('tomorrow'))}
                                    className="w-full text-left px-4 py-3 hover:bg-white rounded-lg transition-colors text-sm text-gray-700"
                                >
                                    Tomorrow
                                </button>
                                <button
                                    onClick={() => handleSchedule(getScheduleTime('tomorrow_10'))}
                                    className="w-full text-left px-4 py-3 hover:bg-white rounded-lg transition-colors text-sm text-gray-700"
                                >
                                    Tomorrow, 10:00 AM
                                </button>
                                <button
                                    onClick={() => handleSchedule(getScheduleTime('tomorrow_11'))}
                                    className="w-full text-left px-4 py-3 hover:bg-white rounded-lg transition-colors text-sm text-gray-700"
                                >
                                    Tomorrow, 11:00 AM
                                </button>
                                <button
                                    onClick={() => handleSchedule(getScheduleTime('tomorrow_3pm'))}
                                    className="w-full text-left px-4 py-3 hover:bg-white rounded-lg transition-colors text-sm text-gray-700"
                                >
                                    Tomorrow, 3:00 PM
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-300 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSchedule(formData.scheduledTime)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors text-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
