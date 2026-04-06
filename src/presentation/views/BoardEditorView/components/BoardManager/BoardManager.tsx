import { useState } from 'react';
import type { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { HoldToConfirmButton } from '@presentation/components/shared/HoldToConfirmButton/HoldToConfirmButton';
import styles from './BoardManager.module.css';

interface BoardManagerProps {
  boards: CommunicationBoard[];
  activeBoardId: string | null;
  onSwitchActive: (boardId: string) => void;
  onCreate: (name: string) => void;
  onRename: (boardId: string, name: string) => void;
  onDelete: (boardId: string) => void;
}

export function BoardManager({
  boards,
  activeBoardId,
  onSwitchActive,
  onCreate,
  onRename,
  onDelete,
}: BoardManagerProps) {
  const [newBoardName, setNewBoardName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreate = () => {
    const name = newBoardName.trim();
    if (!name) return;
    onCreate(name);
    setNewBoardName('');
  };

  const handleRenameStart = (board: CommunicationBoard) => {
    setRenamingId(board.id);
    setRenameValue(board.name);
  };

  const handleRenameConfirm = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const sortedBoards = [...boards].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <section className={styles.manager}>
      <h2 className={styles.heading}>Tableros guardados</h2>

      <div className={styles.createRow}>
        <input
          type="text"
          className={styles.input}
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Nombre del nuevo tablero..."
          aria-label="Nombre del nuevo tablero"
        />
        <button className={styles.createButton} onClick={handleCreate} disabled={!newBoardName.trim()}>
          Crear
        </button>
      </div>

      <ul className={styles.boardList}>
        {sortedBoards.map((board) => (
          <li
            key={board.id}
            className={`${styles.boardItem} ${board.id === activeBoardId ? styles.active : ''}`}
          >
            {renamingId === board.id ? (
              <div className={styles.renameRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameConfirm();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  autoFocus
                  aria-label="Nuevo nombre del tablero"
                />
                <button className={styles.actionButton} onClick={handleRenameConfirm}>
                  Guardar
                </button>
                <button className={styles.actionButton} onClick={() => setRenamingId(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <div className={styles.boardInfo}>
                  <span className={styles.boardName}>
                    {board.name}
                    {board.id === activeBoardId && (
                      <span className={styles.activeBadge}> (activo)</span>
                    )}
                  </span>
                  <span className={styles.boardDate}>
                    Modificado: {new Date(board.updatedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className={styles.actions}>
                  {board.id !== activeBoardId && (
                    <button
                      className={styles.actionButton}
                      onClick={() => onSwitchActive(board.id)}
                    >
                      Activar
                    </button>
                  )}
                  <button className={styles.actionButton} onClick={() => handleRenameStart(board)}>
                    Renombrar
                  </button>
                  {board.id !== activeBoardId && (
                    <HoldToConfirmButton
                      label="Borrar"
                      holdDurationMs={2000}
                      onConfirm={() => onDelete(board.id)}
                      className={styles.deleteButton}
                    />
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

