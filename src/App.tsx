import React, { useState, useEffect, useRef } from 'react';
import { ConnectorProvider } from './context/ConnectorContext';
import ConnectorForm from './components/ConnectorConfig/ConnectorForm';
import ParameterList from './components/Parameters/ParameterList';
import StepList from './components/Steps/StepList';
import YamlEditor from './components/Editor/YamlEditor';
import TestPanel from './components/Test/TestPanel';
import TemplateDrawer from './components/Templates/TemplateDrawer';

const TABS = ['Connector Configuration', 'Interface Parameters', 'Workflow Steps'];

function TabBar({ activeTab, onSelect }: { activeTab: number; onSelect: (i: number) => void }) {
  return (
    <div className="tab-bar" role="tablist">
      {TABS.map((label, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="tab-bar-divider" />}
          <button
            role="tab"
            aria-selected={activeTab === i}
            className={`tab-bar-item${activeTab === i ? ' tab-bar-item--active' : ''}`}
            onClick={() => onSelect(i)}
          >
            {label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: number }) {
  switch (activeTab) {
    case 0: return <ConnectorForm />;
    case 1: return <ParameterList />;
    case 2: return <StepList />;
    default: return <ConnectorForm />;
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false);
  const [isWide, setIsWide] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);
  const [sidePanelRatio, setSidePanelRatio] = useState(0.5);
  const [isBottomPanelOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<'vertical' | 'horizontal' | null>(null);

  // Force light theme
  useEffect(() => {
    document.documentElement.classList.remove('ex-theme-dark');
    document.documentElement.classList.add('ex-theme-light');
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsWide(entry.contentRect.width >= 900);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleBottomDragStart = () => {
    startDrag('vertical', (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setBottomPanelHeight(Math.max(120, Math.min(rect.bottom - e.clientY, 500)));
    });
  };

  const handleSideDragStart = () => {
    startDrag('horizontal', (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (rect.right - e.clientX) / rect.width;
      setSidePanelRatio(Math.max(0.2, Math.min(ratio, 0.7)));
    });
  };

  function startDrag(axis: 'vertical' | 'horizontal', onMove: (e: MouseEvent) => void) {
    isDragging.current = axis;
    document.body.style.cursor = axis === 'vertical' ? 'ns-resize' : 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      onMove(e);
    };

    const handleMouseUp = () => {
      isDragging.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  const rightPanel = isTestMode
    ? <TestPanel onBackToEditor={() => setIsTestMode(false)} />
    : <YamlEditor onTestToggle={() => setIsTestMode(!isTestMode)} isTestMode={isTestMode} />;

  if (isWide) {
    return (
      <div className="app-shell" ref={containerRef}>
        <div className="app-body" style={{ flexDirection: 'row' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <TabBar activeTab={activeTab} onSelect={setActiveTab} />
            <div className="tab-content">
              <TabContent activeTab={activeTab} />
            </div>
            <TemplateDrawer
              open={showTemplateDrawer}
              onToggle={() => setShowTemplateDrawer(!showTemplateDrawer)}
            />
          </div>
          <div className="side-resizer" onMouseDown={handleSideDragStart}>
            <div className="side-resizer-line" />
          </div>
          <div className="yaml-side-panel" style={{ width: `${sidePanelRatio * 100}%`, flex: 'none' }}>
            {rightPanel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" ref={containerRef}>
      <div className="app-body" style={{ flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TabBar activeTab={activeTab} onSelect={setActiveTab} />
          <div className="tab-content">
            <TabContent activeTab={activeTab} />
          </div>
          <TemplateDrawer
            open={showTemplateDrawer}
            onToggle={() => setShowTemplateDrawer(!showTemplateDrawer)}
          />
        </div>
        {isBottomPanelOpen && (
          <div className="yaml-bottom-panel" style={{ height: bottomPanelHeight }}>
            <div className="yaml-bottom-handle" onMouseDown={handleBottomDragStart}>
              <div className="yaml-bottom-handle-bar" />
            </div>
            {isTestMode
              ? <TestPanel onBackToEditor={() => setIsTestMode(false)} />
              : <YamlEditor onTestToggle={() => setIsTestMode(!isTestMode)} isTestMode={isTestMode} />
            }
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ConnectorProvider>
      <AppContent />
    </ConnectorProvider>
  );
}

export default App;
