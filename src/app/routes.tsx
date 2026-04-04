import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { GaleriaPage } from "./components/GaleriaPage";
import { ObraPage } from "./components/ObraPage";
import { SobrePage } from "./components/SobrePage";
import { MentoriaPage } from "./components/MentoriaPage";
import { ContactosPage } from "./components/ContactosPage";
import { PremioPage } from "./components/PremioPage";
import { LoginPage } from "./components/LoginPage";
import { AdminProtected } from "./components/AdminProtected";
import { RegisterPage } from "./components/RegisterPage";
import { TermosPage } from "./components/TermosPage";
import { PrivacidadePage } from "./components/PrivacidadePage";
import { ReclamacoesPage } from "./components/ReclamacoesPage";
import { SucessoPage } from "./components/SucessoPage";
import { RecoverPasswordPage } from "./components/RecoverPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { CarrinhoPage } from "./components/CarrinhoPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { RequireAuth } from "./components/RequireAuth";
import { NotFoundPage } from "./components/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/admin", Component: AdminProtected },
  { path: "/recuperar-password", Component: RecoverPasswordPage },
  { path: "/reset-password", Component: ResetPasswordPage },
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
      { path: "termos", Component: TermosPage },
      { path: "privacidade", Component: PrivacidadePage },
      { path: "reclamacoes", Component: ReclamacoesPage },
      { path: "sucesso", Component: SucessoPage },
      { path: "carrinho", Component: CarrinhoPage },
      {
        path: "checkout",
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
