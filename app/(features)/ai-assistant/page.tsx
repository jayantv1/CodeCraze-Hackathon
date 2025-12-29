'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import TeacherChatbot from './components/TeacherChatbot';

export default function AIAssistantPage() {
  const { user, userData } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <p className="text-gray-200">Please log in to use the AI Assistant</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">AI Teaching Assistant</h1>
        <p className="text-sm text-gray-300 mt-1">
          Upload instructional files, ask questions, and generate educational materials
        </p>
      </div>
      <TeacherChatbot userId={user.uid} />
    </div>
  );
}

