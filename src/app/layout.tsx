
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter from next/font
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from "@/components/ui/toaster";

// Initialize Inter font with desired subsets and display strategy
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensures text is visible with a fallback font while Inter loads
});

export const metadata: Metadata = {
  title: 'FlowForge - Plan Your Success',
  description: 'Visually plan your workflows, manage tasks, and achieve your goals with FlowForge.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* next/font handles font optimization, these links are not needed */}
      </head>
      {/* Apply the Inter font class to the body for optimal loading */}
      {/* Your tailwind.config.ts already defines 'Inter' for 'font-body' and 'font-headline',
          which will work seamlessly as next/font makes 'Inter' available efficiently. */}
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

