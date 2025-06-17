import React, { useState, useEffect } from "react";
import useCloudinaryUpload from "../../hooks/useCloudinaryUpload";
import useImagePreview from "../../hooks/useImagePreview";

const Edit_Profile = ({ username, bio, profile_pic_link, banner_link, back }) => {
    const [editedUsername, setEditedUsername] = useState(username);
    const [editedBio, setEditedBio] = useState(bio);
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { 
        uploadFile: uploadProfilePic, 
        isUploading: isUploadingProfilePic, 
        uploadError: profilePicUploadError 
    } = useCloudinaryUpload();

    const { 
        uploadFile: uploadBanner, 
        isUploading: isUploadingBanner, 
        uploadError: bannerUploadError 
    } = useCloudinaryUpload();


   const {
        file: profilePicFile,
        setFile: setProfilePicFile,
        previewUrl: profilePicPreviewUrl
    } = useImagePreview(profile_pic_link);

    // Use useImagePreview for banner
    const {
        file: bannerFile,
        setFile: setBannerFile,
        previewUrl: bannerPreviewUrl
    } = useImagePreview(banner_link);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        const body = {};
        let uploadFailed = false;

        try {
            if (profilePicFile) {
                const profilePicUrl = await uploadProfilePic(profilePicFile);
                if (profilePicUrl) {
                    body['profile_pic_link'] = profilePicUrl;
                } else {
                    uploadFailed = true;
                }
            }

            if (uploadFailed) {
                setIsSubmitting(false);
                return;
            }

            if (bannerFile) {
                const bannerUrl = await uploadBanner(bannerFile);
                if (bannerUrl) {
                    body['banner_link'] = bannerUrl;
                } else {
                    uploadFailed = true;
                }
            }
            
            if (uploadFailed) {
                setIsSubmitting(false);
                return;
            }

            if (username !== editedUsername) {
                body['username'] = editedUsername;
            }
            
            if (bio !== editedBio) {
                body['bio'] = editedBio;
            }

            if (Object.keys(body).length === 0) {
                setSuccessMessage("No changes to save.");
                setIsSubmitting(false);
                return; 
            }

            const response = await fetch('http://127.0.0.1:5000/user/edit', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                localStorage.setItem('username', editedUsername);
                setSuccessMessage("Profile updated successfully!");
                setTimeout(() => {
                    back();
                }, 1500);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setApiError(error.message || 'An unexpected error occurred during profile update.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isUploadingProfilePic || isUploadingBanner || isSubmitting;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-black rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                    <div className="relative h-48 sm:h-64">
                        <img
                            className="w-full aspect-3/1 object-cover"
                            src={bannerPreviewUrl}
                            alt="banner"
                        />
                        <label
                            htmlFor="banner-upload-input"
                            className={`absolute bottom-2 right-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isUploadingBanner ? 'Uploading Banner...' : 'Change Banner'}
                            <input
                                onChange={(e) => {
                                    setBannerFile(e.target.files[0]);
                                }}
                                id="banner-upload-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isLoading}
                            />
                        </label>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <img
                                src={profilePicPreviewUrl}
                                alt="Profile"
                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-black"
                            />
                            <label
                                className={`absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                htmlFor="pic-upload-input"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </label>
                            <input
                                onChange={(e) => {
                                    setProfilePicFile(e.target.files[0]);
                                }}
                                type="file"
                                className="hidden"
                                name="pic-upload-input"
                                accept="image/*"
                                id="pic-upload-input"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-20 px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                value={editedUsername}
                                onChange={(e) => setEditedUsername(e.target.value)}
                                type="text"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <div className="text-gray-500 text-sm mt-1">
                                @{editedUsername}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Bio
                            </label>
                            <textarea
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                                rows="4"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                        </div>

                        {apiError && <div className="text-red-500 text-sm">{apiError}</div>}
                        {profilePicUploadError && <div className="text-red-500 text-sm">Profile Picture Error: {profilePicUploadError}</div>}
                        {bannerUploadError && <div className="text-red-500 text-sm">Banner Error: {bannerUploadError}</div>}
                        {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}


                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={back}
                                type="button"
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-6 py-2 rounded-lg 
                                    ${isLoading ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`
                                }
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Edit_Profile;