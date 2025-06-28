import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 text-slate-50 text-center">
            <h1 className="text-9xl m-0">404</h1>
            <h2 className="text-3xl my-4">Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <Link 
                href="/" 
                className="mt-8 px-6 py-3 bg-masjid-green text-white rounded-lg no-underline font-medium hover:bg-emerald-900 transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
}