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

export interface Document {
    id: string;
    file_name: string;
    file_type: string;
    created_at: string;
    chunk_count: number;
}
