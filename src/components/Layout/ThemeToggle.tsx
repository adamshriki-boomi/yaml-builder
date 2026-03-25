import { ExIcon } from '@boomi/exosphere';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      className="theme-toggle"
    >
      <ExIcon icon={theme === 'light' ? 'Night' : 'Day'} />
    </button>
  );
}
