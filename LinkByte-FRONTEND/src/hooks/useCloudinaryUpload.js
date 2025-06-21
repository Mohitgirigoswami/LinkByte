// src/hooks/useCloudinaryUpload.js
import { useState, useCallback } from 'react';

const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) {
      setUploadError('No file selected for upload.');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadedUrl(null);

    try {
      
      const response = await fetch(`${import.meta.env.VITE_BE_URL}/post/getuploadurl`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({ filesize: file.size, filetype: file.type }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get upload URL from backend');
      }

      const resourceType = file.type.startsWith('image/') ? 'image' : 'video';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', data.api_key);
      formData.append('timestamp', data.timestamp);
      formData.append('signature', data.signature);
      formData.append('folder', data.folder); 

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudinary_cloud_name}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();
      if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
        throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed: No URL received');
      }

      setUploadedUrl(cloudinaryData.secure_url);
      return cloudinaryData.secure_url;  
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setUploadError(error.message || 'An unknown error occurred during upload.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []); 

  return { uploadFile, isUploading, uploadError, uploadedUrl };
};

export default useCloudinaryUpload;