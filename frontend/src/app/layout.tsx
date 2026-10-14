import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/Theme/ThemeProvider";
import Providers from "@/lib/tanstack/providers";
import { GlobalLoaderProvider } from "@/components/GlobalLoader/GlobalLoaderProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "Personal finance and expense tracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <GlobalLoaderProvider>
            <Providers>{children}</Providers>
          </GlobalLoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
