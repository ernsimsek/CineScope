import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cinescope.local"),
  title: {
    default: "CINESCOPE — Cinema lives here",
    template: "%s · CINESCOPE",
  },
  description:
    "A cinematic film discovery platform. Browse trending movies, search the archives, and explore the canon — powered by TMDB.",
  openGraph: {
    title: "CINESCOPE",
    description: "A cinematic film discovery platform.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ paddingTop: "var(--nav-height)" }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
