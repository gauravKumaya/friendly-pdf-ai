const API_BASE_URL = 'http://localhost:8000'; // Update this with your actual backend URL

export interface UploadResponse {
  pdf_id: string;
  message: string;
}

export interface QueryRequest {
  pdf_id: string;
  query: string;
}

export interface QueryResponse {
  pdf_id: string;
  query: string;
  answer: string;
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new APIError(response.status, `Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error('Failed to upload PDF. Please check your connection and try again.');
  }
};

export const queryPDF = async (pdfId: string, query: string): Promise<QueryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdf_id: pdfId,
        query: query,
      } as QueryRequest),
    });

    if (!response.ok) {
      throw new APIError(response.status, `Query failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error('Failed to query PDF. Please check your connection and try again.');
  }
};