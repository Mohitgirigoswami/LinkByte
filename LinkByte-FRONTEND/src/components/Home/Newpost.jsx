import React, { useState, useRef, useEffect } from 'react';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload'; // Adjust path if necessary
import useImagePreview from '../../hooks/useImagePreview';

const Newpost = ({ user_pic_link }) => {
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState("text"); // Renamed from mediaType to default to "text"
    const [isDragging, setIsDragging] = useState(false);
    const [successMessage, setSuccessMessage] = useState(""); // Renamed for clarity
    const [apiError, setApiError] = useState(""); // Renamed for clarity

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    // Use the Cloudinary Upload Hook
    const { 
        uploadFile, 
        isUploading, 
        uploadError, 
        uploadProgress 
    } = useCloudinaryUpload();

    const { 
        file: mediaFile, 
        setFile: setMediaFile, 
        previewUrl 
    } = useImagePreview(); // Initializing with no default URL for Newpost

    // Handler to process file selection (from input or drag-drop)
    const handleFile = (file) => {
        if (file) {
            const type = file.type.split('/')[0];
            if (type === 'image' || type === 'video') {
                setMediaType(type);
                setMediaFile(file); // This will update previewUrl via useImagePreview
                setApiError(""); // Clear any previous errors
            } else {
                setApiError('Please upload only image or video files.');
                setMediaFile(null);
                setMediaType("text");
            }
        }
    };

    const handleFileSelect = (event) => {
        handleFile(event.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handlePost = async () => {
        if (!content.trim() && !mediaFile) { // Check if both are empty
            setApiError("Content or media cannot be empty.");
            return;
        }
        
        setApiError("");
        setSuccessMessage("");

        let finalMediaUrl = null;

        try {
            if (mediaFile) {
                finalMediaUrl = await uploadFile(mediaFile);
                if (!finalMediaUrl) {
                    return; 
                }
            }
  const BEURL = import.meta.env.VITE_BE_URL;

            const response = await fetch(`${BEURL}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
                body: JSON.stringify({
                    content: content,
                    media_link: finalMediaUrl,
                    type: mediaType || "text", // Ensure type is set
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            const data = await response.json();
            setSuccessMessage(data.message || 'Post created successfully');
            
            // Reset form fields
            setContent('');
            setMediaFile(null); // This clears the preview via useImagePreview
            setMediaType("text");

            console.log('Post created successfully:', data);

        } catch (error) {
            console.error('Error creating post:', error);
            setApiError(error.message || 'An unexpected error occurred during post creation.');
        } 
};

    const isOverallLoading = isUploading;

    return (
        <div className="p-2.5 rounded-xl h-fit w-full flex flex-row bg-gray-900">
            <img className="w-10 h-10 rounded-full mr-1" src={user_pic_link || 'https://placehold.co/600x600'} alt="profile pic" />
            <div className="flex flex-col w-full gap-2 px-2">
                <textarea
                    value={content}
                    onChange={(e) =>{
                        setApiError("");
                        setSuccessMessage("");
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        setContent(e.target.value)}}
                    className="w-full bg-transparent text-gray-200 outline-none"
                    placeholder="What's happening?"
                    name="content"
                    disabled={isOverallLoading} 
                />
                
                <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors
                        ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}
                        ${previewUrl ? 'hidden' : 'block'}
                        ${isOverallLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <p className="text-gray-400">
                        Drag and drop an image or video here, or{' '}
                        <button
                            type="button"
                            onClick={handleUploadClick}
                            className="text-blue-400 hover:text-blue-500"
                            disabled={isOverallLoading}
                        >
                            browse
                        </button>
                    </p>
                </div>

                {previewUrl && (
                    <div className="relative">
                        {mediaType === 'image' ? (
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="max-h-60 rounded-lg object-contain"
                            />
                        ) : (
                            <video 
                                src={previewUrl}
                                controls
                                className="max-h-60 rounded-lg w-full"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setMediaFile(null);
                                setMediaType("text"); 
                            }}
                            className={`absolute top-2 right-2 bg-gray-800 rounded-full p-1 hover:bg-gray-700 ${
                                isOverallLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isOverallLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-row items-center">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={isOverallLoading}
                    />
                    <button
                        onClick={handleUploadClick}
                        className={`text-blue-400 hover:text-blue-500 ${isOverallLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isOverallLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={handlePost}
                        className={`ml-auto px-4 py-1 rounded-full ${
                            (!content && !mediaFile) || isOverallLoading // Disable if no content/media or loading
                                ? 'bg-blue-400/50 cursor-not-allowed'
                                : 'bg-blue-400 hover:bg-blue-500'
                        }`}
                        disabled={(!content && !mediaFile) || isOverallLoading} // Disable button if no content/media or loading
                    >
                        Post
                    </button>
                </div>
                {apiError && <div className="text-red-500 text-sm">{apiError}</div>}
                {uploadError && <div className="text-red-500 text-sm">Upload Error: {uploadError}</div>}
                {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}
                <div className="text-gray-400 text-sm">
                    {isUploading ? `Uploading: ${uploadProgress}%` : ''}
                </div>
            </div>
        </div>
    );
};

export default Newpost;