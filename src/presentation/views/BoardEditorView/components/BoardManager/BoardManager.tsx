import { useState } from 'react';
import { Play, Pencil } from 'lucide-react';
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
                <button className={styles.saveButton} onClick={handleRenameConfirm}>
                  Guardar
                </button>
                <button className={styles.cancelButton} onClick={() => setRenamingId(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <div className={styles.boardInfo}>
                  <span className={styles.boardName}>
                    {board.name}
                    {board.id === activeBoardId && (
                      <span className={styles.activeBadge}>activo</span>
                    )}
                  </span>
                  <span className={styles.boardDate}>
                    {new Date(board.updatedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className={styles.actions}>
                  {board.id !== activeBoardId && (
                    <button
                      className={styles.iconActionButton}
                      onClick={() => onSwitchActive(board.id)}
                      aria-label={`Activar tablero ${board.name}`}
                      title="Activar"
                    >
                      <Play size={13} />
                    </button>
                  )}
                  <button
                    className={styles.iconActionButton}
                    onClick={() => handleRenameStart(board)}
                    aria-label={`Renombrar tablero ${board.name}`}
                    title="Renombrar"
                  >
                    <Pencil size={13} />
                  </button>
                  {board.id !== activeBoardId && (
                    <HoldToConfirmButton
                      label="✕"
                      holdDurationMs={2000}
                      onConfirm={() => onDelete(board.id)}
                      className={styles.deleteButton}
                      ariaLabel={`Mantener presionado para borrar ${board.name}`}
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
