import { useState } from 'react';
import styles from './NodeForm.module.css';

interface NodeFormProps {
  parentLabel: string | null;
  onConfirm: (label: string) => void;
  onCancel: () => void;
}

export function NodeForm({ parentLabel, onConfirm, onCancel }: NodeFormProps) {
  const [label, setLabel] = useState('');

  const handleSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setLabel('');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.form} role="dialog" aria-label="Agregar nodo">
        <h3 className={styles.heading}>
          {parentLabel
            ? `Agregar dentro de "${parentLabel}"`
            : 'Agregar al nivel principal'}
        </h3>
        <input
          type="text"
          className={styles.input}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="Etiqueta del nodo (ej: Tengo hambre)"
          autoFocus
          aria-label="Etiqueta del nuevo nodo"
        />
        <div className={styles.actions}>
          <button className={styles.confirmButton} onClick={handleSubmit} disabled={!label.trim()}>
            Agregar
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
