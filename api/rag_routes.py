"""
API routes for RAG chatbot functionality.
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import sys
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.rag.rag_pipeline import RAGPipeline
from lib.rag.file_processors import FileProcessor
from lib.firebase_admin import db, auth
from firebase_admin import credentials, initialize_app, storage

rag_api = Blueprint('rag', __name__, url_prefix='/api/rag')

# Initialize RAG pipeline
rag_pipeline = None

def get_rag_pipeline():
    """Get or initialize RAG pipeline."""
    global rag_pipeline
    if rag_pipeline is None:
        rag_pipeline = RAGPipeline()
    return rag_pipeline

def verify_token(token: str) -> dict:
    """Verify Firebase auth token and return user info."""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Invalid token: {str(e)}")

@rag_api.route('/upload', methods=['POST'])
def upload_document():
    """Upload and index a document."""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        user_info = verify_token(token)
        user_id = user_info['uid']
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get file info
        file_name = secure_filename(file.filename)
        file_content = file.read()
        mime_type = file.content_type
        
        # Process file
        processor = FileProcessor()
        result = processor.process_file(
            file_content=file_content,
            file_name=file_name,
            mime_type=mime_type
        )
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        if not result.get('text'):
            return jsonify({'error': 'No text extracted from file'}), 400
        
        # Upload to Firebase Storage
        bucket = storage.bucket(name='lumflare-71d2f.firebasestorage.app')
        storage_path = f"rag_documents/{user_id}/{datetime.utcnow().isoformat()}_{file_name}"
        blob = bucket.blob(storage_path)
        blob.upload_from_string(file_content, content_type=mime_type)
        
        # Index document
        pipeline = get_rag_pipeline()
        doc_id = pipeline.index_document(
            user_id=user_id,
            text=result['text'],
            file_name=file_name,
            file_type=result['metadata'].get('file_type', 'unknown'),
            storage_path=storage_path,
            metadata=result['metadata']
        )
        
        return jsonify({
            'success': True,
            'document_id': doc_id,
            'file_name': file_name,
            'metadata': result['metadata']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rag_api.route('/query', methods=['POST'])
def query():
    """Query the RAG system."""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        user_info = verify_token(token)
        user_id = user_info['uid']
        
        # Get request data
        data = request.get_json()
        question = data.get('question')
        top_k = data.get('top_k', 5)
        include_platform_docs = data.get('include_platform_docs', True)
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # Query pipeline
        pipeline = get_rag_pipeline()
        result = pipeline.query(
            question=question,
            user_id=user_id,
            top_k=top_k,
            include_platform_docs=include_platform_docs
        )
        
        return jsonify({
            'success': True,
            'answer': result['answer'],
            'sources': result['sources'],
            'context_used': len(result.get('context', '')) > 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rag_api.route('/generate', methods=['POST'])
def generate_material():
    """Generate educational material."""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        user_info = verify_token(token)
        user_id = user_info['uid']
        
        # Get request data
        data = request.get_json()
        request_text = data.get('request')
        material_type = data.get('material_type', 'material')
        top_k = data.get('top_k', 5)
        
        # Additional parameters
        kwargs = {
            'subject': data.get('subject', ''),
            'grade_level': data.get('grade_level', ''),
            'topic': data.get('topic', ''),
            'num_questions': data.get('num_questions', ''),
            'question_types': data.get('question_types', ''),
            'time_limit': data.get('time_limit', ''),
            'total_points': data.get('total_points', ''),
            'assignment_type': data.get('assignment_type', ''),
            'requirements': data.get('requirements', ''),
            'due_date_guidance': data.get('due_date_guidance', ''),
            'format': data.get('format', '')
        }
        
        if not request_text:
            return jsonify({'error': 'Request is required'}), 400
        
        # Generate material
        pipeline = get_rag_pipeline()
        result = pipeline.generate_material(
            request=request_text,
            material_type=material_type,
            user_id=user_id,
            top_k=top_k,
            **kwargs
        )
        
        # Generate PDF
        try:
            from lib.pdf_generator import markdown_to_pdf
            import base64
            
            title_text = f"{kwargs.get('topic', material_type).title()} Worksheet" if kwargs.get('topic') else f"{material_type.title()} Worksheet"
            pdf_bytes = markdown_to_pdf(result['content'], title=title_text)
            pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        except Exception as e:
            print(f"Error generating PDF: {e}")
            pdf_base64 = None
        
        return jsonify({
            'success': True,
            'content': result['content'],
            'pdf_data': pdf_base64,
            'sources': result['sources'],
            'metadata': result['metadata']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rag_api.route('/documents', methods=['GET'])
def get_documents():
    """Get user's uploaded documents."""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        user_info = verify_token(token)
        user_id = user_info['uid']
        
        # Get documents
        from lib.rag.vector_store import FirestoreVectorStore
        vector_store = FirestoreVectorStore()
        documents = vector_store.get_user_documents(user_id)
        
        # Convert datetime objects to strings
        for doc in documents:
            if 'created_at' in doc:
                doc['created_at'] = doc['created_at'].isoformat() if hasattr(doc['created_at'], 'isoformat') else str(doc['created_at'])
            if 'updated_at' in doc:
                doc['updated_at'] = doc['updated_at'].isoformat() if hasattr(doc['updated_at'], 'isoformat') else str(doc['updated_at'])
        
        return jsonify({
            'success': True,
            'documents': documents
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rag_api.route('/documents/<document_id>', methods=['DELETE'])
def delete_document(document_id):
    """Delete a document and its chunks."""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        user_info = verify_token(token)
        user_id = user_info['uid']
        
        # Verify document belongs to user
        from lib.rag.vector_store import FirestoreVectorStore
        vector_store = FirestoreVectorStore()
        doc = vector_store.get_document(document_id)
        
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
        
        if doc.get('user_id') != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete from storage
        if doc.get('storage_path'):
            try:
                bucket = storage.bucket()
                blob = bucket.blob(doc['storage_path'])
                blob.delete()
            except Exception as e:
                print(f"Error deleting from storage: {str(e)}")
        
        # Delete from vector store
        vector_store.delete_document(document_id)
        
        return jsonify({
            'success': True,
            'message': 'Document deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

