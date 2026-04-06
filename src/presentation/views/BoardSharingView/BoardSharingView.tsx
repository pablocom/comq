import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { useServices } from '@presentation/providers/ServiceProvider';
import { useBoardSharingViewModel } from '@presentation/view-models/useBoardSharingViewModel';
import { Settings, Home } from 'lucide-react';
import styles from './BoardSharingView.module.css';

export function BoardSharingView() {
  const navigate = useNavigate();
  const { boardSharingService, boardEditorService } = useServices();
  const vm = useBoardSharingViewModel(boardSharingService, boardEditorService);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.sharing}>
      <header className={styles.header}>
        <h1 className={styles.title}>Compartir Tableros</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.navIconButton}
            onClick={() => navigate('/board-editor')}
            aria-label="Editor"
            title="Editor"
          >
            <Settings size={20} />
          </button>
          <button
            className={styles.navIconButton}
            onClick={() => navigate('/')}
            aria-label="Volver al inicio"
            title="Volver al inicio"
          >
            <Home size={20} />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Exportar</h2>
          <p className={styles.description}>
            Exporta todos los tableros ({vm.boardCount}) como archivo JSON para compartirlos o
            hacer una copia de respaldo.
          </p>
          <div className={styles.actionRow}>
            <button className={styles.primaryButton} onClick={vm.handleDownload}>
              Descargar archivo .comq.json
            </button>
            <button className={styles.secondaryButton} onClick={vm.handleExport}>
              Ver JSON
            </button>
          </div>

          {vm.exportJson && (
            <div className={styles.jsonPreview}>
              <div className={styles.jsonActions}>
                <button className={styles.secondaryButton} onClick={vm.handleCopyToClipboard}>
                  {vm.copySuccess ? '¡Copiado!' : 'Copiar al portapapeles'}
                </button>
              </div>
              <pre className={styles.jsonCode}>{vm.exportJson}</pre>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Importar</h2>
          <p className={styles.description}>
            Importa tableros desde un archivo .comq.json o pegando el JSON directamente. Los
            tableros importados se agregarán a los existentes.
          </p>

          <div className={styles.actionRow}>
            <button
              className={styles.secondaryButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.comq.json"
              className={styles.hiddenInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) vm.handleFileImport(file);
              }}
              aria-label="Seleccionar archivo de tableros"
            />
          </div>

          <textarea
            className={styles.importTextarea}
            value={vm.importJson}
            onChange={(e) => vm.handleImportJsonChange(e.target.value)}
            placeholder="O pega el JSON aquí..."
            rows={8}
            aria-label="JSON de los tableros a importar"
          />

          {vm.importJson && !vm.importPreview && vm.importErrors.length === 0 && (
            <button className={styles.primaryButton} onClick={vm.handleValidateImport}>
              Validar
            </button>
          )}

          {vm.importErrors.length > 0 && (
            <div className={styles.errorBox} role="alert">
              <h3 className={styles.errorTitle}>Errores de validación:</h3>
              <ul className={styles.errorList}>
                {vm.importErrors.map((err, i) => (
                  <li key={i}>
                    <strong>{err.path}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vm.importPreview && (
            <div className={styles.previewBox}>
              <h3 className={styles.previewTitle}>Vista previa:</h3>
              <p>
                <strong>Tableros a importar:</strong> {vm.importPreview.boards.length}
              </p>
              <ul className={styles.previewList}>
                {vm.importPreview.boards.map((board) => (
                  <li key={board.id}>
                    {board.name} — {board.rootNodeCount()} categorías,{' '}
                    modificado{' '}
                    {new Date(board.updatedAt).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </li>
                ))}
              </ul>
              <button className={styles.importButton} onClick={vm.handleConfirmImport}>
                Confirmar importación
              </button>
            </div>
          )}

          {vm.importSuccess && (
            <div className={styles.successBox} role="status">
              ¡Tableros importados correctamente! Puedes gestionarlos desde el editor.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
