import React from 'react';

export default function ChatArea() {
    const messages = [
        { id: 1, user: 'Sarah Johnson', time: '10:30 AM', content: 'Has anyone seen the new curriculum for 10th grade history?' },
        { id: 2, user: 'Mike Chen', time: '10:32 AM', content: 'Yes, I think it was emailed out yesterday. Check your inbox.' },
        { id: 3, user: 'Sarah Johnson', time: '10:33 AM', content: 'Ah, found it! Thanks Mike. It looks... interesting.' },
        { id: 4, user: 'You', time: '10:35 AM', content: 'I actually really like the new focus on primary sources.' },
    ];

    return (
        <div className="flex-1 flex flex-col bg-gray-800 h-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm z-10">
                <div>
                    <h2 className="font-bold text-white flex items-center">
                        <span className="text-gray-400 mr-1">#</span> general
                    </h2>
                    <p className="text-xs text-gray-400">Company-wide announcements and work-based matters</p>
                </div>
                <div className="flex -space-x-2">
                    {/* Avatars placeholder */}
                    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">SJ</div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">MC</div>
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-400">+5</div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
                {messages.map((msg) => (
                    <div key={msg.id} className="group flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg">
                            {msg.user.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline space-x-2">
                                <span className="font-bold text-white hover:underline cursor-pointer">{msg.user}</span>
                                <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-gray-300 mt-1 leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gray-900/50 backdrop-blur-sm z-10">
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all shadow-lg">
                    {/* Toolbar */}
                    <div className="flex items-center space-x-2 px-2 pb-2 border-b border-gray-600/50 mb-2">
                        <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
                            <span className="font-bold">B</span>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
                            <span className="italic">I</span>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
                            <span className="line-through">S</span>
                        </button>
                    </div>

                    <textarea
                        className="w-full bg-transparent text-white placeholder-gray-400 px-3 py-2 outline-none resize-none h-20"
                        placeholder="Message #general"
                    ></textarea>

                    <div className="flex justify-between items-center px-2 pt-2">
                        <div className="flex space-x-2">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors">
                                +
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors">
                                @
                            </button>
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-md">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
