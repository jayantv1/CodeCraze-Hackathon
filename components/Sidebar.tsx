import React from 'react';

export default function Sidebar() {
    const channels = [
        { id: 1, name: 'general' },
        { id: 2, name: 'announcements' },
        { id: 3, name: 'lesson-plans' },
        { id: 4, name: 'random' },
    ];

    const dms = [
        { id: 1, name: 'Sarah Johnson', status: 'online' },
        { id: 2, name: 'Mike Chen', status: 'offline' },
        { id: 3, name: 'Principal Skinner', status: 'busy' },
    ];

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full text-gray-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                <h2 className="font-bold text-white text-lg flex items-center justify-between">
                    Lincoln High
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">Free</span>
                </h2>
                <div className="flex items-center mt-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Jane Doe
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4">
                {/* Channels */}
                <div className="mb-6">
                    <div className="px-4 flex items-center justify-between group mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">Channels</h3>
                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">+</button>
                    </div>
                    <ul>
                        {channels.map((channel) => (
                            <li key={channel.id}>
                                <a href="#" className="flex items-center px-4 py-1 hover:bg-gray-800 transition-colors group">
                                    <span className="text-gray-500 mr-2 group-hover:text-gray-400">#</span>
                                    <span className="group-hover:text-white">{channel.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Direct Messages */}
                <div>
                    <div className="px-4 flex items-center justify-between group mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">Direct Messages</h3>
                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">+</button>
                    </div>
                    <ul>
                        {dms.map((dm) => (
                            <li key={dm.id}>
                                <a href="#" className="flex items-center px-4 py-1 hover:bg-gray-800 transition-colors group">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${dm.status === 'online' ? 'bg-green-500' :
                                            dm.status === 'busy' ? 'bg-red-500' : 'border border-gray-500'
                                        }`}></div>
                                    <span className="group-hover:text-white">{dm.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
