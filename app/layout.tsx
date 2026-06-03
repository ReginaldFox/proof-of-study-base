import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProofOfStudy',
  description: 'A zero-cost learning rewards mini app on Base.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="6a1fe0664a7867dea5dcf4f9" />
      </head>
      <body>{children}</body>
    </html>
  );
}
