import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // خطوط أرقى للأكاديمية
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner"

// إعداد الخطوط: Inter للنصوص العادية و Playfair للعناوين (يعطي طابع كلاسيكي)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruhulqudus Academy | أرقى منصة لتعلم العربية",
  description: "Traditional wisdom meets modern learning technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {/* ThemeProvider يسمح بتبديل الوضع الليلي والنهار */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
           <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}