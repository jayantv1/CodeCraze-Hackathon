'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '@/components/Sidebar';

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

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await fetch('/api/tests');
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
        const res = await fetch('/api/tests/check-conflict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: formatDate(date),
                target_audience: targetAudience
            }),
        });
        return await res.json();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                    teacher_name: 'Teacher User'
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

    // Helper to show tile content (dots for tests)
    const tileContent = ({ date, view }: any) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            const dayTests = tests.filter(t => t.date === dateStr);
            if (dayTests.length > 0) {
                return (
                    <div className="flex gap-1 justify-center mt-1">
                        {dayTests.map(t => (
                            <div key={t.id} className="w-2 h-2 rounded-full bg-red-500" title={t.title}></div>
                        ))}
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
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Test Calendar</h1>
                        <p className="text-gray-600">Coordinate assessments to reduce student stress</p>
                    </header>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <Calendar
                            onChange={handleDateChange}
                            value={date}
                            onClickDay={handleDateClick}
                            tileContent={tileContent}
                            className="w-full border-none text-gray-800"
                        />
                    </div>

                    {/* Schedule Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                                <h2 className="text-xl font-bold mb-4">Schedule Test</h2>
                                <p className="text-gray-600 mb-6">Date: {date.toDateString()}</p>

                                {warning && (
                                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                        <strong>⚠️ Conflict Detected</strong>
                                        <p className="mt-1">{warning}</p>
                                        <p className="mt-2 text-xs text-yellow-700">Click "Confirm Schedule" again to override.</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-2 border rounded-lg"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Unit 3 Exam"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                        <select
                                            className="w-full p-2 border rounded-lg"
                                            value={targetAudience}
                                            onChange={(e) => {
                                                setTargetAudience(e.target.value);
                                                setWarning(null); // Reset warning if audience changes
                                            }}
                                        >
                                            <option>Grade 9</option>
                                            <option>Grade 10</option>
                                            <option>Grade 11</option>
                                            <option>Grade 12</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setShowModal(false); setWarning(null); }}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={`px-4 py-2 text-white rounded-lg transition-colors ${warning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
