const BackIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className="h-5 w-5 text-white"
    viewBox='0 0 20 20'
    fill='currentColor'
    {...props}
  >
    <path
      fillRule='evenodd'
      d='M12.707 15.707a1 1 0 01-1.414 0L6.586 11H17a1 1 0 100-2H6.586l4.707-4.707a1 1 0 00-1.414-1.414l-6.414 6.414a1 1 0 000 1.414l6.414 6.414a1 1 0 001.414 0z'
      clipRule='evenodd'
    />
  </svg>
);

export default BackIcon;