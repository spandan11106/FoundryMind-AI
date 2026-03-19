import "./globals.css";

export const metadata = {
  title: "FoundryMind AI",
  description: "Casting optimization and factory intelligence platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
