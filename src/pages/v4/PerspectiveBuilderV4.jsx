import { useCallback, useState } from 'react';
import ContextModelBrowser from '../v3/stage1/ContextModelBrowser';
import PerspectiveRefineView from '../v3/stage2/PerspectiveRefineView';
import StudioHeader from '../v3/shell/StudioHeader';
import StudioTabBar from '../v3/shell/StudioTabBar';
import StudioAssetPlaceholder from '../v3/shell/StudioAssetPlaceholder';
import DemoTourPopover from '../../components/demoTour/DemoTourPopover';
import { DemoTourProvider, useDemoTour } from '../../components/demoTour/DemoTourContext';
import ProcessDetailView from './process/ProcessDetailView';
import StudioL0Nav from './shell/StudioL0Nav';
import StudioL1Nav from './shell/StudioL1Nav';
import { getProcessSeed } from './data/processPageData';
import {
  CONTEXT_BROWSE_TAB_ID,
  assetKey,
  tabIconForType,
} from './shell/studioAssets';
import styles from '../v3/PerspectiveBuilderV3.module.css';

const DEFAULT_PERSPECTIVE_NAME = 'Order to Cash Perspective';

function createEmptyContextState(overrides = {}) {
  return {
    selectionMode: false,
    perspectiveName: DEFAULT_PERSPECTIVE_NAME,
    selectedObjects: new Set(),
    selectedEvents: new Set(),
    ...overrides,
  };
}

function createEmptyProcessState(overrides = {}) {
  return {
    selectionMode: false,
    selectedObjects: new Set(),
    selectedEvents: new Set(),
    ...overrides,
  };
}

function createBrowseTab() {
  return {
    id: CONTEXT_BROWSE_TAB_ID,
    label: 'Browse Context Model',
    type: 'context',
    icon: 'grid',
    assetKey: 'context:browse',
    closable: true,
  };
}

function PerspectiveBuilderV4Shell({
  onVersionChange,
  workspaceTabs,
  setWorkspaceTabs,
  activeTabId,
  setActiveTabId,
  contextByTab,
  setContextByTab,
  processByTab,
  setProcessByTab,
}) {
  const { markEvent, mergeMilestone } = useDemoTour();

  const patchContextTab = useCallback((tabId, patch) => {
    setContextByTab((prev) => ({
      ...prev,
      [tabId]: {
        ...createEmptyContextState(),
        ...prev[tabId],
        ...patch,
      },
    }));
  }, [setContextByTab]);

  const patchProcessTab = useCallback((tabId, patch) => {
    setProcessByTab((prev) => ({
      ...prev,
      [tabId]: {
        ...createEmptyProcessState(),
        ...prev[tabId],
        ...patch,
      },
    }));
  }, [setProcessByTab]);

  const toggleObjectForContextTab = useCallback((tabId, id) => {
    setContextByTab((prev) => {
      const state = prev[tabId] ?? createEmptyContextState();
      const next = new Set(state.selectedObjects);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tabId]: { ...state, selectedObjects: next } };
    });
  }, []);

  const toggleEventForContextTab = useCallback((tabId, id) => {
    setContextByTab((prev) => {
      const state = prev[tabId] ?? createEmptyContextState();
      const next = new Set(state.selectedEvents);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tabId]: { ...state, selectedEvents: next } };
    });
  }, []);

  const toggleObjectForProcessTab = useCallback((tabId, id) => {
    setProcessByTab((prev) => {
      const state = prev[tabId] ?? createEmptyProcessState();
      const next = new Set(state.selectedObjects);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tabId]: { ...state, selectedObjects: next } };
    });
  }, [setProcessByTab]);

  const toggleEventForProcessTab = useCallback((tabId, id) => {
    setProcessByTab((prev) => {
      const state = prev[tabId] ?? createEmptyProcessState();
      const next = new Set(state.selectedEvents);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tabId]: { ...state, selectedEvents: next } };
    });
  }, [setProcessByTab]);

  const exitContextSelection = useCallback((tabId) => {
    patchContextTab(tabId, {
      selectionMode: false,
      selectedObjects: new Set(),
      selectedEvents: new Set(),
    });
  }, [patchContextTab]);

  const exitProcessSelection = useCallback((tabId) => {
    patchProcessTab(tabId, {
      selectionMode: false,
      selectedObjects: new Set(),
      selectedEvents: new Set(),
    });
  }, [patchProcessTab]);

  const openRefineTab = useCallback((objects, events, name, options = {}) => {
    const label = name.trim() || DEFAULT_PERSPECTIVE_NAME;
    const tabId = `tab-perspective-${Date.now()}`;
    const refineKey = Date.now();
    setWorkspaceTabs((tabs) => [
      ...tabs,
      {
        id: tabId,
        label,
        type: 'refine',
        icon: 'perspective',
        assetKey: options.assetKey ?? `perspective:${tabId}`,
        payload: { objects, events, name: label },
        refineKey,
        closable: true,
      },
    ]);
    setActiveTabId(tabId);
  }, [setWorkspaceTabs, setActiveTabId]);

  const openCreatePerspectiveTab = useCallback(() => {
    markEvent('scratchPerspectiveCreated');
    openRefineTab([], [], 'New Perspective');
  }, [openRefineTab, markEvent]);

  const handleAddToNewPerspective = useCallback(
    (tabId) => {
      const state = contextByTab[tabId];
      if (!state) return;
      mergeMilestone('contextAddClickedOnce');
      markEvent('contextPerspectiveCreated');
      openRefineTab(
        [...state.selectedObjects],
        [...state.selectedEvents],
        'New Perspective',
      );
      exitContextSelection(tabId);
    },
    [contextByTab, openRefineTab, exitContextSelection, markEvent, mergeMilestone],
  );

  const handleCreateFromEntireProcess = useCallback(
    (tabId) => {
      const tab = workspaceTabs.find((t) => t.id === tabId);
      const seed = tab?.payload?.seed ?? getProcessSeed(tab?.payload?.processId);
      openRefineTab(
        [...seed.objects],
        [...seed.events],
        `${tab?.payload?.label ?? 'Process'} Perspective`,
      );
      exitProcessSelection(tabId);
    },
    [workspaceTabs, openRefineTab, exitProcessSelection],
  );

  const handleCreateFromProcessSelection = useCallback(
    (tabId) => {
      const state = processByTab[tabId];
      if (!state) return;
      const tab = workspaceTabs.find((t) => t.id === tabId);
      openRefineTab(
        [...state.selectedObjects],
        [...state.selectedEvents],
        'New Perspective',
      );
      exitProcessSelection(tabId);
    },
    [processByTab, workspaceTabs, openRefineTab, exitProcessSelection],
  );

  const handleOpenAsset = useCallback(
    (asset) => {
      if (asset.assetType === 'context') {
        setActiveTabId(CONTEXT_BROWSE_TAB_ID);
        return;
      }
      if (asset.assetType === 'placeholder') return;

      const key = assetKey(asset);
      const existing = workspaceTabs.find((tab) => tab.assetKey === key);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }

      if (asset.assetType === 'perspective' && asset.seed) {
        openRefineTab(
          [...asset.seed.objects],
          [...asset.seed.events],
          asset.perspectiveName || asset.label,
          { assetKey: key },
        );
        return;
      }

      if (asset.assetType === 'process') {
        const seed = asset.seed ?? getProcessSeed(asset.id);
        const tabId = `tab-process-${asset.id}-${Date.now()}`;
        setWorkspaceTabs((tabs) => [
          ...tabs,
          {
            id: tabId,
            label: asset.label,
            type: 'process',
            icon: tabIconForType('process'),
            assetKey: key,
            payload: {
              processId: asset.id,
              label: asset.label,
              seed,
            },
            closable: true,
          },
        ]);
        setProcessByTab((prev) => ({
          ...prev,
          [tabId]: createEmptyProcessState(),
        }));
        setActiveTabId(tabId);
        return;
      }

      const tabId = `tab-${asset.assetType}-${asset.id}-${Date.now()}`;
      setWorkspaceTabs((tabs) => [
        ...tabs,
        {
          id: tabId,
          label: asset.label,
          type: asset.assetType,
          icon: tabIconForType(asset.assetType),
          assetKey: key,
          closable: true,
        },
      ]);
      setActiveTabId(tabId);
    },
    [openRefineTab, workspaceTabs, setProcessByTab],
  );

  const handleAddToExistingPerspective = useCallback(
    (tabId, asset) => {
      handleOpenAsset(asset);
      exitContextSelection(tabId);
    },
    [handleOpenAsset, exitContextSelection],
  );

  const handleAddToExistingProcess = useCallback(
    (tabId, asset) => {
      handleOpenAsset(asset);
      exitContextSelection(tabId);
    },
    [handleOpenAsset, exitContextSelection],
  );

  const handleAddToNewProcess = useCallback(
    (tabId) => {
      const newTabId = `tab-process-new-${Date.now()}`;
      setWorkspaceTabs((tabs) => [
        ...tabs,
        {
          id: newTabId,
          label: 'New Process',
          type: 'process',
          icon: 'process',
          assetKey: `process:new-${Date.now()}`,
          closable: true,
        },
      ]);
      setActiveTabId(newTabId);
      exitContextSelection(tabId);
    },
    [exitContextSelection],
  );

  const handleCloseTab = useCallback(
    (tabId) => {
      setWorkspaceTabs((tabs) => {
        if (tabs.length <= 1) return tabs;
        const index = tabs.findIndex((tab) => tab.id === tabId);
        const next = tabs.filter((tab) => tab.id !== tabId);
        if (activeTabId === tabId) {
          const fallback = next[Math.max(0, index - 1)] ?? next[0];
          setActiveTabId(fallback.id);
        }
        return next;
      });
      setContextByTab((prev) => {
        if (!prev[tabId]) return prev;
        const next = { ...prev };
        delete next[tabId];
        return next;
      });
      setProcessByTab((prev) => {
        if (!prev[tabId]) return prev;
        const next = { ...prev };
        delete next[tabId];
        return next;
      });
    },
    [activeTabId, setProcessByTab],
  );

  const handleAddTab = useCallback(() => {
    const browseTab = workspaceTabs.find((tab) => tab.id === CONTEXT_BROWSE_TAB_ID);
    if (browseTab) {
      setActiveTabId(CONTEXT_BROWSE_TAB_ID);
      return;
    }
    setWorkspaceTabs((tabs) => [createBrowseTab(), ...tabs]);
    setContextByTab((prev) => ({
      ...prev,
      [CONTEXT_BROWSE_TAB_ID]: createEmptyContextState(),
    }));
    setActiveTabId(CONTEXT_BROWSE_TAB_ID);
  }, [workspaceTabs, setContextByTab]);

  const activeTab = workspaceTabs.find((tab) => tab.id === activeTabId);
  const activeAssetKey = activeTab?.assetKey ?? null;

  const renderTabPane = (tab) => {
    if (tab.type === 'context') {
      const contextState = contextByTab[tab.id] ?? createEmptyContextState();
      return (
        <ContextModelBrowser
          selectionMode={contextState.selectionMode}
          onEnterSelectionMode={() => patchContextTab(tab.id, { selectionMode: true })}
          onCancelSelection={() => exitContextSelection(tab.id)}
          selectedObjects={contextState.selectedObjects}
          selectedEvents={contextState.selectedEvents}
          onToggleObject={(id) => toggleObjectForContextTab(tab.id, id)}
          onToggleEvent={(id) => toggleEventForContextTab(tab.id, id)}
          onAddToNewPerspective={() => handleAddToNewPerspective(tab.id)}
          onAddToPerspective={(asset) => handleAddToExistingPerspective(tab.id, asset)}
          onAddToProcess={(asset) => handleAddToExistingProcess(tab.id, asset)}
          onAddToNewProcess={() => handleAddToNewProcess(tab.id)}
        />
      );
    }

    if (tab.type === 'refine' && tab.payload) {
      return (
        <PerspectiveRefineView
          key={tab.refineKey ?? tab.id}
          perspectiveName={tab.payload.name}
          initialObjects={tab.payload.objects}
          initialEvents={tab.payload.events}
          tourActive={tab.id === activeTabId}
        />
      );
    }

    if (tab.type === 'process' && tab.payload) {
      const processState = processByTab[tab.id] ?? createEmptyProcessState();
      return (
        <ProcessDetailView
          processId={tab.payload.processId}
          processLabel={tab.payload.label}
          seed={tab.payload.seed}
          selectionMode={processState.selectionMode}
          selectedObjects={processState.selectedObjects}
          selectedEvents={processState.selectedEvents}
          onEnterSelectionMode={() => patchProcessTab(tab.id, { selectionMode: true })}
          onCancelSelection={() => exitProcessSelection(tab.id)}
          onToggleObject={(id) => toggleObjectForProcessTab(tab.id, id)}
          onToggleEvent={(id) => toggleEventForProcessTab(tab.id, id)}
          onCreateFromEntire={() => handleCreateFromEntireProcess(tab.id)}
          onCreateFromSelection={() => handleCreateFromProcessSelection(tab.id)}
        />
      );
    }

    if (tab.type === 'object') {
      return <StudioAssetPlaceholder title={tab.label} />;
    }

    return null;
  };

  return (
    <div className={styles.app}>
      <StudioHeader />
      <div className={styles.bodyRow}>
        <StudioL0Nav onVersionChange={onVersionChange} />
        <div className={styles.shellBody}>
          <StudioL1Nav
            activeAssetKey={activeAssetKey}
            onOpenAsset={handleOpenAsset}
            onNewPerspective={openCreatePerspectiveTab}
          />
          <div className={styles.mainColumn}>
            <StudioTabBar
              tabs={workspaceTabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
              onAddTab={handleAddTab}
            />
            <div className={styles.tabContent}>
              {workspaceTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={styles.tabPane}
                  hidden={tab.id !== activeTabId}
                  aria-hidden={tab.id !== activeTabId}
                >
                  {renderTabPane(tab)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <DemoTourPopover />
    </div>
  );
}

export default function PerspectiveBuilderV4({ onVersionChange }) {
  const [workspaceTabs, setWorkspaceTabs] = useState([createBrowseTab()]);
  const [activeTabId, setActiveTabId] = useState(CONTEXT_BROWSE_TAB_ID);
  const [contextByTab, setContextByTab] = useState(() => ({
    [CONTEXT_BROWSE_TAB_ID]: createEmptyContextState(),
  }));
  const [processByTab, setProcessByTab] = useState({});

  const activeTab = workspaceTabs.find((tab) => tab.id === activeTabId);
  const contextState = contextByTab[CONTEXT_BROWSE_TAB_ID] ?? createEmptyContextState();

  const focusContextModel = useCallback(() => {
    setWorkspaceTabs((tabs) => {
      const browseTab = tabs.find((tab) => tab.id === CONTEXT_BROWSE_TAB_ID);
      if (browseTab) return tabs;
      return [createBrowseTab(), ...tabs];
    });
    setContextByTab((prev) => ({
      ...prev,
      [CONTEXT_BROWSE_TAB_ID]: prev[CONTEXT_BROWSE_TAB_ID] ?? createEmptyContextState(),
    }));
    setActiveTabId(CONTEXT_BROWSE_TAB_ID);
  }, []);

  return (
    <DemoTourProvider
      activeTab={activeTab}
      contextState={contextState}
      onFocusContextModel={focusContextModel}
    >
      <PerspectiveBuilderV4Shell
        onVersionChange={onVersionChange}
        workspaceTabs={workspaceTabs}
        setWorkspaceTabs={setWorkspaceTabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        contextByTab={contextByTab}
        setContextByTab={setContextByTab}
        processByTab={processByTab}
        setProcessByTab={setProcessByTab}
      />
    </DemoTourProvider>
  );
}
