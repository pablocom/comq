import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useServices } from '@presentation/providers/ServiceProvider';
import { useCommunicatorViewModel } from '@presentation/view-models/useCommunicatorViewModel';
import { ScanButton } from '@presentation/components/shared/ScanButton/ScanButton';
import { CurrentMessageDisplay } from '@presentation/components/shared/CurrentMessageDisplay/CurrentMessageDisplay';
import { ScanPath } from '@presentation/components/shared/ScanPath/ScanPath';
import styles from './CommunicatorView.module.css';

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
            Ir a configuración
          </button>
        </div>
      </main>
    );
  }

  if (vm.lastUtterance) {
    return (
      <main className={styles.communicatorView}>
        <div className={styles.utteranceOverlay}>
          <div className={styles.utteranceContent} role="alert" aria-live="assertive">
            <p className={styles.utteranceLabel}>{vm.lastUtterance}</p>
          </div>
          <div className={styles.buttonColumn}>
            <ScanButton
              variant="select"
              label="Aceptar"
              onClick={vm.dismissUtterance}
              autoFocus
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.communicatorView}>
      <div className={styles.displayArea}>
        <ScanPath pathLabels={vm.pathLabels} />
        <CurrentMessageDisplay label={vm.currentLabel} icon={vm.currentIcon} />
      </div>
      <div className={styles.buttonColumn}>
        <ScanButton variant="scan" label="Siguiente" onClick={vm.handleScanNext} />
        <ScanButton variant="select" label="Seleccionar" onClick={vm.handleSelect} />
        <ScanButton
          variant="back"
          label="Volver"
          onClick={vm.handleGoBack}
          disabled={vm.isAtRoot}
        />
      </div>
    </main>
  );
}
