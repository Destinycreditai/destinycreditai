export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import SetPasswordContent from './SetPasswordContent';

export default function SetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-pure-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-black">
                        Loading...
                    </h2>
                </div>
            </div>
        }>
            <SetPasswordContent />
        </Suspense>
    );
}