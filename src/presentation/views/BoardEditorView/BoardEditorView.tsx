import { useNavigate } from 'react-router';
import { useServices } from '@presentation/providers/ServiceProvider';
import { useBoardEditorViewModel } from '@presentation/view-models/useBoardEditorViewModel';
import { BoardManager } from './components/BoardManager/BoardManager';
import { BoardTree } from './components/BoardTree/BoardTree';
import styles from './BoardEditorView.module.css';

import { Home, Share2 } from 'lucide-react';

export function BoardEditorView() {
  const navigate = useNavigate();
  const { boardEditorService } = useServices();
  const vm = useBoardEditorViewModel(boardEditorService);

  return (
    <div className={styles.editor}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.navIconButton}
            onClick={() => navigate('/board-sharing')}
            aria-label="Compartir"
            title="Compartir"
          >
            <Share2 size={20} />
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
        <BoardManager
          boards={vm.boards}
          activeBoardId={vm.activeBoardId}
          onSwitchActive={vm.switchActiveBoard}
          onCreate={vm.createBoard}
          onRename={vm.renameBoard}
          onDelete={vm.deleteBoard}
        />

        {vm.activeBoard && (
          <section className={styles.treeSection}>
            <div className={styles.treeSectionHeader}>
              <h2 className={styles.sectionHeading}>
                Contenido de &ldquo;{vm.activeBoard.name}&rdquo;
              </h2>
              <button
                className={styles.addRootButton}
                onClick={() => vm.addNode(null)}
              >
                + Agregar al nivel principal
              </button>
            </div>

            {vm.activeBoard.rootNodeCount() === 0 ? (
              <p className={styles.emptyMessage}>
                Este tablero está vacío. Agrega categorías y mensajes para que el comunicador pueda
                usarlo.
              </p>
            ) : (
              <BoardTree
                nodes={vm.activeBoard.rootNodes}
                editingNodeId={vm.editingNodeId}
                onAddChild={vm.addNode}
                onRemove={vm.removeNode}
                onStartEdit={vm.startEditingNode}
                onConfirmEdit={vm.updateNodeLabel}
                onCancelEdit={vm.cancelEditingNode}
                onMoveNode={vm.moveNode}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}
