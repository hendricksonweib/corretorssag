import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

  const tipo = user?.tipo_usuario;

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");
    navigate("/");
  };

  const navItems = [
    { name: "Correção", path: "/correcao", allowed: tipo !== "PROFESSOR"},
    { name: "Gabarito", path: "/gabaritos", allowed: tipo !== "PROFESSOR"},
    { name: "Alunos", path: "/alunos", allowed: tipo !== "GESTOR" },
    { name: "Usuários", path: "/usuarios", allowed: tipo === "ADMINISTRADOR" },
  ];

  return (
    <header className="bg-blue-600 text-white fixed top-0 left-0 right-0 shadow z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg">SAG CORRETOR</span>
          {navItems
            .filter((item) => item.allowed)
            .map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `px-3 py-1 rounded ${
                    isActive ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
                  } transition`
                }
              >
                {name}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.nome || "Usuário"}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 hover:underline focus:outline-none"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
