import { useState, useRef, useCallback } from 'react';
import styles from './HoldToConfirmButton.module.css';

interface HoldToConfirmButtonProps {
  label: string;
  holdDurationMs: number;
  onConfirm: () => void;
  className?: string;
  ariaLabel?: string;
}

export function HoldToConfirmButton({
  label,
  holdDurationMs,
  onConfirm,
  className,
  ariaLabel,
}: HoldToConfirmButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = useCallback(() => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      setIsPressing(false);
      onConfirm();
    }, holdDurationMs);
  }, [onConfirm, holdDurationMs]);

  const handlePressEnd = useCallback(() => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <button
      className={`${styles.holdButton} ${className ?? ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={ariaLabel ?? `Mantener presionado para ${label.toLowerCase()}`}
      title={`Mantener presionado para ${label.toLowerCase()}`}
    >
      <span
        className={`${styles.fill} ${isPressing ? styles.filling : ''}`}
        style={{ transitionDuration: isPressing ? `${holdDurationMs}ms` : '0ms' }}
        aria-hidden="true"
      />
      <span className={styles.label}>{label}</span>
    </button>
  );
}
