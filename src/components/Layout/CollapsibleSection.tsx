import { useState } from 'react';
import { ExIcon } from '@boomi/exosphere';

interface Props {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({ label, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        className="collapsible-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="collapsible-label">{label}</span>
        <ExIcon
          icon={open ? 'direction-caret-up' : 'direction-caret-down'}
          style={{ width: 16, height: 16 }}
        />
      </button>
      <div className="collapsible-divider" />
      {open && (
        <div className="collapsible-body">
          {children}
        </div>
      )}
    </div>
  );
}
