import type { Metadata } from "next";
import { Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import AudioProvider from "@/components/providers/AudioProvider";
import AmbientOrb from "@/components/shared/AmbientOrb";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "A World Drawn For You",
  description: "A collection of portraits, flowers, and songs — made with love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${caveat.variable} antialiased`}
    >
      <body className="bg-[#06080d] text-[#f0ece4] overflow-x-hidden">
        <AudioProvider>
          <LenisProvider>
            {children}
            <AmbientOrb />
          </LenisProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
