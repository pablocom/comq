import { BrowserRouter } from 'react-router';
import { ServiceProvider } from '@presentation/providers/ServiceProvider';
import { AppRouter } from '@presentation/router/AppRouter';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ServiceProvider>
        <AppRouter />
      </ServiceProvider>
    </BrowserRouter>
  );
}
