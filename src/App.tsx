import { BrowserRouter } from 'react-router';
import { ServiceProvider } from '@presentation/providers/ServiceProvider';
import { AppRouter } from '@presentation/router/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <ServiceProvider>
        <AppRouter />
      </ServiceProvider>
    </BrowserRouter>
  );
}
