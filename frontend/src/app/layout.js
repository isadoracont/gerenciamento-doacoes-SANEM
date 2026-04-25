import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationWrapper from "../components/notifications/NotificationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sanem",
  description: "Doações Podem Mudar Vidas",
  charset: "utf-8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NotificationWrapper>
          {children}
        </NotificationWrapper>
      </body>
    </html>
  );
}
