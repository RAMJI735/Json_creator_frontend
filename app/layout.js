import "./globals.css";

export const metadata = {
  title: "GeoPermit JSON Creator",
  description: "Build workflow sections and fields, then generate GeoPermit JSON.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
