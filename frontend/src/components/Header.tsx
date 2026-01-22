'use client';

import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface HeaderProps {
    user: User;
}

export function Header({ user }: HeaderProps) {
    const handleLogout = async () => {
        try {
            await authAPI.logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-blue-600">📧 Outbox</div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name || user.email}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserIcon size={20} className="text-blue-600" />
                            </div>
                        )}
                        <div className="text-sm">
                            <div className="font-medium text-gray-900">{user.name || 'User'}</div>
                            <div className="text-gray-500">{user.email}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
