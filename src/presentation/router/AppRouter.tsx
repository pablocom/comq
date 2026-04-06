import { Routes, Route } from 'react-router';
import { AppShell } from '@presentation/views/Layout/AppShell';
import { CommunicatorView } from '@presentation/views/CommunicatorView/CommunicatorView';
import { BoardEditorView } from '@presentation/views/BoardEditorView/BoardEditorView';
import { BoardSharingView } from '@presentation/views/BoardSharingView/BoardSharingView';

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell>
            <CommunicatorView />
          </AppShell>
        }
      />
      <Route
        path="/board-editor"
        element={
          <AppShell showSettingsGear={false}>
            <BoardEditorView />
          </AppShell>
        }
      />
      <Route
        path="/board-sharing"
        element={
          <AppShell showSettingsGear={false}>
            <BoardSharingView />
          </AppShell>
        }
      />
    </Routes>
  );
}
