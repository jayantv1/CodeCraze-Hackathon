"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ContactPage() {
    const searchParams = useSearchParams();
    const isDemo = searchParams.get('demo') === 'true';
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        message: '',
        requestType: isDemo ? 'demo' : 'contact'
    });
    const [submitted, setSubmitted] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual form submission to your backend/email service
        console.log('Contact form submitted:', formData);
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setFormData({
                organizationName: '',
                contactName: '',
                email: '',
                phone: '',
                message: '',
                requestType: isDemo ? 'demo' : 'contact'
            });
            setSubmitted(false);
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden relative p-4">
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

            <div className="w-full max-w-4xl relative z-10">
                <Card className="p-8 md:p-12">
                    {/* Back to Home Link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <div className="text-center mb-8">
                        {isDemo && (
                            <div className="inline-block bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-400/30">
                                🎯 Live Demo Request
                            </div>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            {isDemo ? 'Request a Live Demo' : 'Bring LumFlare to Your Organization'}
                        </h1>
                        <p className="text-gray-300 text-lg">
                            {isDemo
                                ? 'See LumFlare in action with a personalized demo for your team'
                                : 'Empower your educators with AI-driven collaboration and classroom management'
                            }
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Teacher Collaboration</h3>
                            <p className="text-gray-400 text-sm">Slack-like messaging for seamless communication</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">School Stream</h3>
                            <p className="text-gray-400 text-sm">Share updates and success stories district-wide</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Smart Scheduling</h3>
                            <p className="text-gray-400 text-sm">Coordinate assessments to reduce student stress</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    {submitted ? (
                        <div className="bg-green-500/10 border border-green-400/50 text-green-300 px-6 py-8 rounded-lg text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-green-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                            <p>We've received your inquiry and will be in touch soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Organization Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                        placeholder="Your School or District"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Contact Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                        placeholder="contact@school.edu"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {isDemo ? 'What would you like to see in the demo?' : 'Tell us about your needs'}
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 resize-none"
                                    placeholder={isDemo
                                        ? 'Specific features you want to explore, number of attendees, preferred time, etc.'
                                        : 'Number of educators, specific needs, timeline, etc.'
                                    }
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                            >
                                {isDemo ? 'Schedule Demo' : 'Request Information'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
