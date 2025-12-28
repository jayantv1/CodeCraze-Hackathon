# RAG System Architecture Documentation

## Overview

This document describes the production-ready RAG (Retrieval-Augmented Generation) system built for the LümFlare teacher chatbot. The system enables teachers to upload instructional files, ask questions based on their content, and generate educational materials.

## Architecture

### Components

1. **File Processors** (`lib/rag/file_processors.py`)
   - Supports PDF, DOCX, PPTX, and TXT files
   - Extracts text content from various formats
   - Returns structured data with metadata

2. **Text Chunking** (`lib/rag/chunking.py`)
   - Semantic chunking with paragraph and sentence boundaries
   - Configurable chunk size (default: 1000 chars) and overlap (default: 200 chars)
   - Preserves context across chunks

3. **Embeddings** (`lib/rag/embeddings.py`)
   - Uses Google Gemini's `embedding-001` model
   - Batch processing support
   - Cosine similarity calculation

4. **Vector Store** (`lib/rag/vector_store.py`)
   - Firestore-based vector storage
   - Stores embeddings and metadata
   - Top-K similarity search with cosine similarity
   - User-scoped document management

5. **RAG Pipeline** (`lib/rag/rag_pipeline.py`)
   - Main orchestration layer
   - Document indexing workflow
   - Query processing with context retrieval
   - Material generation with context

6. **Prompt Templates** (`lib/rag/prompts.py`)
   - System prompts for chatbot personality
   - Q&A prompt templates
   - Material generation templates (worksheets, quizzes, tests, assignments)
   - Platform documentation integration

## Firebase Schema

### Collections

#### `rag_documents`
Stores document metadata:
```typescript
{
  user_id: string;
  file_name: string;
  file_type: string; // 'pdf', 'docx', 'pptx', 'txt'
  storage_path: string; // Firebase Storage path
  metadata: {
    num_pages?: number;
    num_paragraphs?: number;
    num_slides?: number;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  chunk_count: number;
}
```

#### `rag_chunks`
Stores text chunks with embeddings:
```typescript
{
  document_id: string; // Reference to rag_documents
  chunk_index: number;
  text: string;
  embedding: number[]; // Vector embedding
  metadata: {
    file_name: string;
    file_type: string;
    // ... other metadata
  };
  created_at: Timestamp;
}
```

## API Endpoints

### Flask Backend (`/api/rag/`)

1. **POST `/api/rag/upload`**
   - Upload and index a document
   - Requires: Bearer token, multipart/form-data with file
   - Returns: document_id, file_name, metadata

2. **POST `/api/rag/query`**
   - Query the RAG system
   - Body: `{ question: string, top_k?: number, include_platform_docs?: boolean }`
   - Returns: `{ answer: string, sources: array, context_used: boolean }`

3. **POST `/api/rag/generate`**
   - Generate educational material
   - Body: `{ request: string, material_type: string, ...params }`
   - Returns: `{ content: string, sources: array, metadata: object }`

4. **GET `/api/rag/documents`**
   - Get user's uploaded documents
   - Returns: `{ documents: array }`

5. **DELETE `/api/rag/documents/<document_id>`**
   - Delete a document and its chunks
   - Returns: success message

### Next.js API Routes (`/app/api/rag/`)

Proxy routes that forward requests to Flask backend with authentication.

## Frontend Components

### Main Components

1. **TeacherChatbot** (`app/(features)/ai-assistant/components/TeacherChatbot.tsx`)
   - Main chat interface
   - Manages messages, documents, and material generation
   - Coordinates file uploads and queries

2. **MessageList** (`app/(features)/ai-assistant/components/MessageList.tsx`)
   - Displays chat messages
   - Shows sources and download buttons for generated materials

3. **ChatInput** (`app/(features)/ai-assistant/components/ChatInput.tsx`)
   - Text input for questions
   - Link to material generator

4. **FileUpload** (`app/(features)/ai-assistant/components/FileUpload.tsx`)
   - Drag-and-drop file upload
   - Supports PDF, DOCX, PPTX, TXT

5. **DocumentList** (`app/(features)/ai-assistant/components/DocumentList.tsx`)
   - Lists user's uploaded documents
   - Delete functionality

6. **MaterialGenerator** (`app/(features)/ai-assistant/components/MaterialGenerator.tsx`)
   - Form for generating educational materials
   - Supports worksheets, quizzes, tests, assignments
   - Customizable parameters

## Workflow

### Document Upload Flow

1. User uploads file via UI
2. File sent to `/api/rag/upload` (Next.js route)
3. Next.js route forwards to Flask backend
4. Flask backend:
   - Processes file (extracts text)
   - Chunks text
   - Generates embeddings
   - Uploads to Firebase Storage
   - Stores in Firestore (document + chunks)
5. Success response returned to UI

### Query Flow

1. User asks question
2. Query sent to `/api/rag/query`
3. Flask backend:
   - Generates query embedding
   - Searches for similar chunks (top-K)
   - Builds context from retrieved chunks
   - Optionally includes platform documentation
   - Generates response using Gemini
4. Response displayed in chat with sources

### Material Generation Flow

1. User fills material generator form
2. Request sent to `/api/rag/generate`
3. Flask backend:
   - Generates query embedding from request
   - Retrieves relevant context
   - Formats prompt with context
   - Generates material using Gemini
4. Material displayed in chat with download option

## Configuration

### Environment Variables

Required:
- `GEMINI_API_KEY`: Google Gemini API key
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `NEXT_PUBLIC_FLASK_URL`: Flask backend URL (default: http://localhost:5328)

### Dependencies

Python:
- `google-generativeai==0.3.2`
- `PyPDF2==3.0.1`
- `python-docx==1.1.0`
- `python-pptx==0.6.23`
- `numpy==1.24.3`
- `sentence-transformers==2.2.2`

## Platform Documentation Integration

The system includes platform documentation as a static RAG source:
- Location: `docs/platform_docs.txt`
- Automatically included in queries when `include_platform_docs=true`
- Provides context about LümFlare features and workflows

## Best Practices

1. **Chunking**: Adjust chunk size based on document type and query patterns
2. **Top-K**: Default is 5 chunks; adjust based on context window and query complexity
3. **Embeddings**: Batch process for efficiency when indexing multiple documents
4. **Storage**: Regularly clean up unused documents to manage storage costs
5. **Error Handling**: All endpoints include comprehensive error handling

## Security

- All endpoints require Firebase authentication
- User-scoped document access (users can only access their own documents)
- File type validation on upload
- Secure file storage in Firebase Storage

## Performance Considerations

- Embeddings are computed asynchronously during upload
- Vector search uses Firestore queries (consider dedicated vector DB for scale)
- Batch operations for multiple chunks
- Caching of frequently accessed documents

## Future Enhancements

1. Dedicated vector database (Pinecone, Weaviate, etc.) for better scalability
2. Incremental document updates
3. Multi-modal support (images, audio)
4. Conversation history and context
5. Advanced material formatting (PDF generation, LaTeX support)
6. Collaborative document sharing
7. Document versioning

