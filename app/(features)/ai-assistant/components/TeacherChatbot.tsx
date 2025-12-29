'use client';

import { useState, useRef, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import FileUpload from './FileUpload';
import DocumentList from './DocumentList';
import MaterialGenerator from './MaterialGenerator';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    document_id?: string;
    file_name: string;
    score: number;
  }>;
  materialContent?: string;
  materialType?: string;
  pdfData?: string; // Base64 PDF data
}

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  chunk_count: number;
}

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
      const token = await auth.currentUser?.getIdToken();
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

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

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
        throw new Error(data.error || 'Failed to upload file');
      }

      // Add success message
      setMessages(prev => [...prev, {
        id: `upload-${Date.now()}`,
        role: 'assistant',
        content: `✅ Successfully uploaded and indexed "${file.name}". You can now ask questions about this document!`,
        timestamp: new Date(),
      }]);

      // Refresh documents
      fetchDocuments();
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
      const token = await auth.currentUser?.getIdToken();
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
      const token = await auth.currentUser?.getIdToken();
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
      const token = await auth.currentUser?.getIdToken();
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
      <div className="w-64 bg-gray-50 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Tools</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📄 My Documents ({documents.length})
          </button>
          <button
            onClick={() => setShowMaterialGenerator(!showMaterialGenerator)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
        <div className="border-t bg-white p-4">
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
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">My Documents</h2>
            <button
              onClick={() => setShowDocuments(false)}
              className="text-gray-500 hover:text-gray-700"
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
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Generate Material</h2>
            <button
              onClick={() => setShowMaterialGenerator(false)}
              className="text-gray-500 hover:text-gray-700"
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

