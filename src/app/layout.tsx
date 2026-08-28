import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerador de Propostas Comerciais",
  description: "Sistema completo de geração de propostas comerciais profissionais com múltiplos templates e preview em tempo real.",
  keywords: ["propostas", "comercial", "contratos", "documentos", "PDF", "impressão"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Gerador de Propostas Comerciais",
    description: "Crie propostas profissionais em tempo real",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerador de Propostas Comerciais",
    description: "Crie propostas profissionais em tempo real",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
