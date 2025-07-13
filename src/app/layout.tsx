import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";

const lato = Lato({ 
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap"
});

// Note: Mollie Glaston would need to be added via CSS @import or link tag
// as it's not available in Google Fonts Next.js integration

export const metadata: Metadata = {
  title: "Solace Advocates Search",
  description: "Find the perfect advocate for your mental health needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
