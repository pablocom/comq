import styles from './ScanPath.module.css';

interface ScanPathProps {
  pathLabels: string[];
}

export function ScanPath({ pathLabels }: ScanPathProps) {
  if (pathLabels.length === 0) {
    return (
      <nav className={styles.scanPath} aria-label="Ubicación actual">
        <span className={styles.segment}>Inicio</span>
      </nav>
    );
  }

  return (
    <nav className={styles.scanPath} aria-label="Ubicación actual">
      <span className={styles.segment}>Inicio</span>
      {pathLabels.map((label, index) => (
        <span key={index}>
          <span className={styles.separator} aria-hidden="true">
            {' \u203A '}
          </span>
          <span className={styles.segment}>{label}</span>
        </span>
      ))}
    </nav>
  );
}
