const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className='flex flex-col items-center justify-center p-8'>
      <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
      <p className='mt-4 text-gray-600'>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
