function Card({ children, elevated = false, className = '' }) {
  const classes = ['card', elevated && 'card--elevated', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

export default Card;
