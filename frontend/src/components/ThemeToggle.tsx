/**
 * Theme toggle component for switching between light and dark color themes.
 */

type ThemeToggleProps = {
  theme: 'light' | 'dark';
  onToggle: () => void;
};

/**
 * Component that renders a button to toggle between light and dark themes.
 */
function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDarkTheme = theme === 'dark';

  return (
    <button
      className="button button-secondary size-10 shrink-0 p-0"
      type="button"
      onClick={onToggle}
      aria-pressed={isDarkTheme}
      aria-label={isDarkTheme ? 'Use light theme' : 'Use dark theme'}
      title={isDarkTheme ? 'Use light theme' : 'Use dark theme'}
    >
      {isDarkTheme ? (
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.72 5.28l-1.42 1.42M6.7 17.3l-1.42 1.42M18.72 18.72l-1.42-1.42M6.7 6.7 5.28 5.28" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.5 6.5 0 0 0 10.7 10.7Z" />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;
