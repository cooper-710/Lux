import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lux Integrated Biomechanics Report",
  description: "Sequence BioLab integrated biomechanics assessment for Gavin Lux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
