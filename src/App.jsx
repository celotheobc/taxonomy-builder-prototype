import { useCallback, useMemo, useState } from 'react';
import ToastyEasterEgg from './components/easterEgg/ToastyEasterEgg';
import { useKonamiCode } from './components/easterEgg/useKonamiCode';
import PrototypeCover from './pages/cover/PrototypeCover';
import TaxonomyBuilderAppV1 from './pages/taxonomy-v1/TaxonomyBuilderApp';
import TaxonomyBuilderAppV2 from './pages/taxonomy-v2/TaxonomyBuilderApp';
import TaxonomyBuilderAppV3 from './pages/taxonomy-v3/TaxonomyBuilderApp';
import TaxonomyBuilderAppV4 from './pages/taxonomy-v4/TaxonomyBuilderApp';
import TaxonomyBuilderAppV5 from './pages/taxonomy-v5/TaxonomyBuilderApp';

export default function App() {
  const [showApp, setShowApp] = useState(() => {
    const saved = sessionStorage.getItem('tb-prototype-started');
    return saved === 'true';
  });
  const [prototypeVersion, setPrototypeVersion] = useState(
    () => sessionStorage.getItem('tb-prototype-version') ?? 'v4',
  );
  const [initialObjectTypeId, setInitialObjectTypeId] = useState('facility');
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
          onOpen={(version) => {
            setPrototypeVersion(version.id);
            setInitialObjectTypeId(version.objectTypeId);
            sessionStorage.setItem('tb-prototype-started', 'true');
            sessionStorage.setItem('tb-prototype-version', version.id);
            setShowApp(true);
          }}
        />
      );
    }

    const BuilderApp =
      prototypeVersion === 'v1'
        ? TaxonomyBuilderAppV1
        : prototypeVersion === 'v2'
          ? TaxonomyBuilderAppV2
          : prototypeVersion === 'v3'
            ? TaxonomyBuilderAppV3
            : prototypeVersion === 'v5'
              ? TaxonomyBuilderAppV5
              : TaxonomyBuilderAppV4;

    return (
      <BuilderApp
        key={`${prototypeVersion}-${initialObjectTypeId}`}
        initialObjectTypeId={initialObjectTypeId}
        onHome={() => setShowApp(false)}
      />
    );
  }, [showApp, prototypeVersion, initialObjectTypeId]);

  return (
    <>
      {page}
      <ToastyEasterEgg active={toastyActive} onDone={dismissToasty} />
    </>
  );
}
