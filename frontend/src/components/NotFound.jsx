import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center items-center">
      <h1 className="text-6xl font-black mb-4 text-indigo-500">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
