import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CashRegisterProvider } from "@/context/CashRegisterContext";
import { ExchangeCreditProvider } from "@/context/ExchangeCreditContext";
import { TeamProvider } from "@/context/TeamContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sneaker Lab - Frente de Caixa & PDV",
  description: "Frente de Caixa (PDV) e Controle de Estoque de Grade para Sneaker Shops. Design premium e responsivo para PC e Smart POS.",
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
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CashRegisterProvider>
            <ExchangeCreditProvider>
              <TeamProvider>
                {children}
                <Toaster position="bottom-right" richColors closeButton />
              </TeamProvider>
            </ExchangeCreditProvider>
          </CashRegisterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
