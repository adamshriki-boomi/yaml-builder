import { ExInput, ExSelect, ExButton, ExIconButton, ExMenuItem, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor } from '@boomi/exosphere';
import { useConnector, useConnectorDispatch } from '../../context/ConnectorContext';
import type { Header } from '../../types/connector';
import AuthConfigSection from './AuthConfig';

export default function ConnectorForm() {
  const { config } = useConnector();
  const dispatch = useConnectorDispatch();

  const updateField = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { [field]: value } });
  };

  // --- Headers ---
  const addHeader = () => {
    const newHeader: Header = { id: crypto.randomUUID(), name: '', value: '' };
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { default_headers: [...config.default_headers, newHeader] },
    });
  };

  const updateHeader = (id: string, field: 'name' | 'value', val: string) => {
    const updated = config.default_headers.map(h =>
      h.id === id ? { ...h, [field]: val } : h
    );
    dispatch({ type: 'UPDATE_CONFIG', payload: { default_headers: updated } });
  };

  const removeHeader = (id: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { default_headers: config.default_headers.filter(h => h.id !== id) },
    });
  };

  // --- Variables Metadata ---
  const updateVariablesMeta = (field: string, value: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        variables_metadata: { ...config.variables_metadata, [field]: value },
      },
    });
  };

  return (
    <div>
      {/* Basic Configuration */}
      <div className="form-section">
        <div className="form-section-title">Basic Configuration</div>
        <div className="form-field">
          <ExInput
            label="Connector Name"
            value={config.connector_name}
            placeholder="e.g., GitHub API Connector"
            onInput={(e: any) => updateField('connector_name', e.target.value)}
          />
        </div>
        <div className="form-field">
          <ExInput
            label="Base URL"
            value={config.base_url}
            placeholder="e.g., https://api.example.com/v1"
            onInput={(e: any) => updateField('base_url', e.target.value)}
          />
        </div>
      </div>

      {/* Default Headers */}
      <div className="form-section">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Default Headers
          <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addHeader}>
            Add Header
          </ExButton>
        </div>
        {config.default_headers.length === 0 && (
          <p style={{ color: 'var(--exo-color-font-secondary, #666)', fontSize: '13px' }}>
            No default headers configured. Add headers that will be included in every request.
          </p>
        )}
        {config.default_headers.map(header => (
          <div key={header.id} className="form-row" style={{ alignItems: 'flex-end' }}>
            <ExInput
              label="Header Name"
              value={header.name}
              placeholder="e.g., Content-Type"
              onInput={(e: any) => updateHeader(header.id, 'name', e.target.value)}
            />
            <ExInput
              label="Header Value"
              value={header.value}
              placeholder="e.g., application/json"
              onInput={(e: any) => updateHeader(header.id, 'value', e.target.value)}
            />
            <ExIconButton
              type={IconButtonType.SECONDARY}
              flavor={IconButtonFlavor.RISKY}
              icon="delete"
              label="Delete header"
              onClick={() => removeHeader(header.id)}
            />
          </div>
        ))}
      </div>

      {/* Authentication */}
      <AuthConfigSection />

      {/* Variables Metadata */}
      <div className="form-section">
        <div className="form-section-title">Variables Metadata</div>
        <div className="form-row">
          <ExSelect
            label="Storage"
            selected={config.variables_metadata.storage}
            valueBasedSelection
            onChange={(e: any) => {
              const val = e.detail?.value;
              if (val) updateVariablesMeta('storage', val);
            }}
          >
            <ExMenuItem value="file_system">File System</ExMenuItem>
            <ExMenuItem value="memory">Memory</ExMenuItem>
          </ExSelect>
          <ExSelect
            label="Data Format"
            selected={config.variables_metadata.data_format}
            valueBasedSelection
            onChange={(e: any) => {
              const val = e.detail?.value;
              if (val) updateVariablesMeta('data_format', val);
            }}
          >
            <ExMenuItem value="json">JSON</ExMenuItem>
            <ExMenuItem value="text">Text</ExMenuItem>
          </ExSelect>
        </div>
        <div className="form-field">
          <ExInput
            label="Results Directory (optional)"
            value={config.variables_metadata.results_dir}
            placeholder="e.g., /output/results"
            onInput={(e: any) => updateVariablesMeta('results_dir', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
