'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

interface Post {
    id: string;
    content: string;
    author_name: string;
    scope: string;
    created_at: any;
}

import { useAuth } from '@/context/AuthContext';

import TopBar from '@/components/TopBar';

export default function Dashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [scope, setScope] = useState('school');
    const [loading, setLoading] = useState(true);
    const { user, userData, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        if (userData?.organizationId) {
            fetchPosts();
        } else {
            setLoading(false);
        }
    }, [userData, authLoading]);

    const fetchPosts = async () => {
        if (!userData?.organizationId) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/posts?organizationId=${userData.organizationId}`);
            const data = await res.json();
            if (data.error && data.error.includes('Database not connected')) {
                console.warn('Firebase not connected. Using empty posts array.');
                setPosts([]);
            } else if (Array.isArray(data)) {
                setPosts(data);
            } else if (data.posts) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !user || !userData?.organizationId) return;

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPost,
                    author_id: user.uid,
                    author_name: userData?.name || user.displayName || user.email || 'Unknown User',
                    scope: scope,
                    organizationId: userData.organizationId
                }),
            });

            if (res.ok) {
                setNewPost('');
                fetchPosts();
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 relative">
                <TopBar />
                <div className="max-w-3xl mx-auto pt-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">The Stream</h1>
                        <p className="text-gray-300">Updates from your school and district</p>
                    </header>

                    {/* Post Creator */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-sm p-6 mb-8 border border-white/10">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-white placeholder-gray-400"
                                placeholder="Share an update, success story, or announcement..."
                                rows={3}
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="school" className="bg-gray-900">My School</option>
                                    <option value="district" className="bg-gray-900">My District</option>
                                    <option value="group" className="bg-gray-900">Specific Group</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-purple-500/30"
                                >
                                    Post Update
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-center text-gray-400">Loading stream...</p>
                        ) : !userData?.organizationId ? (
                            <div className="text-center p-8 bg-red-500/10 backdrop-blur-lg rounded-xl border border-red-400/30">
                                <p className="text-red-300 font-medium">No Organization Found</p>
                                <p className="text-gray-400 mt-2">Your account is not associated with a registered organization.</p>
                                <p className="text-gray-400 text-sm">Please contact support or your administrator.</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <p className="text-center text-gray-400">No posts yet. Be the first to share something!</p>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white/5 backdrop-blur-lg rounded-xl shadow-sm p-6 border border-white/10">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {post.author_name[0]}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-semibold text-white">{post.author_name}</h3>
                                            <p className="text-xs text-purple-300 uppercase tracking-wide">{post.scope}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 leading-relaxed">{post.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
