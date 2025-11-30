'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProfileModal from '@/components/ProfileModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

export default function AdminPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('educator');
    const [invitePosition, setInvitePosition] = useState('');
    const [inviteLocation, setInviteLocation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

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
                    position: invitePosition,
                    location: inviteLocation,
                    organizationId: userData.organizationId,
                    organizationName: userData.organizationName
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(`User ${inviteEmail} has been invited!`);
                setInviteEmail('');
                setInvitePosition('');
                setInviteLocation('');
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
        return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">Loading...</div>;
    }

    if (!user || userData?.role !== 'admin') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 relative">
                <TopBar />
                <div className="max-w-6xl mx-auto pt-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Admin Dashboard</h1>
                        <p className="text-gray-300">Manage users and organization settings</p>
                    </header>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-400/50 text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-400/50 text-green-300 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Invite User */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-sm p-6 mb-8 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4">Invite User</h2>
                        <form onSubmit={handleInviteUser} className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                                />
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white"
                                >
                                    <option value="educator" className="bg-gray-900">Educator</option>
                                    <option value="admin" className="bg-gray-900">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={invitePosition}
                                    onChange={(e) => setInvitePosition(e.target.value)}
                                    placeholder="Position (e.g. Teacher)"
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                                />
                                <input
                                    type="text"
                                    value={inviteLocation}
                                    onChange={(e) => setInviteLocation(e.target.value)}
                                    placeholder="Location (e.g. Room 101)"
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-purple-500/30"
                                >
                                    Invite
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* User List */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-sm border border-white/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Organization Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                                        {u.photoURL || u.avatar_url ? (
                                                            <img src={u.photoURL || u.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-purple-500">
                                                                {(u.displayName || u.name || "?")[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{u.displayName || u.name}</p>
                                                        <p className="text-xs text-gray-400">{u.position}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                                    disabled={u.id === user.uid}
                                                >
                                                    <option value="educator" className="bg-gray-900">Educator</option>
                                                    <option value="admin" className="bg-gray-900">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingUser(u)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    {u.id !== user.uid && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {editingUser && (
                    <ProfileModal
                        isOpen={!!editingUser}
                        onClose={() => {
                            setEditingUser(null);
                            fetchUsers(); // Refresh list after edit
                        }}
                        user={editingUser}
                        isOwnProfile={false}
                    />
                )}
            </main>
        </div>
    );
}
