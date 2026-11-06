import type { Metadata, Viewport } from "next";
import "./globals.css";
import SWRegister from "./components/AppBootStrap";
import Providers from "./components/Providers";

export const metadata: Metadata = {
  title: "Daftar",
  description: "a ledger app for your transactions",
  appleWebApp: { capable: true, title: 'Daftar', statusBarStyle: 'default' }
};
export const viewport: Viewport = { themeColor: '#f5f7f6' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          <SWRegister />
          {children}
        </Providers>

      </body>
    </html>
  )
}
