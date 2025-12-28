"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, userData, loading } = useAuth();

    const handleSignOut = async () => {
        try {
            if (auth) {
                await signOut(auth);
                router.push('/login');
            }
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const links = [
        { href: '/dashboard', label: 'Stream' },
        { href: '/chat', label: 'Messages' },
        { href: '/calendar', label: 'Calendar' },
        { href: '/ai-assistant', label: 'AI Assistant' },
        ...(userData?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
    ];

    return (
        <div className="w-64 bg-gradient-to-b from-gray-900 via-purple-900/50 to-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col p-4 border-r border-purple-500/20">
            <h1 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">LumFlare</h1>
            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`p-3 rounded-lg transition-all ${pathname === link.href
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                            : 'hover:bg-white/10 text-gray-300 hover:text-white'
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto space-y-4">
                <div className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                    <p className="text-sm text-gray-400">Logged in as</p>
                    <p className="font-medium">
                        {loading ? "Loading..." : userData?.name || user?.displayName || user?.email || "Teacher User"}
                    </p>
                    {userData?.organizationName && (
                        <p className="text-xs text-gray-500 mt-1 truncate" title={userData.organizationName}>
                            {userData.organizationName}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full p-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-500/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
