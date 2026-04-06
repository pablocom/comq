import { type ButtonHTMLAttributes } from 'react';
import styles from './ScanButton.module.css';

type ScanButtonVariant = 'scan' | 'select' | 'back';

interface ScanButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ScanButtonVariant;
  label: string;
}

export function ScanButton({ variant, label, ...props }: ScanButtonProps) {
  return (
    <button
      className={`${styles.scanButton} ${styles[variant]}`}
      aria-label={label}
      {...props}
    >
      <span className={styles.icon} aria-hidden="true">
        {variantIcon(variant)}
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}

function variantIcon(variant: ScanButtonVariant): string {
  switch (variant) {
    case 'scan':
      return '\u25B6';
    case 'select':
      return '\u2714';
    case 'back':
      return '\u25C0';
  }
}
