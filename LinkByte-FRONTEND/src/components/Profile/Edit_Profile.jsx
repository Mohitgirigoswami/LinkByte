import React, { useState, useEffect } from "react";

const Edit_Profile = ({ username, bio, profile_pic_link, banner_link,back }) => {
  const [editedUsername, setEditedUsername] = useState(username);
  const [editedBio, setEditedBio] = useState(bio);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreviewUrl, setProfilePicPreviewUrl] = useState(profile_pic_link);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(banner_link);
  
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

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', data.api_key);
            formData.append('timestamp', data.timestamp);
            formData.append('signature', data.signature);
            formData.append('folder', data.folder);
            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${data.cloudinary_cloud_name}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const cloudinaryData = await cloudinaryResponse.json();
            if (!cloudinaryData.secure_url) {
                throw new Error('Upload failed: No URL received');
            }

            return cloudinaryData.secure_url;

        } catch (error) {
            console.error('Upload error:', error);
            throw error; // Re-throw to handle in handlePost
        }};

  const handlesubmit = async (e) => {
    e.preventDefault();
    const body = {};
    
    if (username !== editedUsername) {
      body['username'] = editedUsername;
    }
    
    if (bio !== editedBio) {
      body['bio'] = editedBio;
    }

    try {
      if (profilePicFile) {
        const profilePicUrl = await uploadFileToCloudinary(profilePicFile);
        body['profile_pic_link'] = profilePicUrl;
      }

      if (bannerFile) {
        const bannerUrl = await uploadFileToCloudinary(bannerFile);
        body['banner_link'] = bannerUrl;
      }

      if (Object.keys(body).length === 0) {
        return; // No changes to update
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
        back(); // Go back after successful update
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error appropriately
    }
  };

  useEffect(() => {
    if (bannerFile) {
      const objectUrl = URL.createObjectURL(bannerFile);
      setBannerPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setBannerPreviewUrl(banner_link);
    }
  }, [bannerFile, banner_link]);

  useEffect(() => {
    if (profilePicFile) {
      const objectUrl = URL.createObjectURL(profilePicFile);
      setProfilePicPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setProfilePicPreviewUrl(profile_pic_link);
    }
  }, [profilePicFile, profile_pic_link]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-black rounded-2xl shadow-lg overflow-hidden">
        <div className="relative">
          {/* Banner Image */}
          <div className="relative h-48 sm:h-64">
            <img
              className="w-full aspect-3/1 object-cover"
              src={bannerPreviewUrl}
              alt="banner"
            />

            <label
              htmlFor="banner-upload-input"
              className="absolute bottom-2 right-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Change Banner
              <input
                onChange={(e) => {
                  setBannerFile(e.target.files[0]);
                }}
                id="banner-upload-input"
                type="file"
                accept=".jpg, .jpeg, .png, .gif"
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Picture */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <img
                src={profilePicPreviewUrl}
                alt="Profile"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-black"
              />
              <label
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full"
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
                accept=".jpg, .jpeg, .png, .gif"
                id="pic-upload-input"
              />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="mt-20 px-6 py-8">
          <form onSubmit={handlesubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Username
              </label>
              <input
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
              onClick={back}
                type="button"
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit_Profile;
