import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CashRegisterProvider } from "@/context/CashRegisterContext";
import { ExchangeCreditProvider } from "@/context/ExchangeCreditContext";
import { TeamProvider } from "@/context/TeamContext";
import ClientToaster from "@/components/ui/ClientToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kicks PDV | Sistema de Gestão Premium",
  description: "Frente de Caixa (PDV) e Controle de Estoque de Grade para Lojas de Sneakers e Streetwear. Design premium e responsivo para PC e Smart POS.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CashRegisterProvider>
            <ExchangeCreditProvider>
              <TeamProvider>
                {children}
                <ClientToaster />
              </TeamProvider>
            </ExchangeCreditProvider>
          </CashRegisterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
