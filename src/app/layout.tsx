import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import MainLayout from "@/components/MainLayout";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "XenovaLaw - Sistema de Gestión para Estudios Legales",
  description: "Sistema completo de gestión para estudios jurídicos con gestión de expedientes, clientes, documentos, agenda y facturación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
