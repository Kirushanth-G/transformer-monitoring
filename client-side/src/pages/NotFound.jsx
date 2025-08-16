import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#E5E4E2] p-8'>
      <div className='text-center'>
        <div className='mb-8'>
          <h1 className='mb-4 text-6xl font-bold text-gray-400'>404</h1>
          <h2 className='mb-2 text-2xl font-semibold text-gray-700'>
            Page Not Found
          </h2>
          <p className='mb-8 text-gray-600'>
            The page you're looking for doesn't exist.
          </p>
        </div>

        <div className='space-y-4'>
          <Link
            to='/transformers'
            className='inline-block rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Go to Transformers
          </Link>
          <div>
            <Link
              to='/inspections'
              className='font-medium text-blue-600 hover:text-blue-800'
            >
              View Inspections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
