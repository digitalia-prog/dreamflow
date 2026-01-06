import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DreamFlow Pro",
  description: "Générateur IA de scripts viraux",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
