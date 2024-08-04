/* layout.tsx */
import type { Metadata } from "next"; // Import Metadata type from Next.js
import { Inter } from "next/font/google"; // Import Inter font from Google Fonts
import "./globals.css"; // Import global CSS styles

const inter = Inter({ subsets: ["latin"] }); // Load Inter font with Latin subset

// Define metadata for the document
export const metadata: Metadata = {
  title: "AI Prompt", // Title of the application
  description: "Application to assist in AI Prompting for coders", // Description of the application
};

// RootLayout component to wrap around the application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Define children prop as ReactNode
}>) {
  return (
    <html lang="en"> {/* Set language attribute for the document */}
      <body className={inter.className}> {/* Apply Inter font class to the body */}
        <div className="main-bg">{children}</div> {/* Wrapper div with background gradient */}
      </body>
    </html>
  );
}
