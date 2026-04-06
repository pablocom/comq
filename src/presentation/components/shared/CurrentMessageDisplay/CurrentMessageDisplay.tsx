import styles from './CurrentMessageDisplay.module.css';

interface CurrentMessageDisplayProps {
  label: string;
  icon: string;
}

export function CurrentMessageDisplay({ label, icon }: CurrentMessageDisplayProps) {
  return (
    <div
      className={styles.display}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className={styles.typeIndicator} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
