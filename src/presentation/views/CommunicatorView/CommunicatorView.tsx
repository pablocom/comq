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

  const isUtteranceState = !!vm.lastUtterance;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!vm.isReady) return;

      switch (e.key) {
        case 'Tab':
        case 'ArrowLeft':
          e.preventDefault();
          if (!vm.lastUtterance) vm.handleScanNext();
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
          if (vm.lastUtterance) {
            vm.dismissUtterance();
          } else {
            vm.handleGoBack();
          }
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

  return (
    <main className={styles.communicatorView}>
      <ScanPath pathLabels={vm.pathLabels} />

      {/* Screen-reader live region */}
      <div
        role={isUtteranceState ? 'alert' : undefined}
        aria-live="assertive"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {isUtteranceState ? vm.lastUtterance : vm.currentLabel}
      </div>

      <div className={styles.buttonGrid}>
        {/*
         * Top: Select button
         * – Normal state:  shows current item, click = select
         * – Utterance state: shows result text (big), not interactive
         */}
        <button
          className={`${styles.gridButton} ${styles.selectButton} ${isUtteranceState ? styles.utteranceDisplay : ''}`}
          onClick={isUtteranceState ? undefined : vm.handleSelect}
          aria-disabled={isUtteranceState}
          aria-label={isUtteranceState ? vm.lastUtterance! : `Seleccionar: ${vm.currentLabel}`}
          tabIndex={isUtteranceState ? -1 : 0}
        >
          {isUtteranceState ? (
            <span className={styles.utteranceText}>{vm.lastUtterance}</span>
          ) : (
            <>
              <span className={styles.itemIcon} aria-hidden="true">
                {vm.currentIcon}
              </span>
              <span className={styles.itemLabel}>{vm.currentLabel}</span>
              <span className={styles.buttonHint} aria-hidden="true">
                Seleccionar ✓
              </span>
            </>
          )}
        </button>

        {/* Bottom row */}
        <div className={styles.bottomRow}>
          {/* Siguiente — disabled while utterance is showing */}
          <button
            className={`${styles.gridButton} ${styles.nextButton}`}
            onClick={vm.handleScanNext}
            disabled={isUtteranceState}
            aria-label="Siguiente"
          >
            <span className={styles.buttonIcon} aria-hidden="true">▶</span>
            <span className={styles.buttonLabel}>Siguiente</span>
          </button>

          {/* Volver — always available; dismisses utterance or goes back */}
          <button
            className={`${styles.gridButton} ${styles.backButton}`}
            onClick={isUtteranceState ? vm.dismissUtterance : vm.handleGoBack}
            disabled={!isUtteranceState && vm.isAtRoot}
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
