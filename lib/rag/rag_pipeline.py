"""
Main RAG pipeline for processing queries and generating responses.
"""

import os
import sys
from typing import List, Dict, Optional

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from lib.rag.chunking import TextChunker
from lib.rag.embeddings import GeminiEmbedder
from lib.rag.vector_store import FirestoreVectorStore
from lib.rag.prompts import format_qa_prompt, format_material_prompt, format_platform_prompt
import google.generativeai as genai


class RAGPipeline:
    """Main RAG pipeline for teacher chatbot."""
    
    def __init__(self, gemini_api_key: str = None):
        """
        Initialize RAG pipeline.
        
        Args:
            gemini_api_key: Google Gemini API key
        """
        self.embedder = GeminiEmbedder(gemini_api_key or os.getenv('GEMINI_API_KEY'))
        self.vector_store = FirestoreVectorStore()
        self.chunker = TextChunker(chunk_size=1000, chunk_overlap=200)
        
        # Initialize Gemini for generation
        api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('models/gemini-2.5-pro')
        else:
            self.model = None
    
    def index_document(self, user_id: str, text: str, file_name: str,
                      file_type: str, storage_path: str, metadata: Dict = None) -> str:
        """
        Index a document into the vector store.
        
        Args:
            user_id: User ID
            text: Extracted text from document
            file_name: Name of the file
            file_type: Type of file
            storage_path: Path in Firebase Storage
            metadata: Additional metadata
            
        Returns:
            Document ID
        """
        # Chunk the text
        chunks = self.chunker.chunk_text(text, metadata={
            'file_name': file_name,
            'file_type': file_type,
            **(metadata or {})
        })
        
        if not chunks:
            raise ValueError("No chunks created from document")
        
        # Generate embeddings
        chunk_texts = [chunk['text'] for chunk in chunks]
        embeddings = self.embedder.embed_batch(chunk_texts)
        
        # Store in vector store
        doc_id = self.vector_store.add_document(
            user_id=user_id,
            file_name=file_name,
            file_type=file_type,
            storage_path=storage_path,
            metadata=metadata
        )
        
        self.vector_store.add_chunks(doc_id, chunks, embeddings)
        
        return doc_id
    
    def query(self, question: str, user_id: str = None, top_k: int = 5,
             include_platform_docs: bool = True) -> Dict:
        """
        Query the RAG system and generate a response.
        
        Args:
            question: User's question
            user_id: User ID (to filter user's documents)
            top_k: Number of context chunks to retrieve
            include_platform_docs: Whether to include platform documentation
            
        Returns:
            Dictionary with 'answer', 'sources', and 'context' fields
        """
        # Generate query embedding
        query_embedding = self.embedder.embed_text(question)
        
        # Retrieve similar chunks
        retrieved_chunks = self.vector_store.search_similar(
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=top_k
        )
        
        # Build context from retrieved chunks
        context_parts = []
        sources = []
        
        for chunk in retrieved_chunks:
            context_parts.append(chunk['text'])
            sources.append({
                'document_id': chunk.get('document_id'),
                'file_name': chunk.get('metadata', {}).get('file_name', 'Unknown'),
                'score': chunk.get('score', 0),
                'chunk_index': chunk.get('chunk_index', 0)
            })
        
        context = "\n\n---\n\n".join(context_parts)
        
        # Add platform documentation if requested
        platform_context = ""
        if include_platform_docs:
            platform_context = self._get_platform_docs_context(question)
        
        # Format prompt
        if platform_context and not context:
            # Only platform docs available
            prompt = format_platform_prompt(question, platform_context)
        elif context:
            # Use document context
            from lib.rag.prompts import SYSTEM_PROMPT
            prompt = format_qa_prompt(question, context, SYSTEM_PROMPT)
            if platform_context:
                prompt += f"\n\nAdditional Platform Information:\n{platform_context}"
        else:
            # No context available
            from lib.rag.prompts import SYSTEM_PROMPT
            prompt = f"{SYSTEM_PROMPT}\n\nUser question: {question}\n\nPlease provide a helpful answer."
        
        # Generate response
        if not self.model:
            return {
                'answer': 'Gemini API not configured. Please set GEMINI_API_KEY.',
                'sources': sources,
                'context': context
            }
        
        try:
            response = self.model.generate_content(prompt)
            try:
                answer = response.text
            except ValueError:
                # Handle cases where response is not simple text (e.g. safety block or multipart)
                if response.candidates and response.candidates[0].content.parts:
                    answer = "".join([part.text for part in response.candidates[0].content.parts])
                elif response.prompt_feedback and response.prompt_feedback.block_reason:
                    answer = f"Response blocked: {response.prompt_feedback.block_reason}"
                else:
                    answer = "No text content generated."
        except Exception as e:
            answer = f"Error generating response: {str(e)}"
        
        return {
            'answer': answer,
            'sources': sources,
            'context': context
        }
    
    def generate_material(self, request: str, material_type: str, user_id: str = None,
                         top_k: int = 5, **kwargs) -> Dict:
        """
        Generate educational material based on context.
        
        Args:
            request: User's request for material
            material_type: Type of material (worksheet, quiz, test, assignment)
            user_id: User ID (to filter user's documents)
            top_k: Number of context chunks to retrieve
            **kwargs: Additional parameters for material generation
            
        Returns:
            Dictionary with 'content', 'sources', and 'metadata' fields
        """
        # Generate query embedding from request
        query_embedding = self.embedder.embed_text(request)
        
        # Retrieve relevant context
        retrieved_chunks = self.vector_store.search_similar(
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=top_k
        )
        
        # Build context
        context_parts = [chunk['text'] for chunk in retrieved_chunks]
        context = "\n\n---\n\n".join(context_parts)
        
        sources = [{
            'document_id': chunk.get('document_id'),
            'file_name': chunk.get('metadata', {}).get('file_name', 'Unknown'),
            'score': chunk.get('score', 0)
        } for chunk in retrieved_chunks]
        
        # Format prompt
        from lib.rag.prompts import SYSTEM_PROMPT
        prompt = format_material_prompt(
            request=request,
            context=context if context else "No specific context available.",
            material_type=material_type,
            system_prompt=SYSTEM_PROMPT,
            **kwargs
        )
        
        # Generate material
        if not self.model:
            return {
                'content': 'Gemini API not configured. Please set GEMINI_API_KEY.',
                'sources': sources,
                'metadata': {}
            }
        
        try:
            response = self.model.generate_content(prompt)
            try:
                content = response.text
            except ValueError:
                if response.candidates and response.candidates[0].content.parts:
                    content = "".join([part.text for part in response.candidates[0].content.parts])
                elif response.prompt_feedback and response.prompt_feedback.block_reason:
                    content = f"Response blocked: {response.prompt_feedback.block_reason}"
                else:
                    content = "No content generated."
        except Exception as e:
            content = f"Error generating material: {str(e)}"
        
        return {
            'content': content,
            'sources': sources,
            'metadata': {
                'material_type': material_type,
                'generated_at': str(os.popen('date').read().strip()) if os.name != 'nt' else ''
            }
        }
    
    def _get_platform_docs_context(self, question: str) -> str:
        """Get relevant platform documentation context."""
        # Load platform documentation
        try:
            docs_path = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'platform_docs.txt')
            if os.path.exists(docs_path):
                with open(docs_path, 'r', encoding='utf-8') as f:
                    platform_docs = f.read()
                
                # Simple keyword matching - in production, use embedding search
                question_lower = question.lower()
                relevant_sections = []
                
                sections = platform_docs.split('\n\n---\n\n')
                for section in sections:
                    if any(keyword in section.lower() for keyword in question_lower.split()):
                        relevant_sections.append(section)
                
                return "\n\n---\n\n".join(relevant_sections[:3])  # Top 3 relevant sections
        except Exception as e:
            print(f"Error loading platform docs: {str(e)}")
        
        return ""

