import './globals.css';

export const metadata = {
  title: 'Task Notes',
  description: 'Liste de tâches partagée avec notes rapides',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
