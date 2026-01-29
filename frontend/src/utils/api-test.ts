import axios from 'axios';

let url = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
if (url && !url.startsWith('http')) {
  url = `https://${url}`;
}
if (!url.endsWith('/api')) {
  url = `${url}/api`;
}
const API_BASE_URL = url;

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection to:', API_BASE_URL);

    // Test health endpoint
    // Test health endpoint
    // Remove the /api suffix if present to hit the root /health endpoint
    const baseUrl = API_BASE_URL.replace('/api', '');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log('Health check response:', healthResponse.data);

    return {
      success: true,
      message: 'Backend connection successful',
      data: healthResponse.data
    };
  } catch (error: any) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

export const testUploadEndpoint = async (file: File) => {
  try {
    console.log('Testing upload endpoint with file:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    console.log('Upload test response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Upload test failed:', error);
    throw error;
  }
};