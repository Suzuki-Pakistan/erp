import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Flair ERP · Core Setup",
    template: "%s · Flair ERP",
  },
  description: "Flair Cosmetic & Fragrance operations platform frontend demo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full">
        {children}
      </body>
    </html>
  );
}
