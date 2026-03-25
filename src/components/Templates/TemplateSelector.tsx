import { ExDialog, ExButton, ButtonType, ButtonFlavor } from '@boomi/exosphere';
import { useConnectorDispatch } from '../../context/ConnectorContext';
import { templates } from '../../engine/templates';

interface Props {
  onClose: () => void;
}

export default function TemplateSelector({ onClose }: Props) {
  const dispatch = useConnectorDispatch();

  const selectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      dispatch({ type: 'RESET', payload: template.config });
      onClose();
    }
  };

  return (
    <ExDialog
      open
      dialogTitle="Select a Template"
      onCancel={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '8px' }}>
          Selecting a template will replace your current configuration.
        </p>
        {templates.map(template => (
          <div
            key={template.id}
            style={{
              padding: '16px',
              border: '1px solid var(--exo-color-border, #e0e0e0)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onClick={() => selectTemplate(template.id)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--exo-color-primary, #0066cc)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--exo-color-border, #e0e0e0)';
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{template.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)' }}>
              {template.description}
            </div>
          </div>
        ))}
      </div>
      <div slot="footer">
        <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={onClose}>Cancel</ExButton>
      </div>
    </ExDialog>
  );
}
