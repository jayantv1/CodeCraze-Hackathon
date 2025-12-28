# RAG System Setup Guide

## Prerequisites

1. Python 3.8+ installed
2. Node.js and npm installed
3. Firebase project configured
4. Google Gemini API key

## Installation Steps

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `google-generativeai` - Gemini API client
- `PyPDF2` - PDF processing
- `python-docx` - DOCX processing
- `python-pptx` - PPTX processing
- `numpy` - Vector operations
- `sentence-transformers` - Embedding utilities

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Environment Variables

Create or update `.env.local` in the project root:

```bash
# Firebase Configuration (already required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Flask Backend URL (optional, defaults to http://localhost:5328)
NEXT_PUBLIC_FLASK_URL=http://localhost:5328

# Google Gemini API Key (required for RAG system)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Firebase Storage Rules

Update Firebase Storage rules to allow file uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rag_documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Firebase Firestore Indexes

Create composite indexes for efficient queries:

**Collection: `rag_chunks`**
- Fields: `document_id` (Ascending), `created_at` (Descending)

**Collection: `rag_documents`**
- Fields: `user_id` (Ascending), `created_at` (Descending)

### 6. Start Development Servers

```bash
# Start both Next.js and Flask
npm run dev
```

Or separately:
```bash
# Terminal 1: Next.js
npm run next-dev

# Terminal 2: Flask
npm run flask-dev
```

## Testing the System

### 1. Access the AI Assistant

Navigate to: `http://localhost:3000/ai-assistant`

### 2. Upload a Test Document

1. Click the file upload area or drag and drop a file
2. Supported formats: PDF, DOCX, PPTX, TXT
3. Wait for processing confirmation

### 3. Ask a Question

1. Type a question about your uploaded document
2. The system will retrieve relevant context and generate an answer
3. Sources are displayed below the answer

### 4. Generate Material

1. Click "Generate Material" in the sidebar
2. Fill in the form (topic is required)
3. Click "Generate [Material Type]"
4. Download the generated material from the chat

## Troubleshooting

### Issue: "GEMINI_API_KEY not found"

**Solution**: Ensure `GEMINI_API_KEY` is set in your environment. For Flask, you may need to export it:
```bash
export GEMINI_API_KEY=your_key
```

### Issue: "Firebase admin not initialized"

**Solution**: Ensure `serviceAccountKey.json` exists in the project root with valid Firebase Admin credentials.

### Issue: File upload fails

**Solution**: 
1. Check Firebase Storage rules
2. Verify Firebase Storage is enabled in your project
3. Check browser console for CORS errors

### Issue: Embeddings not working

**Solution**:
1. Verify Gemini API key is valid
2. Check API quota/limits
3. Review Flask backend logs for errors

### Issue: Import errors in Python

**Solution**: Ensure you're running from the project root directory and Python path is configured correctly.

## Production Deployment

### Environment Variables

Set all environment variables in your hosting platform:
- Vercel: Add to Project Settings > Environment Variables
- Flask backend: Set in your hosting environment

### Firebase Security Rules

Update Firestore and Storage rules for production:
- Enforce authentication
- Add rate limiting if needed
- Restrict file sizes

### Performance Optimization

1. **Vector Database**: Consider migrating to a dedicated vector DB (Pinecone, Weaviate) for better scalability
2. **Caching**: Implement caching for frequently accessed documents
3. **Batch Processing**: Process multiple documents in batches
4. **CDN**: Use CDN for static assets

## API Usage Examples

### Upload Document (cURL)

```bash
curl -X POST http://localhost:5328/api/rag/upload \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -F "file=@document.pdf"
```

### Query (cURL)

```bash
curl -X POST http://localhost:5328/api/rag/query \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is photosynthesis?", "top_k": 5}'
```

### Generate Material (cURL)

```bash
curl -X POST http://localhost:5328/api/rag/generate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request": "Create a quiz about photosynthesis",
    "material_type": "quiz",
    "subject": "Biology",
    "grade_level": "9th Grade",
    "num_questions": "10"
  }'
```

## Support

For issues or questions, refer to:
- `RAG_SYSTEM_ARCHITECTURE.md` - System architecture details
- Flask backend logs: Check terminal output
- Browser console: Check for frontend errors

