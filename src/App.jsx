import { useCallback, useMemo, useState } from 'react';
import ToastyEasterEgg from './components/easterEgg/ToastyEasterEgg';
import { useKonamiCode } from './components/easterEgg/useKonamiCode';
import PrototypeCover from './pages/cover/PrototypeCover';
import TaxonomyBuilderApp from './pages/taxonomy/TaxonomyBuilderApp';

export default function App() {
  const [showApp, setShowApp] = useState(() => {
    const saved = sessionStorage.getItem('tb-prototype-started');
    return saved === 'true';
  });
  const [initialObjectTypeId, setInitialObjectTypeId] = useState('jira-issue');
  const [toastyActive, setToastyActive] = useState(false);

  const triggerToasty = useCallback(() => {
    setToastyActive(true);
  }, []);

  const dismissToasty = useCallback(() => {
    setToastyActive(false);
  }, []);

  useKonamiCode(triggerToasty);

  const page = useMemo(() => {
    if (!showApp) {
      return (
        <PrototypeCover
          onOpen={(objectTypeId) => {
            setInitialObjectTypeId(objectTypeId);
            sessionStorage.setItem('tb-prototype-started', 'true');
            setShowApp(true);
          }}
        />
      );
    }

    return <TaxonomyBuilderApp key={initialObjectTypeId} initialObjectTypeId={initialObjectTypeId} onHome={() => setShowApp(false)} />;
  }, [showApp, initialObjectTypeId]);

  return (
    <>
      {page}
      <ToastyEasterEgg active={toastyActive} onDone={dismissToasty} />
    </>
  );
}
