import { LanguageProvider } from "./context/LanguageContext";
import "./globals.css";


export const metadata = {
  title: "Box Office Egypt",
  description: "Cinema Database",
};


export default function RootLayout({children}) {

  return (
    <html lang="en">

      <body>

        <LanguageProvider>
          {children}
        </LanguageProvider>

      </body>

    </html>
  );
}