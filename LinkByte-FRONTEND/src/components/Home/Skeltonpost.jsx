const SkeletonPost = () => {
  // Generate a random number between 0 and 1
  const showMediaPlaceholder = Math.random() < 0.35; // 35% probability

  return (
    <div className="p-2.5 rounded-xl h-fit flex-1 flex flex-row bg-gray-900 animate-pulse">
      {/* Profile Picture Placeholder */}
      <div className="w-10 h-10 rounded-full mr-1 bg-gray-700"></div>

      <div className="px-1 flex flex-col flex-1">
        <div className="flex flex-row">
          <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
          <div className="flex-grow"></div>
          <div className="h-3 bg-gray-700 rounded w-20"></div>
        </div>
        <div className="flex-1 mt-2">
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6 mb-2"></div> {/* Shorter line for visual variety */}
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div> {/* Even shorter line */}

          {/* Media Placeholder - Renders only 35% of the time */}
          {showMediaPlaceholder && (
            <div className="w-full h-40 bg-gray-800 rounded-lg mt-2"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkeletonPost;