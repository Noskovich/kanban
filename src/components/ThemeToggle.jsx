export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Переключить тему оформления"
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb"></span>
      </span>
      <span className="theme-toggle__label">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
    </button>
  );
}
