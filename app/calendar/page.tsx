'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';

interface Test {
    id: string;
    title: string;
    date: string;
    target_audience: string;
    teacher_name: string;
}

export default function CalendarPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [tests, setTests] = useState<Test[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [targetAudience, setTargetAudience] = useState('Grade 10');

    const { userData } = useAuth();

    useEffect(() => {
        if (userData?.organizationId) {
            fetchTests();
        }
    }, [userData]);

    const fetchTests = async () => {
        if (!userData?.organizationId) return;
        try {
            const res = await fetch(`/api/tests?organizationId=${userData.organizationId}`);
            const data = await res.json();
            if (data.error && data.error.includes('Database not connected')) {
                console.warn('Firebase not connected. Using empty tests array.');
                setTests([]);
            } else if (Array.isArray(data)) {
                setTests(data);
            } else if (data.tests) {
                setTests(data.tests);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
            setTests([]);
        }
    };

    const handleDateClick = (value: any) => {
        setDate(value);
        setShowModal(true);
        setWarning(null); // Reset warning
    };

    const formatDate = (d: Date) => {
        return d.toISOString().split('T')[0];
    };

    const checkConflict = async () => {
        if (!userData?.organizationId) return { conflict: false };
        const res = await fetch('/api/tests/check-conflict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: formatDate(date),
                target_audience: targetAudience,
                organizationId: userData.organizationId
            }),
        });
        return await res.json();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData?.organizationId) return;

        // 1. Check for conflicts first if we haven't already accepted a warning
        if (!warning) {
            const conflictResult = await checkConflict();
            if (conflictResult.conflict) {
                setWarning(conflictResult.message);
                return; // Stop here and let user confirm
            }
        }

        // 2. Proceed to schedule
        try {
            const res = await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    date: formatDate(date),
                    target_audience: targetAudience,
                    teacher_id: 'test-user-id',
                    teacher_name: 'Teacher User',
                    organizationId: userData.organizationId
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setTitle('');
                setWarning(null);
                fetchTests();
            }
        } catch (error) {
            console.error('Error scheduling test:', error);
        }
    };

    // Helper to show tile content (test titles in tiles - from remote)
    const tileContent = ({ date, view }: any) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            const dayTests = tests.filter(t => t.date === dateStr);
            if (dayTests.length > 0) {
                return (
                    <div className="flex flex-col gap-1 w-full mt-1 px-1">
                        {dayTests.slice(0, 3).map(t => (
                            <div
                                key={t.id}
                                className="text-[10px] bg-purple-400/20 text-purple-200 px-1.5 py-0.5 rounded truncate w-full text-left font-medium border border-purple-400/30"
                                title={t.title}
                            >
                                {t.title}
                            </div>
                        ))}
                        {dayTests.length > 3 && (
                            <div className="text-[10px] text-gray-400 pl-1">
                                +{dayTests.length - 3} more
                            </div>
                        )}
                    </div>
                );
            }
        }
        return null;
    };

    const handleDateChange = (value: any) => {
        if (value instanceof Date) {
            setDate(value);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Test Calendar</h1>
                            <p className="text-gray-300 mt-1">Coordinate assessments to reduce student stress</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg shadow-purple-500/30 transition-all"
                        >
                            Schedule Test
                        </button>
                    </header>

                    <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-white/10">
                        <Calendar
                            onChange={handleDateChange}
                            value={date}
                            onClickDay={handleDateClick}
                            tileContent={tileContent}
                            className="w-full border-none"
                        />
                    </div>

                    {/* Schedule Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">Schedule Test</h2>
                                    <button
                                        onClick={() => { setShowModal(false); setWarning(null); }}
                                        className="text-gray-400 hover:text-gray-200 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-6 flex items-center gap-3 bg-blue-500/20 p-4 rounded-xl text-blue-200 border border-blue-400/30">
                                    <div className="bg-blue-500/30 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-300/80 uppercase tracking-wide">Selected Date</p>
                                        <p className="font-semibold">{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                {warning && (
                                    <div className="mb-6 p-4 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-200 text-sm flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5">
                                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <strong className="block font-semibold text-amber-100 mb-1">Conflict Detected</strong>
                                            <p>{warning}</p>
                                            <p className="mt-2 text-xs font-medium text-amber-300">Click "Confirm Schedule" again to override.</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Test Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Unit 3 Exam"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Audience</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none transition-all"
                                                value={targetAudience}
                                                onChange={(e) => {
                                                    setTargetAudience(e.target.value);
                                                    setWarning(null);
                                                }}
                                            >
                                                <option value="Grade 9" className="bg-gray-900">Grade 9</option>
                                                <option value="Grade 10" className="bg-gray-900">Grade 10</option>
                                                <option value="Grade 11" className="bg-gray-900">Grade 11</option>
                                                <option value="Grade 12" className="bg-gray-900">Grade 12</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => { setShowModal(false); setWarning(null); }}
                                            className="px-5 py-2.5 text-gray-300 hover:bg-white/10 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={`px-5 py-2.5 text-white rounded-lg font-medium shadow-lg transition-all transform active:scale-95 ${warning ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/30' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-purple-500/30'}`}
                                        >
                                            {warning ? 'Confirm Anyway' : 'Schedule Test'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
