'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: `${formData.firstName} ${formData.lastName}`
                }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || `Signup failed (HTTP ${res.status})`);
            }

            // On successful signup, redirect to login page
            window.location.href = "/login";
            console.log('Signup data:', formData);
        } catch (err) {
            setError('Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h1 className="text-4xl font-bold text-center text-primary mb-6">jobpal.</h1>
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="flex space-x-4">
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing up...
                                </span> : 'Sign up'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="text-secondary hover:text-secondary">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}