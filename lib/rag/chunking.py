"""
Text chunking utilities for RAG system.
Implements semantic and fixed-size chunking strategies.
"""

from typing import List, Dict
import re


class TextChunker:
    """Chunks text into smaller pieces for embedding and retrieval."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize chunker.
        
        Args:
            chunk_size: Maximum characters per chunk
            chunk_overlap: Characters to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_text(self, text: str, metadata: Dict = None) -> List[Dict]:
        """
        Split text into chunks with metadata.
        
        Args:
            text: Text to chunk
            metadata: Additional metadata to attach to each chunk
            
        Returns:
            List of chunk dictionaries with text and metadata
        """
        if not text or not text.strip():
            return []
        
        # Clean text
        text = text.strip()
        
        # Try to split by paragraphs first (better semantic boundaries)
        paragraphs = re.split(r'\n\s*\n', text)
        chunks = []
        current_chunk = ""
        chunk_index = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # If paragraph fits, add it
            if len(current_chunk) + len(para) + 1 <= self.chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
            else:
                # Save current chunk if it exists
                if current_chunk:
                    chunks.append(self._create_chunk(current_chunk, chunk_index, metadata))
                    chunk_index += 1
                
                # If paragraph is too large, split it
                if len(para) > self.chunk_size:
                    # Split by sentences
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    current_chunk = ""
                    
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) + 1 <= self.chunk_size:
                            if current_chunk:
                                current_chunk += " " + sentence
                            else:
                                current_chunk = sentence
                        else:
                            if current_chunk:
                                chunks.append(self._create_chunk(current_chunk, chunk_index, metadata))
                                chunk_index += 1
                                # Add overlap
                                overlap_text = self._get_overlap_text(current_chunk)
                                current_chunk = overlap_text + " " + sentence if overlap_text else sentence
                            else:
                                current_chunk = sentence
                else:
                    # Start new chunk with overlap from previous
                    if chunks:
                        overlap_text = self._get_overlap_text(chunks[-1]['text'])
                        current_chunk = overlap_text + "\n\n" + para if overlap_text else para
                    else:
                        current_chunk = para
        
        # Add final chunk
        if current_chunk:
            chunks.append(self._create_chunk(current_chunk, chunk_index, metadata))
        
        return chunks
    
    def _create_chunk(self, text: str, index: int, metadata: Dict = None) -> Dict:
        """Create a chunk dictionary with metadata."""
        chunk = {
            'text': text.strip(),
            'chunk_index': index,
            'char_count': len(text)
        }
        
        if metadata:
            chunk.update(metadata)
        
        return chunk
    
    def _get_overlap_text(self, text: str) -> str:
        """Extract overlap text from end of chunk."""
        if len(text) <= self.chunk_overlap:
            return text
        
        # Try to get overlap at sentence boundary
        sentences = re.split(r'(?<=[.!?])\s+', text)
        overlap = ""
        
        for sentence in reversed(sentences):
            if len(overlap) + len(sentence) <= self.chunk_overlap:
                overlap = sentence + " " + overlap if overlap else sentence
            else:
                break
        
        # If no sentence boundary, just take last N characters
        if not overlap:
            overlap = text[-self.chunk_overlap:]
        
        return overlap.strip()

