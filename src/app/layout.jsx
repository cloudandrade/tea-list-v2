import './globals.css';
import AppStartup from './components/AppStartup';
import { ToastProvider } from './components/ToastProvider';

export const metadata = {
  title: 'Tea List',
  description: 'Crie e gerencie listas de presentes para momentos especiais.',
};

export const viewport = {
  themeColor: '#fff8f5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <AppStartup>{children}</AppStartup>
        </ToastProvider>
      </body>
    </html>
  );
}
