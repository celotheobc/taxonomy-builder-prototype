import { useMemo, useState } from 'react';
import StudioHeader from '../v3/shell/StudioHeader';
import StudioTabBar from '../v3/shell/StudioTabBar';
import StudioL0Nav from './shell/StudioL0Nav';
import StudioL1Nav from './shell/StudioL1Nav';
import TaxonomyRefineView from './TaxonomyRefineView';
import TaxonomyAssetView from './TaxonomyAssetView';
import { ObjectTypeWorkspaceProvider, useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import {
  buildL1Sections,
  buildTreeByObjectId,
  createObjectTypeTab,
  createSubtypeObjectTab,
  createTaxonomyTab,
} from './shell/studioAssets';
import { getObjectType } from '../../data/mockObjectTypes';
import styles from '../v3/PerspectiveBuilderV3.module.css';

function TaxonomyBuilderShell({ onHome, initialObjectTypeId = 'jira-issue' }) {
  const { generatedTaxonomies, getSplitState, getAllSubtypeEntries } = useObjectTypeWorkspace();
  const initialObjectType = getObjectType(initialObjectTypeId) ?? getObjectType('jira-issue');
  const [workspaceTabs, setWorkspaceTabs] = useState([
    createObjectTypeTab(initialObjectType.id, initialObjectType.name),
  ]);
  const [activeTabId, setActiveTabId] = useState(`tab-object-${initialObjectType.id}`);

  const treeByObjectId = useMemo(
    () => buildTreeByObjectId(getSplitState),
    [generatedTaxonomies, getSplitState],
  );

  const l1Sections = useMemo(
    () => buildL1Sections(generatedTaxonomies, treeByObjectId),
    [generatedTaxonomies, treeByObjectId],
  );

  const activeAssetKey = useMemo(() => {
    const tab = workspaceTabs.find((item) => item.id === activeTabId);
    return tab?.assetKey ?? `object-type:${initialObjectType.id}`;
  }, [workspaceTabs, activeTabId, initialObjectType.id]);

  const openObjectTypeTab = (objectTypeId) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType) return;

    const tabId = `tab-object-${objectTypeId}`;
    const existing = workspaceTabs.find((tab) => tab.id === tabId);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const tab = createObjectTypeTab(objectTypeId, objectType.name);
    setWorkspaceTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const openSubtypeObjectTab = (parentObjectTypeId, subtypeId) => {
    const entry = getAllSubtypeEntries(getSplitState(parentObjectTypeId)).find(
      (item) => item.subtype.id === subtypeId,
    );
    if (!entry) return;

    const tabId = `tab-subtype-${parentObjectTypeId}-${subtypeId}`;
    const existing = workspaceTabs.find((tab) => tab.id === tabId);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const tab = createSubtypeObjectTab(parentObjectTypeId, entry.subtype);
    setWorkspaceTabs((prev) => {
      const activeIndex = prev.findIndex((item) => item.id === activeTabId);
      if (activeIndex === -1) return [...prev, tab];
      const next = [...prev];
      next.splice(activeIndex + 1, 0, tab);
      return next;
    });
    setActiveTabId(tab.id);
  };

  const openTaxonomyTab = (taxonomyId) => {
    const taxonomy = generatedTaxonomies.find((item) => item.id === taxonomyId);
    if (!taxonomy) return;

    const tabId = `tab-taxonomy-${taxonomyId}`;
    const existing = workspaceTabs.find((tab) => tab.id === tabId);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const tab = createTaxonomyTab(taxonomy);
    setWorkspaceTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const handleOpenAsset = (asset) => {
    if (asset.assetType === 'object-type') {
      openObjectTypeTab(asset.id);
      return;
    }
    if (asset.assetType === 'subtype-object') {
      openSubtypeObjectTab(asset.parentObjectTypeId, asset.id);
      return;
    }
    if (asset.assetType === 'taxonomy') {
      openTaxonomyTab(asset.id);
    }
  };

  const handleCloseTab = (tabId) => {
    setWorkspaceTabs((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((tab) => tab.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(next[next.length - 1].id);
      }
      return next;
    });
  };

  return (
    <div className={styles.app}>
      <StudioHeader />
      <div className={styles.bodyRow}>
        <StudioL0Nav onHome={onHome} />
        <div className={styles.shellBody}>
          <StudioL1Nav
            sections={l1Sections}
            activeAssetKey={activeAssetKey}
            onOpenAsset={handleOpenAsset}
          />
          <div className={styles.mainColumn}>
            <StudioTabBar
              tabs={workspaceTabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
              onAddTab={() => openObjectTypeTab(initialObjectType.id)}
            />
            <div className={styles.tabContent}>
              {workspaceTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={styles.tabPane}
                  hidden={tab.id !== activeTabId}
                  aria-hidden={tab.id !== activeTabId}
                >
                  {tab.type === 'object-type' ? (
                    <TaxonomyRefineView
                      objectTypeId={tab.objectTypeId}
                      onOpenTaxonomy={openTaxonomyTab}
                      onOpenObjectType={openSubtypeObjectTab}
                    />
                  ) : null}
                  {tab.type === 'subtype-object' ? (
                    <TaxonomyRefineView
                      objectTypeId={tab.parentObjectTypeId}
                      subtypeId={tab.subtypeId}
                      onOpenTaxonomy={openTaxonomyTab}
                      onOpenObjectType={openSubtypeObjectTab}
                      onNavigateToParent={() => openObjectTypeTab(tab.parentObjectTypeId)}
                    />
                  ) : null}
                  {tab.type === 'taxonomy' ? (
                    <TaxonomyAssetView
                      taxonomyId={tab.taxonomyId}
                      onOpenObjectType={openObjectTypeTab}
                      onOpenSubtype={openSubtypeObjectTab}
                      onOpenTaxonomy={openTaxonomyTab}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaxonomyBuilderApp({ onHome, initialObjectTypeId = 'jira-issue' }) {
  return (
    <ObjectTypeWorkspaceProvider>
      <TaxonomyBuilderShell onHome={onHome} initialObjectTypeId={initialObjectTypeId} />
    </ObjectTypeWorkspaceProvider>
  );
}
