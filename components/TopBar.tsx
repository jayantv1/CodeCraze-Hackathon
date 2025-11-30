"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function TopBar() {
    const { userData } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!userData) return null;

    return (
        <>
            <div className="absolute top-4 right-8 z-40">
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 p-2 rounded-full hover:bg-white/10 transition-colors group"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                            {userData.displayName || userData.name}
                        </p>
                        <p className="text-xs text-gray-400">
                            {userData.role === 'admin' ? 'Administrator' : 'Educator'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50 group-hover:border-purple-400 transition-colors bg-gray-800">
                        {userData.photoURL || userData.avatar_url ? (
                            <img
                                src={userData.photoURL || userData.avatar_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-600 to-purple-600">
                                {(userData.displayName || userData.name || "?")[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </button>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={userData}
                isOwnProfile={true}
            />
        </>
    );
}
