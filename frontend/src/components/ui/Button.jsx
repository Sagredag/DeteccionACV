import LoadingSpinner from './LoadingSpinner';

function Button({
  children,
  variant = 'primary',
  size,
  full,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size && `btn--${size}`,
    full && 'btn--full',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled || loading} type={type}>
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}

export default Button;
