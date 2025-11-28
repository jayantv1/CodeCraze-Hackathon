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

export default function Dashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [scope, setScope] = useState('school');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
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
        if (!newPost.trim()) return;

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPost,
                    author_id: 'test-user-id', // TODO: Get from Auth
                    author_name: 'Teacher User', // TODO: Get from Auth
                    scope: scope
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
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">The Stream</h1>
                        <p className="text-gray-600">Updates from your school and district</p>
                    </header>

                    {/* Post Creator */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                placeholder="Share an update, success story, or announcement..."
                                rows={3}
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg text-sm text-gray-600"
                                >
                                    <option value="school">My School</option>
                                    <option value="district">My District</option>
                                    <option value="group">Specific Group</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Post Update
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-center text-gray-500">Loading stream...</p>
                        ) : posts.length === 0 ? (
                            <p className="text-center text-gray-500">No posts yet. Be the first to share something!</p>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {post.author_name[0]}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-semibold text-gray-900">{post.author_name}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">{post.scope}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed">{post.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
