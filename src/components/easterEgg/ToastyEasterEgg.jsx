import { useEffect, useRef } from 'react';
import toastyGuy from '../../assets/toasty-guy.png';
import toastySound from '../../assets/toasty.mp3';
import styles from './ToastyEasterEgg.module.css';

const DISPLAY_MS = 1200;

export default function ToastyEasterEgg({ active, onDone }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const audio = new Audio(toastySound);
    audioRef.current = audio;
    audio.volume = 0.85;
    audio.play().catch(() => {});

    const timer = window.setTimeout(() => {
      onDone?.();
    }, DISPLAY_MS);

    return () => {
      window.clearTimeout(timer);
      audio.pause();
      audioRef.current = null;
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className={styles.wrap} aria-hidden>
      <img src={toastyGuy} alt="" className={styles.guy} />
    </div>
  );
}
