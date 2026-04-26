import { useRef, useEffect, useCallback, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { undo, redo } from '@codemirror/commands';
import { ExAlertBanner, ExIconButton, AlertBannerType, AlertBannerVariant, IconButtonType, IconButtonFlavor } from '@boomi/exosphere';
import { useConnector } from '../../context/ConnectorContext';
import { useYamlSync } from '../../hooks/useYamlSync';
import { stringify, parse } from 'yaml';

interface YamlEditorProps {
  onTestToggle?: () => void;
  isTestMode?: boolean;
}

export default function YamlEditor({ onTestToggle, isTestMode }: YamlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | undefined>(undefined);
  const { yamlText, yamlError } = useConnector();
  const { handleEditorChange } = useYamlSync();
  const isInternalUpdate = useRef(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isInternalUpdate.current) {
        handleEditorChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: yamlText,
      extensions: [
        basicSetup,
        yaml(),
        updateListener,
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: 'monospace', fontSize: 'var(--exo-font-size-x-small)' },
          '.cm-gutters': {
            background: 'var(--exo-color-background-secondary)',
            border: 'none',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== yamlText) {
      isInternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: yamlText,
        },
      });
      isInternalUpdate.current = false;
    }
  }, [yamlText]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(yamlText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUndo = useCallback(() => {
    const view = viewRef.current;
    if (view) undo(view);
  }, []);

  const handleRedo = useCallback(() => {
    const view = viewRef.current;
    if (view) redo(view);
  }, []);

  const handleFormat = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentText = view.state.doc.toString();
    try {
      const parsed = parse(currentText);
      const formatted = stringify(parsed, { indent: 2, lineWidth: 0 });
      isInternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: formatted },
      });
      isInternalUpdate.current = false;
      handleEditorChange(formatted);
    } catch {
      // Invalid YAML — can't format
    }
  }, [handleEditorChange]);

  const handleCompact = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentText = view.state.doc.toString();
    try {
      const parsed = parse(currentText);
      const compacted = stringify(parsed, { indent: 2, lineWidth: 80 });
      isInternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: compacted },
      });
      isInternalUpdate.current = false;
      handleEditorChange(compacted);
    } catch {
      // Invalid YAML — can't compact
    }
  }, [handleEditorChange]);

  return (
    <div className="yaml-editor-shell">
      <div className="editor-toolbar">
        <div className="editor-toolbar-group">
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="sliders" label="Format YAML" onClick={handleFormat} />
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="columns" label="Compact YAML" onClick={handleCompact} />
        </div>
        <div className="editor-toolbar-divider" />
        <div className="editor-toolbar-group">
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="circular-arrow-single" label="Undo" onClick={handleUndo} />
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="circular-double-arrow" label="Redo" onClick={handleRedo} />
        </div>
        <div className="editor-toolbar-divider" />
        <div className="editor-toolbar-group">
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="copy" label="Copy YAML" onClick={copyToClipboard} />
          {onTestToggle && (
            <ExIconButton
              type={isTestMode ? IconButtonType.PRIMARY : IconButtonType.TERTIARY}
              flavor={isTestMode ? IconButtonFlavor.BRANDED : IconButtonFlavor.BASE}
              icon="console-screen"
              label={isTestMode ? 'Back to YAML Editor' : 'Test Blueprint'}
              onClick={onTestToggle}
            />
          )}
        </div>
      </div>

      {copyFeedback && (
        <div className="yaml-editor-banner">
          <ExAlertBanner type={AlertBannerType.SUCCESS} variant={AlertBannerVariant.INLINE}>
            YAML copied to clipboard
          </ExAlertBanner>
        </div>
      )}

      {yamlError && (
        <ExAlertBanner type={AlertBannerType.ERROR} variant={AlertBannerVariant.INLINE}>
          {yamlError}
        </ExAlertBanner>
      )}

      <div ref={editorRef} className="yaml-editor-content" />

      <div className="yaml-editor-footer">
        Edit YAML directly — changes sync to UI after 1 second
      </div>
    </div>
  );
}
