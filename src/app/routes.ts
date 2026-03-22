import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { GaleriaPage } from "./components/GaleriaPage";
import { ObraPage } from "./components/ObraPage";
import { SobrePage } from "./components/SobrePage";
import { MentoriaPage } from "./components/MentoriaPage";
import { ContactosPage } from "./components/ContactosPage";
import { PremioPage } from "./components/PremioPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { AdminDashboard } from "./components/AdminDashboard";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/admin", Component: AdminDashboard },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "galeria", Component: GaleriaPage },
      { path: "galeria/:id", Component: ObraPage },
      { path: "sobre", Component: SobrePage },
      { path: "mentoria", Component: MentoriaPage },
      { path: "contactos", Component: ContactosPage },
      { path: "premio", Component: PremioPage },
      { path: "*", Component: HomePage },
    ],
  },
]);