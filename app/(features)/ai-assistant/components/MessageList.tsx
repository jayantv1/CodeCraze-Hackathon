'use client';

import { Message } from './TeacherChatbot';
import { downloadFile } from '@/lib/utils';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, isLoading, messagesEndRef }: MessageListProps) {
  const handleDownload = (content: string, materialType: string, pdfData?: string) => {
    if (pdfData) {
      // Download as PDF
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const fileName = `${materialType}_${new Date().toISOString().split('T')[0]}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Fallback to text download
      const fileName = `${materialType}_${new Date().toISOString().split('T')[0]}.txt`;
      downloadFile(content, fileName, 'text/plain');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-3xl rounded-lg px-4 py-3 ${message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 border shadow-sm'
              }`}
          >
            <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Sources:</p>
                <div className="space-y-1">
                  {message.sources.map((source: { file_name: string; score: number }, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600">
                      • {source.file_name} (relevance: {(source.score * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.materialContent && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleDownload(message.materialContent!, message.materialType || 'material', message.pdfData)}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                >
                  📥 Download {message.materialType || 'Material'}
                </button>
              </div>
            )}

            <div className="text-xs text-gray-400 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white rounded-lg px-4 py-3 border shadow-sm">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

