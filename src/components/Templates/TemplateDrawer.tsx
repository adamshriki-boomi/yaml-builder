import { useState } from 'react';
import { ExButton, ExDialog, ExIcon, ButtonType, ButtonFlavor, DialogHeaderContent, IconSize } from '@boomi/exosphere';
import { useConnectorDispatch } from '../../context/ConnectorContext';
import { templates } from '../../engine/templates';

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  AUTH: { bg: '#e8f0fe', color: '#1a73e8' },
  PAGINATION: { bg: '#fef7e0', color: '#b06000' },
  'MULTI-REPORT': { bg: '#e6f4ea', color: '#137333' },
};

function getTagStyle(tag: string): { background: string; color: string } {
  const mapped = TAG_COLORS[tag];
  if (mapped) return { background: mapped.bg, color: mapped.color };
  return { background: '#f1f3f4', color: '#5f6368' };
}

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function TemplateDrawer({ open, onToggle }: Props) {
  const dispatch = useConnectorDispatch();
  const [confirmTemplateId, setConfirmTemplateId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!confirmTemplateId) return;
    const template = templates.find(t => t.id === confirmTemplateId);
    if (template) {
      dispatch({ type: 'RESET', payload: template.config });
    }
    setConfirmTemplateId(null);
    onToggle();
  };

  const handleCancel = () => {
    setConfirmTemplateId(null);
  };

  return (
    <>
      <div>
        {open && (
          <div className="template-drawer-panel">
            <div className="template-drawer-header">
              <div className="template-drawer-header-left">
                <ExIcon icon="template" size={IconSize.S} />
                <div>
                  <div className="template-drawer-title">Select a Template</div>
                  <div className="template-drawer-subtitle">Start with a pre-configured setup to save time</div>
                </div>
              </div>
              <button className="template-drawer-close" onClick={onToggle} aria-label="Close templates">
                <ExIcon icon="close" size={IconSize.S} />
              </button>
            </div>
            <div className="template-grid">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="template-tile"
                  onClick={() => setConfirmTemplateId(template.id)}
                >
                  <div className="template-tile-name">{template.name}</div>
                  <div className="template-tile-desc">{template.description}</div>
                  {template.tags && template.tags.length > 0 && (
                    <div className="template-tile-tags">
                      {template.tags.map(tag => (
                        <span key={tag} className="template-tag" style={getTagStyle(tag)}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="template-drawer-trigger" onClick={onToggle}>
          <ExIcon icon="document" size={IconSize.XS} />
          <span className="template-drawer-trigger-text">
            {open ? 'Hide templates' : 'Quick start: Select a template'}
          </span>
          <ExIcon icon={open ? 'direction-caret-down' : 'direction-caret-up'} size={IconSize.XS} style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {confirmTemplateId && (
        <ExDialog
          open
          dialogTitle="Replace Configuration?"
          headerContent={DialogHeaderContent.WARNING}
          onCancel={handleCancel}
        >
          <p style={{ fontSize: '14px', color: 'var(--exo-color-font, #333)' }}>
            This will replace all your current configuration. Are you sure?
          </p>
          <div slot="footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={handleCancel}>
              Cancel
            </ExButton>
            <ExButton type={ButtonType.PRIMARY} flavor={ButtonFlavor.BASE} onClick={handleConfirm}>
              Confirm
            </ExButton>
          </div>
        </ExDialog>
      )}
    </>
  );
}
