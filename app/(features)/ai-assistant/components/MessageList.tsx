'use client';

import { Message } from '@/types/ai-assistant';
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
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5 backdrop-blur-lg">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-3xl rounded-lg px-4 py-3 ${message.role === 'user'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white/10 backdrop-blur-lg text-white border border-white/10 shadow-sm'
              }`}
          >
            <div
              className={
                'prose prose-sm max-w-none prose-invert ' +
                'prose-p:text-gray-100 prose-strong:text-white prose-headings:text-white ' +
                'prose-a:text-blue-300 hover:prose-a:text-blue-200 '
              }
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-xs text-gray-300 mb-1">Sources:</p>
                <div className="space-y-1">
                  {message.sources.map((source: { file_name: string; score: number }, idx: number) => (
                    <div key={idx} className="text-xs text-gray-200">
                      • {source.file_name} (relevance: {(source.score * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.materialContent && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <button
                  onClick={() => handleDownload(message.materialContent!, message.materialType || 'material', message.pdfData)}
                  className="text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1 rounded transition-colors"
                >
                  📥 Download {message.materialType || 'Material'}
                </button>
              </div>
            )}

            <div className="text-xs text-gray-300 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-3 border border-white/10 shadow-sm">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

