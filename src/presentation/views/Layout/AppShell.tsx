import { useState, useRef, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import styles from './AppShell.module.css';

const LONG_PRESS_DURATION_MS = 3000;
const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

interface AppShellProps {
  children: ReactNode;
  showSettingsGear?: boolean;
}

export function AppShell({ children, showSettingsGear = true }: AppShellProps) {
  const navigate = useNavigate();
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = useCallback(() => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      setIsPressing(false);
      navigate('/board-editor');
    }, LONG_PRESS_DURATION_MS);
  }, [navigate]);

  const handlePressEnd = useCallback(() => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <div className={styles.shell}>
      {showSettingsGear && (
        <button
          className={styles.settingsGear}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchCancel={handlePressEnd}
          aria-label="Mantener presionado 3 segundos para configuración"
          title="Mantener presionado para configurar"
        >
          <svg className={styles.progressRing} viewBox="0 0 48 48" aria-hidden="true">
            <circle
              className={styles.progressTrack}
              cx="24"
              cy="24"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="3"
            />
            <circle
              className={`${styles.progressArc} ${isPressing ? styles.filling : ''}`}
              cx="24"
              cy="24"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="3"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={isPressing ? 0 : CIRCLE_CIRCUMFERENCE}
              strokeLinecap="round"
              style={{ transitionDuration: isPressing ? `${LONG_PRESS_DURATION_MS}ms` : '0ms' }}
            />
          </svg>
          <span className={styles.gearIcon} aria-hidden="true">
            {'\u2699'}
          </span>
        </button>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
