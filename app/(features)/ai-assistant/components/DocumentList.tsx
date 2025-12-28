'use client';

import { Document } from './TeacherChatbot';

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'pptx':
        return '📊';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No documents uploaded yet. Upload a file to get started!
        </p>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFileIcon(doc.file_type)}</span>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.file_name}
                  </p>
                </div>
                <div className="mt-1 text-xs text-gray-500 space-y-1">
                  <p>Type: {doc.file_type.toUpperCase()}</p>
                  <p>Chunks: {doc.chunk_count}</p>
                  <p>Uploaded: {formatDate(doc.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => onDelete(doc.id)}
                className="ml-2 text-red-600 hover:text-red-700 text-sm"
                title="Delete document"
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

