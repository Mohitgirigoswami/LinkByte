import { useState, useEffect } from 'react';

const useImagePreview = (initialUrl = null) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialUrl);

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Clean up when the component unmounts or file changes
            return () => URL.revokeObjectURL(objectUrl);
        } else if (initialUrl && !file) {
            setPreviewUrl(initialUrl);
        } else {
            setPreviewUrl(null); // No file, no initialUrl
        }
    }, [file, initialUrl]); // Depend on initialUrl as well for proper reset

    return { file, setFile, previewUrl };
};

export default useImagePreview;