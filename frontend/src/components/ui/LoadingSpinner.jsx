function LoadingSpinner({ dark = false }) {
  return <span className={`spinner${dark ? ' spinner--dark' : ''}`} />;
}

export default LoadingSpinner;
