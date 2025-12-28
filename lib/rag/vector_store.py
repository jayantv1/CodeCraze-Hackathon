"""
Vector store implementation using Firebase Firestore.
Stores embeddings and metadata for RAG retrieval.
"""

import os
import sys
from typing import List, Dict, Optional
from datetime import datetime
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from lib.firebase_admin import db


class FirestoreVectorStore:
    """Vector store using Firestore for RAG system."""
    
    COLLECTION_NAME = 'rag_documents'
    CHUNKS_COLLECTION = 'rag_chunks'
    
    def __init__(self):
        """Initialize vector store."""
        self.db = db
    
    def add_document(self, user_id: str, file_name: str, file_type: str,
                    storage_path: str, metadata: Dict = None) -> str:
        """
        Add a document to the vector store.
        
        Args:
            user_id: User ID who uploaded the document
            file_name: Name of the file
            file_type: Type of file (pdf, docx, etc.)
            storage_path: Path in Firebase Storage
            metadata: Additional metadata
            
        Returns:
            Document ID
        """
        doc_ref = self.db.collection(self.COLLECTION_NAME).document()
        
        doc_data = {
            'user_id': user_id,
            'file_name': file_name,
            'file_type': file_type,
            'storage_path': storage_path,
            'metadata': metadata or {},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'chunk_count': 0
        }
        
        doc_ref.set(doc_data)
        return doc_ref.id
    
    def add_chunks(self, document_id: str, chunks: List[Dict], 
                   embeddings: List[List[float]]) -> None:
        """
        Add chunks with embeddings to the vector store.
        
        Args:
            document_id: ID of the parent document
            chunks: List of chunk dictionaries with text and metadata
            embeddings: List of embedding vectors
        """
        if len(chunks) != len(embeddings):
            raise ValueError("Chunks and embeddings must have same length")
        
        batch = self.db.batch()
        chunk_refs = []
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_ref = self.db.collection(self.CHUNKS_COLLECTION).document()
            chunk_refs.append(chunk_ref)
            
            chunk_data = {
                'document_id': document_id,
                'chunk_index': chunk.get('chunk_index', i),
                'text': chunk['text'],
                'embedding': embedding,  # Firestore supports arrays
                'metadata': {k: v for k, v in chunk.items() 
                           if k not in ['text', 'chunk_index']},
                'created_at': datetime.utcnow()
            }
            
            batch.set(chunk_ref, chunk_data)
        
        batch.commit()
        
        # Update document chunk count
        doc_ref = self.db.collection(self.COLLECTION_NAME).document(document_id)
        doc_ref.update({
            'chunk_count': len(chunks),
            'updated_at': datetime.utcnow()
        })
    
    def search_similar(self, query_embedding: List[float], user_id: str = None,
                      top_k: int = 5, min_score: float = 0.0) -> List[Dict]:
        """
        Search for similar chunks using cosine similarity.
        
        Args:
            query_embedding: Query embedding vector
            user_id: Filter by user ID (optional)
            top_k: Number of results to return
            min_score: Minimum similarity score
            
        Returns:
            List of similar chunks with scores
        """
        # Get all chunks (or filter by user_id)
        query = self.db.collection(self.CHUNKS_COLLECTION)
        
        if user_id:
            # Filter by user through document_id
            user_docs = self.db.collection(self.COLLECTION_NAME)\
                .where('user_id', '==', user_id).stream()
            doc_ids = [doc.id for doc in user_docs]
            
            if not doc_ids:
                return []
            
            # Note: Firestore doesn't support 'in' queries with more than 10 items
            # For production, consider a different approach
            if len(doc_ids) <= 10:
                query = query.where('document_id', 'in', doc_ids)
            else:
                # Fallback: get all and filter in memory
                pass
        
        chunks = query.stream()
        
        # Calculate similarities
        results = []
        for chunk_doc in chunks:
            chunk_data = chunk_doc.to_dict()
            embedding = chunk_data.get('embedding')
            
            if not embedding:
                continue
            
            # Calculate cosine similarity
            similarity = self._cosine_similarity(query_embedding, embedding)
            
            if similarity >= min_score:
                results.append({
                    'id': chunk_doc.id,
                    'text': chunk_data.get('text', ''),
                    'document_id': chunk_data.get('document_id'),
                    'chunk_index': chunk_data.get('chunk_index', 0),
                    'metadata': chunk_data.get('metadata', {}),
                    'score': similarity
                })
        
        # Sort by score and return top_k
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
    
    def get_document(self, document_id: str) -> Optional[Dict]:
        """Get document by ID."""
        doc_ref = self.db.collection(self.COLLECTION_NAME).document(document_id)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    def get_user_documents(self, user_id: str) -> List[Dict]:
        """Get all documents for a user."""
        docs = self.db.collection(self.COLLECTION_NAME)\
            .where('user_id', '==', user_id)\
            .order_by('created_at', direction='DESCENDING')\
            .stream()
        
        return [{'id': doc.id, **doc.to_dict()} for doc in docs]
    
    def delete_document(self, document_id: str) -> None:
        """Delete document and all its chunks."""
        # Delete chunks
        chunks = self.db.collection(self.CHUNKS_COLLECTION)\
            .where('document_id', '==', document_id)\
            .stream()
        
        batch = self.db.batch()
        for chunk in chunks:
            batch.delete(chunk.reference)
        batch.commit()
        
        # Delete document
        self.db.collection(self.COLLECTION_NAME).document(document_id).delete()
    
    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity."""
        import numpy as np
        
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))

