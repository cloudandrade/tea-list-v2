import './globals.css';
import { NavigationLoadingProvider } from './components/NavigationLoadingProvider';
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
          <NavigationLoadingProvider>
            {children}
          </NavigationLoadingProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
