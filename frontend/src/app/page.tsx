'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await authAPI.getCurrentUser();
    if (user) {
      router.push('/dashboard');
    } else {
      setChecking(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '48px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Login Heading */}
          <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', color: '#1F2937', marginBottom: '32px' }}>
            Login
          </h1>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#E8F5E9',
              border: '1px solid #C8E6C9',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#C8E6C9'}
            onMouseOut={(e) => e.currentTarget.style.background = '#E8F5E9'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4" />
              <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853" />
              <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40664 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05" />
              <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335" />
            </svg>
            <span style={{ fontSize: '14px', color: '#2E7D32', fontWeight: '500' }}>Login with Google</span>
          </button>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '24px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #E5E7EB' }}></div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '12px' }}>
              <span style={{ padding: '0 8px', background: '#FFFFFF', color: '#9CA3AF' }}>or sign up through email</span>
            </div>
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email ID"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1F2937',
                outline: 'none'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              placeholder="Password"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1F2937',
                outline: 'none'
              }}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={() => alert('Email/password login is not implemented. Please use Google Sign-In.')}
            style={{
              width: '100%',
              padding: '10px',
              background: '#66BB6A',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5CAF60'}
            onMouseOut={(e) => e.currentTarget.style.background = '#66BB6A'}
          >
            Login
          </button>

          <p style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center', color: '#9CA3AF' }}>
            Note: Email/password login is not implemented. Please use Google Sign-In.
          </p>
        </div>
      </div>
    </div>
  );
}
