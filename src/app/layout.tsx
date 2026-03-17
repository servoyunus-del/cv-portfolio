import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yunus Emre Gün | Portfolio',
  description: 'Bilgisayar Programcılığı Öğrencisi & Yazılım Geliştirici',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Yunus Emre Gün | Portfolio',
    description: 'Bilgisayar Programcılığı Öğrencisi & Yazılım Geliştirici',
    siteName: 'CV / Portfolio',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
