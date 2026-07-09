import { useMemo, useState } from 'react';
import { EXPERIENCES } from '../../data/mockData';
import { buildRelationshipTableView } from '../../utils/perspectiveRelationships';
import {
  buildPerspectiveEventSourceRows,
  buildPerspectiveObjectRows,
} from '../../utils/perspectiveEntities';
import AgentContextModule from '../../components/asset/AgentContextModule';
import EventSourcesModule from '../../components/asset/EventSourcesModule';
import ObjectsModule from '../../components/asset/ObjectsModule';
import RelationshipsModule from '../../components/asset/RelationshipsModule';
import ConfigurationModule from '../../components/configuration/ConfigurationModule';
import AssetHeader from '../../components/layout/AssetHeader';
import ContextSidebar from '../../components/layout/ContextSidebar';
import ExperienceSwitcher from '../../components/layout/ExperienceSwitcher';
import LeftNav from '../../components/layout/LeftNav';
import MetadataRail from '../../components/layout/MetadataRail';
import Toast from '../../components/ui/Toast';
import { useProgressiveBuilder } from '../../hooks/useProgressiveBuilder';
import { useRouteAmbiguity } from '../../hooks/useRouteAmbiguity';
import styles from './PerspectiveBuilderV1.module.css';

export default function PerspectiveBuilderV1({ onVersionChange }) {
  const [experience, setExperience] = useState(EXPERIENCES.PROGRESSIVE);
  const [highlightedRelationshipId, setHighlightedRelationshipId] = useState(null);
  const progressiveGlobal = useProgressiveBuilder('global');
  const progressiveContextual = useProgressiveBuilder('contextual');
  const routeAmbiguity = useRouteAmbiguity();

  const progressive =
    experience === EXPERIENCES.PROGRESSIVE_CONTEXTUAL
      ? progressiveContextual
      : progressiveGlobal;

  const toast =
    progressive.toast || progressiveGlobal.toast || progressiveContextual.toast || routeAmbiguity.toast;

  const relationshipTable = useMemo(() => {
    const state =
      experience === EXPERIENCES.ROUTE_AMBIGUITY ? routeAmbiguity : progressive;
    const ambiguity = {
      active:
        experience !== EXPERIENCES.ROUTE_AMBIGUITY ? progressive.cycleActive : true,
      resolved: state.isCycleResolved ?? state.isRouteResolved,
      edgeIds: state.cycleEdgeIds ?? state.conflictingEdges,
    };
    return buildRelationshipTableView(
      state.activeRelationships,
      state.includedObjects,
      ambiguity,
    );
  }, [experience, progressive, routeAmbiguity]);

  const perspectiveEntities = useMemo(() => {
    const state =
      experience === EXPERIENCES.ROUTE_AMBIGUITY ? routeAmbiguity : progressive;
    return {
      objects: buildPerspectiveObjectRows(state.includedObjects),
      eventSources: buildPerspectiveEventSourceRows(state.includedEvents ?? new Set()),
    };
  }, [experience, progressive, routeAmbiguity]);

  const isProgressiveExperience =
    experience === EXPERIENCES.PROGRESSIVE ||
    experience === EXPERIENCES.PROGRESSIVE_CONTEXTUAL;

  return (
    <div className={styles.app}>
      <LeftNav prototypeVersion="v1" onVersionChange={onVersionChange} />
      <div className={styles.mainColumn}>
        <ExperienceSwitcher experience={experience} onChange={setExperience} />
        <div className={styles.workspace}>
          <ContextSidebar />
          <div className={styles.page}>
            <AssetHeader />
            <div className={styles.content}>
              <ConfigurationModule
                experience={experience}
                progressive={progressive}
                routeAmbiguity={routeAmbiguity}
                highlightedRelationshipId={highlightedRelationshipId}
              />
              <RelationshipsModule
                rows={relationshipTable.rows}
                alert={relationshipTable.alert}
                highlightedRelationshipId={highlightedRelationshipId}
                onHighlightRelationship={setHighlightedRelationshipId}
                showAdd={isProgressiveExperience}
                onAddRelationship={progressive.addRelationship}
              />
              <ObjectsModule
                rows={perspectiveEntities.objects}
                showAdd={isProgressiveExperience}
                onAddObject={progressive.addObject}
              />
              <EventSourcesModule
                rows={perspectiveEntities.eventSources}
                showAdd={isProgressiveExperience}
                onAddEvent={progressive.addEvent}
              />
              <AgentContextModule />
            </div>
          </div>
          <MetadataRail />
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
