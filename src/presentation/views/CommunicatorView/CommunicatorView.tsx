import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useServices } from '@presentation/providers/ServiceProvider';
import { useCommunicatorViewModel } from '@presentation/view-models/useCommunicatorViewModel';
import { ScanPath } from '@presentation/components/shared/ScanPath/ScanPath';
import styles from './CommunicatorView.module.css';

import { Settings } from 'lucide-react';

export function CommunicatorView() {
  const navigate = useNavigate();
  const { scanningAppService, boardEditorService } = useServices();
  const vm = useCommunicatorViewModel(scanningAppService, boardEditorService);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!vm.isReady) return;

      switch (e.key) {
        case 'Tab':
        case 'ArrowLeft':
          e.preventDefault();
          vm.handleScanNext();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (vm.lastUtterance) {
            vm.dismissUtterance();
          } else {
            vm.handleSelect();
          }
          break;
        case 'Escape':
          e.preventDefault();
          vm.handleGoBack();
          break;
      }
    },
    [vm],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!vm.isReady) {
    return (
      <main className={styles.communicatorView}>
        <div className={styles.loading} role="status">
          Cargando...
        </div>
      </main>
    );
  }

  if (vm.isEmpty) {
    return (
      <main className={styles.communicatorView}>
        <div className={styles.emptyBoard}>
          <p className={styles.emptyText}>El tablero está vacío.</p>
          <p className={styles.emptySubtext}>Configura el tablero para comenzar.</p>
          <button className={styles.configureButton} onClick={() => navigate('/board-editor')}>
            <Settings size={24} />
            Ir a configuración
          </button>
        </div>
      </main>
    );
  }

  if (vm.lastUtterance) {
    return (
      <main className={styles.communicatorView}>
        {/* Hidden live region announces utterance to screen readers */}
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {vm.lastUtterance}
        </div>
        <button
          className={`${styles.fullScreenButton} ${styles.acceptButton}`}
          onClick={vm.dismissUtterance}
          aria-label={`Aceptar: ${vm.lastUtterance}`}
          autoFocus
        >
          <span className={styles.utteranceText}>{vm.lastUtterance}</span>
          <span className={styles.buttonHint}>Aceptar ✓</span>
        </button>
      </main>
    );
  }

  return (
    <main className={styles.communicatorView}>
      {/* Breadcrumb path at top */}
      <ScanPath pathLabels={vm.pathLabels} />

      {/* Hidden live region announces current item during scanning */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {vm.currentLabel}
      </div>

      <div className={styles.buttonGrid}>
        {/* Top: Select button — shows current item and confirms selection */}
        <button
          className={`${styles.gridButton} ${styles.selectButton}`}
          onClick={vm.handleSelect}
          aria-label={`Seleccionar: ${vm.currentLabel}`}
        >
          <span className={styles.itemIcon} aria-hidden="true">
            {vm.currentIcon}
          </span>
          <span className={styles.itemLabel}>{vm.currentLabel}</span>
          <span className={styles.buttonHint} aria-hidden="true">
            Seleccionar ✓
          </span>
        </button>

        {/* Bottom row: Siguiente (left) + Volver (right) */}
        <div className={styles.bottomRow}>
          <button
            className={`${styles.gridButton} ${styles.nextButton}`}
            onClick={vm.handleScanNext}
            aria-label="Siguiente"
          >
            <span className={styles.buttonIcon} aria-hidden="true">▶</span>
            <span className={styles.buttonLabel}>Siguiente</span>
          </button>
          <button
            className={`${styles.gridButton} ${styles.backButton}`}
            onClick={vm.handleGoBack}
            disabled={vm.isAtRoot}
            aria-label="Volver"
          >
            <span className={styles.buttonIcon} aria-hidden="true">◀</span>
            <span className={styles.buttonLabel}>Volver</span>
          </button>
        </div>
      </div>
    </main>
  );
}
