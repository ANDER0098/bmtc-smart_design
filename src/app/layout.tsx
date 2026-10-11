import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Kannada, Roboto } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const kannada = Noto_Sans_Kannada({
  variable: "--font-kannada",
  subsets: ["kannada"],
  weight: ["400", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-etm",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "The Conductor's Digital Companion — Nielsen Product Design Internship",
  description:
    "BMTC Smart-ETM ticketing flow · 3 taps < 4s · Biomechanical reachability architecture. Interactive hardware simulator + case study deck.",
  keywords: ["BMTC", "ETM", "product design", "case study", "Nielsen", "ticketing"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090c12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${jetbrains.variable} ${kannada.variable} ${roboto.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
