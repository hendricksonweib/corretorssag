import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/DashboardPage";
import DashboardProfessor from "./pages/DashboardProfessor";
import EscolasPage from "./pages/EscolasPage";
import TurmasPage from "./pages/TurmasPage";
import AlunosPage from "./pages/AlunosPage";
import ProvasPage from "./pages/ProvasPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import GabaritoPage from "./pages/GabaritoPage";
import { FiltroDashboardProvider } from "./hooks/useFiltroDashboard";
import { useAuthContext } from "./context/AuthContext";

function App() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  const isAdmin = user.tipo_usuario === "ADMINISTRADOR";
  const isGestor = user.tipo_usuario === "GESTOR";
  const isProfessor = user.tipo_usuario === "PROFESSOR"

 return (
  <FiltroDashboardProvider>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/correcao" element={<DashboardPage />} />

      {(isAdmin || !isGestor) && (
        <>
          <Route path="/escolas" element={<EscolasPage />} />
          <Route path="/turmas" element={<TurmasPage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/provas" element={<ProvasPage />} />
          <Route path="/gabaritos" element={<GabaritoPage />} />
        </>
      )}

      {isProfessor && (
        <Route path="/dashboardprofessor" element={<DashboardProfessor />} />
      )}

      {isAdmin && <Route path="/usuarios" element={<UsuariosPage />} />}
    </Routes>
  </FiltroDashboardProvider>
);

}
export default App;
