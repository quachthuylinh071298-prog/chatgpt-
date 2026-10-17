import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "MedIntel — Medical Marketing Intelligence",
  description:
    "Không gian nghiên cứu và chiến lược marketing y tế dựa trên bằng chứng.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
