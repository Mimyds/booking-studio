import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Geist } from 'next/font/google'
import "./globals.css";
import { cn } from "@/lib/utils";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'The Studio | Locations de Vacances Premium en Martinique',
  description: 'Découvrez nos studios d\'exception en Martinique. Vue mer, piscine, confort haut de gamme. Réservation directe sans commission.'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr" className={cn(cormorant.variable, "font-sans", geist.variable)}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
