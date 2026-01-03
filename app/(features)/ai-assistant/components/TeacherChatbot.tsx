'use client';

import { useState, useRef, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import FileUpload from './FileUpload';
import DocumentList from './DocumentList';
import MaterialGenerator from './MaterialGenerator';
import { Message, Document } from '@/types/ai-assistant';

export default function TeacherChatbot({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showMaterialGenerator, setShowMaterialGenerator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI teaching assistant. I can help you with:\n\n• Answering questions about your uploaded instructional files\n• Generating worksheets, quizzes, tests, and assignments\n• Providing guidance on using LümFlare platform features\n\nUpload a file to get started, or ask me a question!",
      timestamp: new Date(),
    }]);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDocuments = async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch('/api/rag/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      setIsLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/rag/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            // We'll log error but continue with other files if possible, or maybe throw.
            // For better UX, let's individualize success/error.
            setMessages(prev => [...prev, {
              id: `error-${Date.now()}-${file.name}`,
              role: 'assistant',
              content: `❌ Error uploading "${file.name}": ${data.error || 'Failed to upload'}`,
              timestamp: new Date(),
            }]);
            continue;
          }

          // Add success message
          setMessages(prev => [...prev, {
            id: `upload-${Date.now()}-${file.name}`,
            role: 'assistant',
            content: `✅ Successfully uploaded and indexed "${file.name}". You can now ask questions about this document!`,
            timestamp: new Date(),
          }]);
        } catch (fileError: any) {
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}-${file.name}`,
            role: 'assistant',
            content: `❌ Error uploading "${file.name}": ${fileError.message}`,
            timestamp: new Date(),
          }]);
        }
      }

      // Refresh documents after all attempts
      fetchDocuments();
    } catch (error: any) {
      // Global error (e.g. auth failed)
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: content.trim(),
          top_k: 5,
          include_platform_docs: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources || [],
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMaterial = async (request: string, materialType: string, params: any) => {
    if (!request.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `Generate ${materialType}: ${request}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowMaterialGenerator(false);

    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/rag/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          request: request.trim(),
          material_type: materialType,
          ...params,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate material');
      }

      // Add assistant response with material
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `✅ Generated ${materialType}:\n\n${data.content}`,
        timestamp: new Date(),
        sources: data.sources || [],
        materialContent: data.content,
        materialType: materialType,
        pdfData: data.pdf_data
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch(`/api/rag/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
        setMessages(prev => [...prev, {
          id: `delete-${Date.now()}`,
          role: 'assistant',
          content: '✅ Document deleted successfully',
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 via-purple-900/50 to-gray-900 text-white border-r border-purple-500/20 flex flex-col">
        <div className="p-4 border-b border-purple-500/20">
          <h2 className="font-semibold text-white">Tools</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${showDocuments
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
          >
            📄 My Documents ({documents.length})
          </button>
          <button
            onClick={() => setShowMaterialGenerator(!showMaterialGenerator)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${showMaterialGenerator
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
          >
            ✨ Generate Material
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-lg p-4">
          <FileUpload onUpload={handleFileUpload} disabled={isLoading} />
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            onGenerateClick={() => setShowMaterialGenerator(true)}
          />
        </div>
      </div>

      {/* Documents Panel */}
      {showDocuments && (
        <div className="w-80 bg-gradient-to-b from-gray-900/70 via-purple-900/30 to-gray-900/70 backdrop-blur-lg border-l border-purple-500/20 flex flex-col">
          <div className="p-4 border-b border-purple-500/20 flex justify-between items-center">
            <h2 className="font-semibold text-white">My Documents</h2>
            <button
              onClick={() => setShowDocuments(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <DocumentList
            documents={documents}
            onDelete={handleDeleteDocument}
          />
        </div>
      )}

      {/* Material Generator Panel */}
      {showMaterialGenerator && (
        <div className="w-96 bg-gradient-to-b from-gray-900/70 via-purple-900/30 to-gray-900/70 backdrop-blur-lg border-l border-purple-500/20 flex flex-col">
          <div className="p-4 border-b border-purple-500/20 flex justify-between items-center">
            <h2 className="font-semibold text-white">Generate Material</h2>
            <button
              onClick={() => setShowMaterialGenerator(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <MaterialGenerator onGenerate={handleGenerateMaterial} />
        </div>
      )}
    </div>
  );
}

