import { ExButton, ExBadge, ExIconButton, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor, BadgeColor } from '@boomi/exosphere';
import { useConnector, useConnectorDispatch } from '../../context/ConnectorContext';
import { createRestStep, createLoopStep, type WorkflowStep, type RestStep } from '../../types/connector';
import RestStepForm from './RestStepForm';
import LoopStepForm from './LoopStepForm';

function deepCloneStep(step: WorkflowStep): WorkflowStep {
  if (step.type === 'rest') {
    return {
      ...step,
      id: crypto.randomUUID(),
      name: `${step.name} (copy)`,
      query_params: step.query_params.map(p => ({ ...p, id: crypto.randomUUID() })),
      headers: step.headers.map(h => ({ ...h, id: crypto.randomUUID() })),
      pagination: step.pagination ? {
        ...step.pagination,
        break_conditions: step.pagination.break_conditions.map(c => ({ ...c, id: crypto.randomUUID() })),
      } : undefined,
      retry: step.retry ? { ...step.retry } : undefined,
      variables_output: step.variables_output.map(v => ({ ...v, id: crypto.randomUUID() })),
    };
  }
  return {
    ...step,
    id: crypto.randomUUID(),
    name: `${step.name} (copy)`,
    nested_steps: step.nested_steps.map(ns => deepCloneStep(ns) as RestStep),
  };
}

export default function StepList() {
  const { config } = useConnector();
  const dispatch = useConnectorDispatch();

  const addStep = (type: 'rest' | 'loop') => {
    const newStep = type === 'rest' ? createRestStep() : createLoopStep();
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { steps: [...config.steps, newStep] },
    });
  };

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    const updated = config.steps.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    dispatch({ type: 'UPDATE_CONFIG', payload: { steps: updated as WorkflowStep[] } });
  };

  const removeStep = (id: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { steps: config.steps.filter(s => s.id !== id) },
    });
  };

  const duplicateStep = (step: WorkflowStep) => {
    const cloned = deepCloneStep(step);
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { steps: [...config.steps, cloned] },
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...config.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    dispatch({ type: 'UPDATE_CONFIG', payload: { steps: newSteps } });
  };

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Workflow Steps
          <div style={{ display: 'flex', gap: '8px' }}>
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={() => addStep('rest')}>
              Add REST Step
            </ExButton>
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={() => addStep('loop')}>
              Add Loop Step
            </ExButton>
          </div>
        </div>

        {config.steps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--exo-color-font, #333)' }}>
              No workflow steps
            </div>
            <div style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Build your data pipeline by adding REST steps for API calls or Loop steps to iterate over data arrays.
              Steps execute in sequence and can reference variables from previous steps.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <ExButton type={ButtonType.PRIMARY} flavor={ButtonFlavor.BRANDED} onClick={() => addStep('rest')}>
                Add REST Step
              </ExButton>
              <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={() => addStep('loop')}>
                Add Loop Step
              </ExButton>
            </div>
          </div>
        ) : (
          config.steps.map((step, index) => (
            <div key={step.id} style={{
              marginBottom: '16px',
              border: '1px solid var(--exo-color-border, #e0e0e0)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--exo-color-background-secondary, #f5f5f5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ExBadge color={step.type === 'rest' ? BadgeColor.BLUE : BadgeColor.NAVY}>
                    {step.type === 'rest' ? 'REST' : 'LOOP'}
                  </ExBadge>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>
                    {step.name || `Step ${index + 1}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.BASE}
                    icon="direction-arrowhead-up"
                    label="Move step up"
                    disabled={index === 0}
                    onClick={() => moveStep(index, 'up')}
                  />
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.BASE}
                    icon="direction-arrowhead-down"
                    label="Move step down"
                    disabled={index === config.steps.length - 1}
                    onClick={() => moveStep(index, 'down')}
                  />
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.BASE}
                    icon="copy"
                    label="Duplicate step"
                    onClick={() => duplicateStep(step)}
                  />
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.RISKY}
                    icon="delete"
                    label="Delete step"
                    onClick={() => removeStep(step.id)}
                  />
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                {step.type === 'rest' ? (
                  <RestStepForm step={step} onChange={(updates) => updateStep(step.id, updates)} />
                ) : (
                  <LoopStepForm step={step} onChange={(updates) => updateStep(step.id, updates)} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
