import { useRef, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { ExAlertBanner, ExIconButton, AlertBannerType, AlertBannerVariant, IconButtonType, IconButtonFlavor } from '@boomi/exosphere';
import { useConnector } from '../../context/ConnectorContext';
import { useYamlSync } from '../../hooks/useYamlSync';

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

  // Initialize CodeMirror
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
          '.cm-content': { fontFamily: 'monospace', fontSize: '13px' },
          '.cm-gutters': {
            background: 'var(--exo-color-background-secondary, #f5f5f5)',
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

  // Sync YAML text from state to editor (when changed from UI)
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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="editor-toolbar">
        <div className="editor-toolbar-group">
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="sliders" label="Format" />
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="columns" label="Compact" />
        </div>
        <div className="editor-toolbar-divider" />
        <div className="editor-toolbar-group">
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="circular-arrow-single" label="Undo" />
          <ExIconButton type={IconButtonType.TERTIARY} flavor={IconButtonFlavor.BASE} icon="circular-double-arrow" label="Redo" />
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

      {yamlError && (
        <ExAlertBanner type={AlertBannerType.ERROR} variant={AlertBannerVariant.INLINE}>
          {yamlError}
        </ExAlertBanner>
      )}

      <div ref={editorRef} style={{ flex: 1, overflow: 'hidden' }} />

      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--exo-color-border, #e0e0e0)',
        fontSize: '11px',
        color: 'var(--exo-color-font-secondary, #666)',
      }}>
        Edit YAML directly — changes sync to UI after 1 second
      </div>
    </div>
  );
}
