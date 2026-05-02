import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowSync - Team Coordination Platform',
  description: 'Simplify workflows, improve task visibility, and strengthen team communication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const t = localStorage.getItem('flowsync-theme');
              if (t === 'light') {
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
