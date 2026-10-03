import type { Metadata } from "next";
import { Providers } from "@/app/_components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "claude_hangs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
