import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation

const Error404 = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // Navigate to your home page
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">

      <h1 className="text-6xl md:text-9xl font-bold text-blue-600 mb-4 animate-bounce">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-semibold text-red-500 mb-6">
        Page Not Found
      </h2>

      <p className="text-lg md:text-xl text-center max-w-xl mb-8">
        Oops! It looks like you've wandered off the path. The page you're looking for might have been moved, deleted, or never existed.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Go to Homepage
        </button>
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
        >
          Go Back
        </button>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>You might want to try:</p>
        <ul className="list-disc list-inside mt-2">
          <li><a href="/dashboard" className="text-blue-400 hover:underline">Your Dashboard</a></li>
          <li><a href="/products" className="text-blue-400 hover:underline">Our Products/Services</a></li>
          <li><a href="/contact" className="text-blue-400 hover:underline">Contact Support</a></li>
        </ul>
      </div>

       </div>
  );
};

export default Error404;