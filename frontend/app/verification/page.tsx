'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch("http://localhost:4000/api/users/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, code }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || 'Verification failed');
            }

            if (payload.token) {
                localStorage.setItem('token', payload.token);
            }
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsResending(true);
        setError('');

        try {
            const res = await fetch("http://localhost:4000/api/users/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || 'Failed to resend code');
            }

        } catch (err: any) {
            setError(err.message || 'Failed to resend verification code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h1 className="text-4xl font-bold text-center text-primary mb-6">jobpal.</h1>
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold">
                        Verify your email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email and the verification code we sent you
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleVerification}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            required
                            maxLength={6}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 text-center text-2xl tracking-widest focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 6 || !email}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </div>

                    <div className="text-center space-y-2">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending || !email}
                            className="text-secondary hover:text-secondary disabled:opacity-50 block"
                        >
                            {isResending ? 'Sending...' : "Didn't receive code? Resend"}
                        </button>
                        <Link href="/login" className="text-secondary hover:text-secondary block">
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}