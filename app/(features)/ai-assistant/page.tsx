'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import TeacherChatbot from './components/TeacherChatbot';

export default function AIAssistantPage() {
  const { user, userData } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Please log in to use the AI Assistant</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Teaching Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload instructional files, ask questions, and generate educational materials
        </p>
      </div>
      <TeacherChatbot userId={user.uid} />
    </div>
  );
}

