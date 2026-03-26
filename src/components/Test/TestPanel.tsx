import { useState } from 'react';
import { ExButton, ExIcon, ExLoader, ExIconButton, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor, LoaderVariant, IconSize } from '@boomi/exosphere';

interface Props {
  onBackToEditor: () => void;
}

export default function TestPanel({ onBackToEditor }: Props) {
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="editor-toolbar">
        <ExIconButton
          type={IconButtonType.TERTIARY}
          flavor={IconButtonFlavor.BASE}
          icon="direction-arrow-left"
          label="Back to YAML Editor"
          onClick={onBackToEditor}
        />
        <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>Test Blueprint</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', textAlign: 'center' }}>
        {testing ? (
          <>
            <ExLoader variant={LoaderVariant.SPINNER} />
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--exo-color-font-secondary, #666)' }}>
              Testing your Blueprint...
            </p>
          </>
        ) : tested ? (
          <>
            <ExIcon icon="status-success" size={IconSize.L} />
            <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', marginTop: '16px' }}>Test Complete</p>
            <p style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '20px' }}>
              No issues found. Blueprint configuration is valid.
            </p>
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={handleTest}>
              Test Again
            </ExButton>
          </>
        ) : (
          <>
            <ExIcon icon="play" size={IconSize.L} style={{ color: 'var(--exo-color-font-secondary, #999)' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', marginTop: '16px' }}>Test your Blueprint configuration</p>
            <p style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '20px', maxWidth: '300px' }}>
              Run a validation test to check your YAML configuration before deploying.
            </p>
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={handleTest}>
              Test Blueprint
            </ExButton>
          </>
        )}
      </div>
    </div>
  );
}
