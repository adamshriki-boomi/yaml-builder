import { useState } from 'react';
import { ExButton, ExLoader, ExIconButton, ExEmptyState, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor, LoaderVariant } from '@boomi/exosphere';

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
    <div className="test-panel">
      <div className="editor-toolbar">
        <ExIconButton
          type={IconButtonType.TERTIARY}
          flavor={IconButtonFlavor.BASE}
          icon="direction-arrow-left"
          label="Back to YAML Editor"
          onClick={onBackToEditor}
        />
        <span className="test-panel-title">Test Blueprint</span>
      </div>
      <div className="test-panel-body">
        {testing ? (
          <div className="test-panel-loading">
            <ExLoader variant={LoaderVariant.SPINNER} />
            <p className="test-panel-loading-text">Testing your Blueprint...</p>
          </div>
        ) : tested ? (
          <div className="empty-state-wrap">
            <ExEmptyState
              label="Test Complete"
              text="No issues found. Blueprint configuration is valid."
            >
              <ExButton slot="action" type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={handleTest}>
                Test Again
              </ExButton>
            </ExEmptyState>
          </div>
        ) : (
          <div className="empty-state-wrap">
            <ExEmptyState
              label="Test your Blueprint configuration"
              text="Run a validation test to check your YAML configuration before deploying."
            >
              <ExButton slot="action" type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={handleTest}>
                Test Blueprint
              </ExButton>
            </ExEmptyState>
          </div>
        )}
      </div>
    </div>
  );
}
