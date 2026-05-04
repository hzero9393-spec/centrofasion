import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HydrationGate } from "@/components/HydrationGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ClothFasion - Premium Fashion Store",
  description: "Shop the latest trends in fashion. Premium quality clothing and accessories for men, women, and kids at best prices.",
  keywords: ["ClothFasion", "Fashion", "Clothing", "Online Shopping", "Men", "Women", "Kids"],
  icons: {
    icon: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=64&h=64&fit=crop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <HydrationGate>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </HydrationGate>
      </body>
    </html>
  );
}
