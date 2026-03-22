import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect } from "react";
import logoImg from "figma:asset/fb8eceeec2fc77379dae215b16172ec7fc5e32b5.png";
import { LanguageProvider } from "./i18n";

export default function App() {
  useEffect(() => {
    const link: HTMLLinkElement =
      document.querySelector("link[rel~='icon']") ||
      (() => {
        const el = document.createElement("link");
        el.rel = "icon";
        document.head.appendChild(el);
        return el;
      })();
    link.type = "image/png";
    link.href = logoImg;
  }, []);

  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}