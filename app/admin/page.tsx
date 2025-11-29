'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
    uid: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
}

export default function AdminPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('educator');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!loading && (!user || userData?.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, userData, loading, router]);

    useEffect(() => {
        if (userData?.role === 'admin' && userData?.organizationId) {
            fetchUsers();
        }
    }, [userData]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/admin/users?organizationId=${userData.organizationId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!inviteEmail.trim()) {
            setError('Please enter an email address');
            return;
        }

        try {
            const res = await fetch('/api/admin/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    organizationId: userData.organizationId,
                    organizationName: userData.organizationName
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(`User ${inviteEmail} has been invited!`);
                setInviteEmail('');
                fetchUsers();
            } else {
                setError(data.error || 'Failed to invite user');
            }
        } catch (error) {
            setError('An error occurred while inviting the user');
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm('Are you sure you want to remove this user?')) return;

        try {
            const res = await fetch(`/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizationId: userData.organizationId }),
            });

            if (res.ok) {
                setSuccess('User removed successfully');
                fetchUsers();
            } else {
                setError('Failed to remove user');
            }
        } catch (error) {
            setError('An error occurred while removing the user');
        }
    };

    const handleUpdateRole = async (uid: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: newRole,
                    organizationId: userData.organizationId
                }),
            });

            if (res.ok) {
                setSuccess('User role updated successfully');
                fetchUsers();
            } else {
                setError('Failed to update user role');
            }
        } catch (error) {
            setError('An error occurred while updating the user role');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user || userData?.role !== 'admin') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-600">Manage users and organization settings</p>
                    </header>

                    {error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}

                    {/* Invite User */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Invite User</h2>
                        <form onSubmit={handleInviteUser} className="flex gap-4">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Email address"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="educator">Educator</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                Invite
                            </button>
                        </form>
                    </div>

                    {/* User List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Organization Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((u) => (
                                        <tr key={u.uid}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                    disabled={u.uid === user.uid}
                                                >
                                                    <option value="educator">Educator</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {u.uid !== user.uid && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.uid)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
