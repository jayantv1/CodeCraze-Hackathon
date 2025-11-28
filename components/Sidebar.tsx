'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        { href: '/dashboard', label: 'Stream' },
        { href: '/chat', label: 'Messages' },
        { href: '/calendar', label: 'Calendar' },
        { href: '/groups', label: 'Groups' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col p-4">
            <h1 className="text-2xl font-bold mb-8 text-blue-400">TeacherHub</h1>
            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`p-3 rounded-lg transition-colors ${pathname === link.href
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-800 text-gray-300'
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">Logged in as</p>
                    <p className="font-medium">Teacher User</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
