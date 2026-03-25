import { useState } from 'react';
import { ExButton, ExBadge, ExIconButton, ExInput, ButtonType, ButtonFlavor, IconButtonType, IconButtonFlavor, BadgeColor } from '@boomi/exosphere';
import CollapsibleSection from '../Layout/CollapsibleSection';
import { useConnector, useConnectorDispatch } from '../../context/ConnectorContext';
import {
  createRestStep,
  createLoopStep,
  createMultiReport,
  createConfigurationGroup,
  createReportParameter,
  type WorkflowStep,
  type RestStep,
  type MultiReport,
  type ConfigurationGroup,
  type ReportParameter,
} from '../../types/connector';
import RestStepForm from './RestStepForm';
import LoopStepForm from './LoopStepForm';

// ===== Shared step management for any steps array =====

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
      variables_output: step.variables_output.map(v => ({
        ...v,
        id: crypto.randomUUID(),
        transformation_layers: v.transformation_layers.map(t => ({ ...t, id: crypto.randomUUID() })),
      })),
    };
  }
  return {
    ...step,
    id: crypto.randomUUID(),
    name: `${step.name} (copy)`,
    nested_steps: step.nested_steps.map(ns => deepCloneStep(ns) as RestStep),
  };
}

// ===== Reusable step list renderer =====

function StepListRenderer({
  steps,
  onUpdate,
}: {
  steps: WorkflowStep[];
  onUpdate: (newSteps: WorkflowStep[]) => void;
}) {
  const addStep = (type: 'rest' | 'loop') => {
    const newStep = type === 'rest' ? createRestStep() : createLoopStep();
    onUpdate([...steps, newStep]);
  };

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    const updated = steps.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    onUpdate(updated as WorkflowStep[]);
  };

  const removeStep = (id: string) => {
    onUpdate(steps.filter(s => s.id !== id));
  };

  const duplicateStep = (step: WorkflowStep) => {
    const cloned = deepCloneStep(step);
    onUpdate([...steps, cloned]);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    onUpdate(newSteps);
  };

  return (
    <div>
      {steps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '12px' }}>
            No steps yet. Add REST or Loop steps to build the workflow.
          </div>
        </div>
      ) : (
        steps.map((step, index) => (
          <div key={step.id} style={{
            background: 'var(--exo-color-background-secondary, #f5f5f5)',
            border: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--exo-color-font-secondary, #666)' }}>
                  Step {index + 1}
                </span>
                <ExBadge color={step.type === 'rest' ? BadgeColor.BLUE : BadgeColor.NAVY}>
                  {step.type === 'rest' ? 'REST' : 'LOOP'}
                </ExBadge>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>
                  {step.name || `Step ${index + 1}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
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
                  disabled={index === steps.length - 1}
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
            <div>
              {step.type === 'rest' ? (
                <RestStepForm step={step} onChange={(updates) => updateStep(step.id, updates)} />
              ) : (
                <LoopStepForm step={step} onChange={(updates) => updateStep(step.id, updates)} />
              )}
            </div>
          </div>
        ))
      )}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={() => addStep('rest')}>
          + Add REST Step
        </ExButton>
        <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={() => addStep('loop')}>
          + Add Loop Step
        </ExButton>
      </div>
    </div>
  );
}

// ===== Multi-Report Card =====

function MultiReportCard({
  report,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  report: MultiReport;
  index: number;
  onUpdate: (updates: Partial<MultiReport>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateReportParam = (paramId: string, field: keyof ReportParameter, value: any) => {
    const updated = report.report_parameters.map(rp =>
      rp.id === paramId ? { ...rp, [field]: value } : rp
    );
    onUpdate({ report_parameters: updated });
  };

  const addReportParam = () => {
    onUpdate({ report_parameters: [...report.report_parameters, createReportParameter()] });
  };

  const removeReportParam = (id: string) => {
    onUpdate({ report_parameters: report.report_parameters.filter(rp => rp.id !== id) });
  };

  return (
    <div style={{
      border: '2px solid var(--exo-color-border, #e0e0e0)',
      borderRadius: '10px',
      marginBottom: '16px',
      overflow: 'hidden',
    }}>
      {/* Report Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--exo-color-background-secondary, #f5f5f5)',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExBadge color={BadgeColor.BLUE}>Report {index + 1}</ExBadge>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {report.name || `Report ${index + 1}`}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--exo-color-font-secondary, #666)' }}>
            ({report.steps.length} step{report.steps.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
          <ExIconButton
            type={IconButtonType.SECONDARY}
            flavor={IconButtonFlavor.BASE}
            icon="copy"
            label="Duplicate report"
            onClick={onDuplicate}
          />
          <ExIconButton
            type={IconButtonType.SECONDARY}
            flavor={IconButtonFlavor.RISKY}
            icon="delete"
            label="Delete report"
            onClick={onRemove}
          />
        </div>
      </div>

      {/* Report Body */}
      {expanded && (
        <div style={{ padding: '16px' }}>
          <div className="form-field">
            <ExInput
              label="Report Name"
              value={report.name}
              placeholder="e.g., Campaign Performance"
              onInput={(e: any) => onUpdate({ name: e.target.value })}
            />
          </div>

          {/* Report Parameters */}
          <CollapsibleSection label={`Report Parameters (${report.report_parameters.length})`} defaultOpen={false}>
            {report.report_parameters.map((rp, rpIdx) => (
              <div key={rp.id} style={{
                padding: '8px',
                marginBottom: '6px',
                border: '1px solid var(--exo-color-border, #e0e0e0)',
                borderRadius: '6px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--exo-color-font-secondary, #666)' }}>Param {rpIdx + 1}</span>
                  <ExIconButton
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.RISKY}
                    icon="delete"
                    label="Delete parameter"
                    onClick={() => removeReportParam(rp.id)}
                  />
                </div>
                <div className="form-row">
                  <ExInput
                    label="Name"
                    value={rp.name}
                    placeholder="e.g., date_range"
                    onInput={(e: any) => updateReportParam(rp.id, 'name', e.target.value)}
                  />
                  <ExInput
                    label="Type"
                    value={rp.type}
                    placeholder="e.g., string"
                    onInput={(e: any) => updateReportParam(rp.id, 'type', e.target.value)}
                  />
                  <ExInput
                    label="Default"
                    value={rp.default || ''}
                    placeholder="Default value"
                    onInput={(e: any) => updateReportParam(rp.id, 'default', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addReportParam}>
              + Add Parameter
            </ExButton>
          </CollapsibleSection>

          {/* Report Steps */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Steps</div>
            <StepListRenderer
              steps={report.steps}
              onUpdate={(newSteps) => onUpdate({ steps: newSteps })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Configuration Group Card =====

function ConfigGroupCard({
  group,
  index,
  label,
  onUpdate,
  onRemove,
}: {
  group: ConfigurationGroup;
  index: number;
  label: string;
  onUpdate: (updates: Partial<ConfigurationGroup>) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{
      border: '1px solid var(--exo-color-border, #e0e0e0)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExBadge color={BadgeColor.GRAY}>{label} {index + 1}</ExBadge>
          <span style={{ fontWeight: 600, fontSize: '13px' }}>
            {group.name || `${label} ${index + 1}`}
          </span>
        </div>
        <ExIconButton
          type={IconButtonType.SECONDARY}
          flavor={IconButtonFlavor.RISKY}
          icon="delete"
          label={`Delete ${label.toLowerCase()}`}
          onClick={onRemove}
        />
      </div>
      <div className="form-field">
        <ExInput
          label="Group Name"
          value={group.name}
          placeholder={`e.g., ${label === 'Pre-Run' ? 'Init Data' : 'Finalize'}`}
          onInput={(e: any) => onUpdate({ name: e.target.value })}
        />
      </div>
      <StepListRenderer
        steps={group.steps}
        onUpdate={(newSteps) => onUpdate({ steps: newSteps })}
      />
    </div>
  );
}

// ===== Main Component =====

export default function StepList() {
  const { config } = useConnector();
  const dispatch = useConnectorDispatch();

  // --- Pre-Run ---
  const addPreRunGroup = () => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { pre_run_configurations: [...config.pre_run_configurations, createConfigurationGroup()] },
    });
  };

  const updatePreRunGroup = (id: string, updates: Partial<ConfigurationGroup>) => {
    const updated = config.pre_run_configurations.map(g =>
      g.id === id ? { ...g, ...updates } : g
    );
    dispatch({ type: 'UPDATE_CONFIG', payload: { pre_run_configurations: updated } });
  };

  const removePreRunGroup = (id: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { pre_run_configurations: config.pre_run_configurations.filter(g => g.id !== id) },
    });
  };

  // --- Multi-Reports ---
  const addReport = () => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { multi_reports: [...config.multi_reports, createMultiReport()] },
    });
  };

  const updateReport = (id: string, updates: Partial<MultiReport>) => {
    const updated = config.multi_reports.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    dispatch({ type: 'UPDATE_CONFIG', payload: { multi_reports: updated } });
  };

  const removeReport = (id: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { multi_reports: config.multi_reports.filter(r => r.id !== id) },
    });
  };

  const duplicateReport = (report: MultiReport) => {
    const dup: MultiReport = {
      ...report,
      id: crypto.randomUUID(),
      name: `${report.name} (copy)`,
      report_parameters: report.report_parameters.map(rp => ({ ...rp, id: crypto.randomUUID() })),
      steps: report.steps.map(s => deepCloneStep(s)),
    };
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { multi_reports: [...config.multi_reports, dup] },
    });
  };

  // --- Post-Run ---
  const addPostRunGroup = () => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { post_run_configurations: [...config.post_run_configurations, createConfigurationGroup()] },
    });
  };

  const updatePostRunGroup = (id: string, updates: Partial<ConfigurationGroup>) => {
    const updated = config.post_run_configurations.map(g =>
      g.id === id ? { ...g, ...updates } : g
    );
    dispatch({ type: 'UPDATE_CONFIG', payload: { post_run_configurations: updated } });
  };

  const removePostRunGroup = (id: string) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { post_run_configurations: config.post_run_configurations.filter(g => g.id !== id) },
    });
  };

  return (
    <div>
      {/* Pre-Run Configurations */}
      <CollapsibleSection label={`Pre-Run Configurations (${config.pre_run_configurations.length})`} defaultOpen={false}>
        <p style={{ color: 'var(--exo-color-font-secondary, #666)', fontSize: '13px', marginBottom: '12px' }}>
          Initialization and discovery steps that run before the main reports.
        </p>
        {config.pre_run_configurations.map((group, idx) => (
          <ConfigGroupCard
            key={group.id}
            group={group}
            index={idx}
            label="Pre-Run"
            onUpdate={(updates) => updatePreRunGroup(group.id, updates)}
            onRemove={() => removePreRunGroup(group.id)}
          />
        ))}
        <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addPreRunGroup}>
          + Add Pre-Run Group
        </ExButton>
      </CollapsibleSection>

      {/* Multi-Reports */}
      <CollapsibleSection label={`Multi-Reports (${config.multi_reports.length})`}>
        <p style={{ color: 'var(--exo-color-font-secondary, #666)', fontSize: '13px', marginBottom: '16px' }}>
          Independent reports that each define their own parameters and workflow steps.
        </p>
        {config.multi_reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--exo-color-font, #333)' }}>
              No reports defined
            </div>
            <div style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Add multi-reports to define independent data extraction workflows. Each report can have its own parameters and steps.
            </div>
            <ExButton type={ButtonType.PRIMARY} flavor={ButtonFlavor.BRANDED} onClick={addReport}>
              Add First Report
            </ExButton>
          </div>
        ) : (
          config.multi_reports.map((report, idx) => (
            <MultiReportCard
              key={report.id}
              report={report}
              index={idx}
              onUpdate={(updates) => updateReport(report.id, updates)}
              onRemove={() => removeReport(report.id)}
              onDuplicate={() => duplicateReport(report)}
            />
          ))
        )}
        {config.multi_reports.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addReport}>
              + Add Report
            </ExButton>
          </div>
        )}
      </CollapsibleSection>

      {/* Post-Run Configurations */}
      <CollapsibleSection label={`Post-Run Configurations (${config.post_run_configurations.length})`} defaultOpen={false}>
        <p style={{ color: 'var(--exo-color-font-secondary, #666)', fontSize: '13px', marginBottom: '12px' }}>
          Cleanup and finalization steps that run after all reports complete.
        </p>
        {config.post_run_configurations.map((group, idx) => (
          <ConfigGroupCard
            key={group.id}
            group={group}
            index={idx}
            label="Post-Run"
            onUpdate={(updates) => updatePostRunGroup(group.id, updates)}
            onRemove={() => removePostRunGroup(group.id)}
          />
        ))}
        <ExButton type={ButtonType.SECONDARY} flavor={ButtonFlavor.BASE} onClick={addPostRunGroup}>
          + Add Post-Run Group
        </ExButton>
      </CollapsibleSection>
    </div>
  );
}
