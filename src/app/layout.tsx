// src/app/layout.tsx
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/Modal";

const quicksand = Quicksand({ 
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "InvitaDigital | Invitaciones Digitales para Todo Evento",
  description: "Crea invitaciones digitales interactivas para Baby Shower, Cumpleaños, Bodas, 15 Años, Graduación y más. Confirmación de asistencia y lista de regalos incluida.",
  keywords: "invitaciones digitales, baby shower, cumpleaños, bodas, 15 años, graduación, eventos, RSVP, lista de regalos",
  authors: [{ name: "InvitaDigital" }],
  openGraph: {
    title: "InvitaDigital | Invitaciones Digitales para Todo Evento",
    description: "Crea invitaciones digitales interactivas para cualquier tipo de evento",
    type: "website",
    locale: "es_DO",
    siteName: "InvitaDigital",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvitaDigital | Invitaciones Digitales",
    description: "Crea invitaciones digitales interactivas para cualquier evento",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${quicksand.variable} font-sans antialiased`}>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}