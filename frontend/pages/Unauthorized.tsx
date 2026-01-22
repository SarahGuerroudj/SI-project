/**
 * Unauthorized Page
 * ==================
 * Displayed when users access restricted resources
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="text-center max-w-md">
                <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20">
                    <ShieldOff className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Access Denied
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    You don't have permission to access this resource.
                </p>

                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
