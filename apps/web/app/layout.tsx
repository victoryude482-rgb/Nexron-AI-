import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexron",
  description: "A focused AI workspace for research, coding, browser work, and lead intelligence.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}