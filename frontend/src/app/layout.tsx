import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";



export const metadata: Metadata = {
  title: "Chat App",
  description: "Scalable Chat App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body  >
       <AppProvider>
         {children}
       </AppProvider>
      </body>
    </html>
  );
}
