import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Holiday Light Pro CRM", template: "%s | Holiday Light Pro CRM" },
  description: "A streamlined CRM for professional holiday light installers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
