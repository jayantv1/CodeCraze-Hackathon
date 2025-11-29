"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Safe window dimensions that default to 0 during SSR and initial client render
    const windowWidth = mounted ? window.innerWidth : 0;
    const windowHeight = mounted ? window.innerHeight : 0;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div
                    className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transition-transform duration-75 ease-out"
                    style={{
                        transform: `translate(${mousePos.x * 0.08}px, ${mousePos.y * 0.08}px)`,
                        top: '-10%',
                        left: '-10%'
                    }}
                ></div>
                <div
                    className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
                    style={{
                        transform: `translate(${mousePos.x * -0.08}px, ${mousePos.y * 0.08}px)`,
                    }}
                ></div>
                <div
                    className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
                    style={{
                        transform: `translate(${mousePos.x * 0.04}px, ${mousePos.y * -0.08}px)`,
                    }}
                ></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    LumFlare
                </div>
                <div className="flex gap-4">
                    <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link href="/signup" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
                        Contact Us
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center relative">
                    {/* Mouse follow glow behind title */}
                    <div
                        className="absolute w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none -z-10 transition-transform duration-100 ease-out"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(calc(-50% + ${(mousePos.x - windowWidth / 2) * 0.1}px), calc(-50% + ${(mousePos.y - windowHeight / 2) * 0.1}px))`
                        }}
                    ></div>

                    <h1
                        className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-100 ease-out"
                        style={{
                            backgroundSize: '300% auto',
                            backgroundPosition: `${50 + (mousePos.x / (windowWidth || 1) - 0.5) * 100}% center`
                        }}
                    >
                        Empower Your Teaching with AI
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Streamline collaboration, manage classrooms effortlessly, and unlock your full potential with our intelligent platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-lg transform transition-all hover:scale-105">
                            Contact Us
                        </Link>
                        <Link href="/signup?demo=true" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-lg font-bold rounded-xl transition-all">
                            Request Demo
                        </Link>
                    </div>
                </div>

                {/* What is LumFlare Section */}
                <div className="mt-32 max-w-5xl mx-auto w-full">
                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            What is LumFlare?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white">Teacher Communication</h3>
                                <p className="text-gray-400">
                                    A dedicated Slack-like environment for teachers to chat, create groups, and stay connected with their district.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white">School Stream</h3>
                                <p className="text-gray-400">
                                    Share updates, events, and success stories with your school or district in a professional, LinkedIn-style feed.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white">Smart Test Calendar</h3>
                                <p className="text-gray-400">
                                    Coordinate assessments with colleagues to prevent overload and ensure a balanced schedule for students.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} LumFlare. All rights reserved.
            </footer>
        </div>
    );
}
