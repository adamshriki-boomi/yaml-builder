import { ExButton, ExInput, ExSelect, ExToggle, ExLabel, ExIconButton, ExMenuItem, ExAccordion, ExAccordionItem, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor, AccordionVariant } from '@boomi/exosphere';
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
      <ExAccordion variant={AccordionVariant.FLAT} allowMultiple>
        <ExAccordionItem
          label={`Existing Parameters (${config.interface_parameters.length})`}
          open
          variant={AccordionVariant.FLAT}
        >
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
            config.interface_parameters.map((param, index) => (
              <div key={param.id} style={{
                background: 'var(--exo-color-background-secondary, #f5f5f5)',
                border: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--exo-color-font-secondary, #666)' }}>
                    Parameter {index + 1}
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
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
                  <ExSelect
                    label="Parameter Type"
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
                  <ExInput
                    label="Parameter Name"
                    value={param.name}
                    placeholder="e.g., api_key"
                    helpText="A unique identifier for this parameter"
                    onInput={(e: any) => updateParam(param.id, 'name', e.target.value)}
                  />
                </div>
                {param.type === 'authentication' && (
                  <div className="form-field">
                    <ExSelect
                      label="Auth Type"
                      selected={param.location}
                      valueBasedSelection
                      onChange={(e: any) => {
                        const val = e.detail?.value;
                        if (val) updateParam(param.id, 'location', val);
                      }}
                    >
                      <ExMenuItem value="header">Header</ExMenuItem>
                      <ExMenuItem value="query">Query String</ExMenuItem>
                      <ExMenuItem value="body">Body</ExMenuItem>
                    </ExSelect>
                  </div>
                )}
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
        </ExAccordionItem>
      </ExAccordion>

      <div style={{ marginTop: '16px' }}>
        <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addParameter}>
          + Add Parameter
        </ExButton>
      </div>
    </div>
  );
}
