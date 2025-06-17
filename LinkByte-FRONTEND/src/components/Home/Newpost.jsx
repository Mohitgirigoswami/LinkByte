import React, { useState, useRef, useEffect } from 'react';

const Newpost = ({ user_pic_link }) => {
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [mediaType, setMediaType] = useState("text");
    const [isDragging, setIsDragging] = useState(false);
    const [sucess, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const handleFile = (file) => {
        if (file) {
            const t = (file.type.split('/')[0]);
            if (t === 'image' || t === 'video') {
                setMediaFile(file);
                setMediaType(t);
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                alert('Please upload only image or video files');
            }
        }
    };

    const handleFileSelect = (event) => {
        setMediaFile(event.target.files[0]);
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

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handlePost = async () => {
        if (!content.trim()) {
            setError("Content cannot be empty");
            return;
        }
        
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            let finalMediaUrl = null;
            if (mediaFile) {
                // Wait for the upload to complete and get the URL
                finalMediaUrl = await uploadFileToCloudinary(mediaFile);
            }

            const response = await fetch('http://127.0.0.1:5000/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
                body: JSON.stringify({
                    content: content,
                    media_link: finalMediaUrl, // Use the returned URL directly
                    type: mediaType || "text",
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to create post');
                throw new Error(errorData.message || 'Failed to create post');
            }
            const data = await response.json();
            setError('');
            setSuccess(data.message || 'Post created successfully');
            setContent('');
            setMediaFile(null);
            setPreviewUrl(null);
            setMediaType(null);
            setUploadedUrl(null);
            console.log('Post created successfully:', data);
        } catch (error) {
            console.error('Error creating post:', error);
            setError(`Error creating post: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };  

    const uploadFileToCloudinary = async (file) => {
        if (!file) {
            throw new Error('No file selected for upload.');
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/post/getuploadurl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
                body: JSON.stringify({ filesize: file.size, filetype: file.type }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get upload URL');
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
            if (!cloudinaryData.secure_url) {
                throw new Error('Upload failed: No URL received');
            }

            // Return the URL instead of setting state
            return cloudinaryData.secure_url;

        } catch (error) {
            console.error('Upload error:', error);
            throw error; // Re-throw to handle in handlePost
        } finally {
            setLoading(false)// 
        }
    };

    return (
        <div className="p-2.5 rounded-xl h-fit w-full flex flex-row bg-gray-900">
            <img className="w-10 h-10 rounded-full mr-1" src={user_pic_link || 'https://placehold.co/600x600'} alt="profile pic" />
            <div className="flex flex-col w-full gap-2 px-2">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent text-gray-200 outline-none resize-none"
                    placeholder="What's happening?"
                    name="content"
                />
                
                <div
                    disabled={loading}
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors
                        ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}
                        ${mediaFile ? 'hidden' : 'block'}`}
                >
                    <p className="text-gray-400">
                        Drag and drop an image or video here, or{' '}
                        <button
                            disabled={loading}
                            type="button"
                            onClick={handleUploadClick}
                            className="text-blue-400 hover:text-blue-500"
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
                            disabled={loading}
                            type="button"
                            onClick={() => {
                                setMediaFile(null);
                                setPreviewUrl(null);
                                setMediaType(null);
                            }}
                            className="absolute top-2 right-2 bg-gray-800 rounded-full p-1 hover:bg-gray-700"
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
                    />
                    <button
                        onClick={handleUploadClick}
                        className="text-blue-400 hover:text-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        disabled={loading && !content && !mediaFile}
                        onClick={handlePost}
                        className={`ml-auto px-4 py-1 rounded-full ${
                            !content && !mediaFile
                                ? 'bg-blue-400/50 cursor-not-allowed'
                                : 'bg-blue-400 hover:bg-blue-500'
                        }`}
                    >
                        Post
                    </button>
                </div>
                <div className="text-red-500 text-sm">{error}</div>
                <div className="text-green-500 text-sm">{sucess}</div>
                <div className="text-gray-400 text-sm">
                    {loading ? 'Uploading...' : ''}
                    </div>
            </div>
        </div>
    );
};

export default Newpost;