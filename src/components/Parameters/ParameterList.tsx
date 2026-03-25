import { ExButton, ExInput, ExSelect, ExToggle, ExLabel, ExIconButton, ExMenuItem, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor } from '@boomi/exosphere';
import { useConnector, useConnectorDispatch } from '../../context/ConnectorContext';
import type { InterfaceParameter } from '../../types/connector';

export default function ParameterList() {
  const { config } = useConnector();
  const dispatch = useConnectorDispatch();

  const addParameter = () => {
    const newParam: InterfaceParameter = {
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      location: 'query',
      is_sensitive: false,
      map_to: '',
    };
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { interface_parameters: [...config.interface_parameters, newParam] },
    });
  };

  const updateParam = (id: string, field: keyof InterfaceParameter, value: any) => {
    const updated = config.interface_parameters.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    dispatch({ type: 'UPDATE_CONFIG', payload: { interface_parameters: updated } });
  };

  const removeParam = (id: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { interface_parameters: config.interface_parameters.filter(p => p.id !== id) },
    });
  };

  const duplicateParam = (param: InterfaceParameter) => {
    const dup: InterfaceParameter = {
      ...param,
      id: crypto.randomUUID(),
      name: `${param.name}_copy`,
    };
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { interface_parameters: [...config.interface_parameters, dup] },
    });
  };

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Interface Parameters
          <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addParameter}>
            Add Parameter
          </ExButton>
        </div>

        {config.interface_parameters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--exo-color-font, #333)' }}>
              No parameters defined
            </div>
            <div style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '20px', maxWidth: '360px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Define input parameters that users of your connector will need to provide,
              such as API keys, date ranges, or configuration values.
            </div>
            <ExButton type={ButtonType.PRIMARY} flavor={ButtonFlavor.BRANDED} onClick={addParameter}>
              Add First Parameter
            </ExButton>
          </div>
        ) : (
          config.interface_parameters.map(param => (
            <div key={param.id} style={{
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid var(--exo-color-border, #e0e0e0)',
              borderRadius: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{param.name || 'New Parameter'}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.BASE}
                    icon="copy"
                    label="Duplicate parameter"
                    onClick={() => duplicateParam(param)}
                  />
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.RISKY}
                    icon="delete"
                    label="Delete parameter"
                    onClick={() => removeParam(param.id)}
                  />
                </div>
              </div>
              <div className="form-row">
                <ExInput
                  label="Parameter Name"
                  value={param.name}
                  placeholder="e.g., api_key"
                  onInput={(e: any) => updateParam(param.id, 'name', e.target.value)}
                />
                <ExSelect
                  label="Type"
                  selected={param.type}
                  valueBasedSelection
                  onChange={(e: any) => {
                    const val = e.detail?.value;
                    if (val) updateParam(param.id, 'type', val);
                  }}
                >
                  <ExMenuItem value="string">String</ExMenuItem>
                  <ExMenuItem value="authentication">Authentication</ExMenuItem>
                  <ExMenuItem value="date_range">Date Range</ExMenuItem>
                  <ExMenuItem value="list">List</ExMenuItem>
                </ExSelect>
              </div>
              <div className="form-row">
                <ExSelect
                  label="Location"
                  selected={param.location}
                  valueBasedSelection
                  onChange={(e: any) => {
                    const val = e.detail?.value;
                    if (val) updateParam(param.id, 'location', val);
                  }}
                >
                  <ExMenuItem value="query">Query String</ExMenuItem>
                  <ExMenuItem value="header">Header</ExMenuItem>
                  <ExMenuItem value="body">Body</ExMenuItem>
                  <ExMenuItem value="path">Path</ExMenuItem>
                </ExSelect>
                <ExInput
                  label="Map To (optional)"
                  value={param.map_to}
                  placeholder="Map to different field name"
                  onInput={(e: any) => updateParam(param.id, 'map_to', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <ExToggle
                  on={param.is_sensitive}
                  onChange={() => updateParam(param.id, 'is_sensitive', !param.is_sensitive)}
                />
                <ExLabel>Sensitive / Encrypted</ExLabel>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
