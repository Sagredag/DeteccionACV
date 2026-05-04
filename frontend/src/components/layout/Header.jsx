function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <div className="header__title">{title}</div>
            <div className="header__subtitle">{subtitle}</div>
          </div>
        </div>
        <span className="header__badge">Herramienta Clínica · Tesis</span>
      </div>
    </header>
  );
}

export default Header;
