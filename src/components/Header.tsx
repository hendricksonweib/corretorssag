import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

  const tipo = user?.tipo_usuario;

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");
    navigate("/");
  };

  const navItems = [
    { name: "Correção", path: "/correcao", allowed: tipo !== "PROFESSOR" },
    // { name: "Gabarito", path: "/gabaritos", allowed: tipo !== "PROFESSOR" },
    { name: "Alunos", path: "/alunos", allowed: tipo !== "GESTOR" },
    { name: "Usuários", path: "/usuarios", allowed: tipo === "ADMINISTRADOR" },
  ];

  return (
    <header className="bg-blue-600 text-white fixed top-0 left-0 right-0 shadow z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo e menu principal */}
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg">SAG CORRETOR</span>

          {/* Menu de navegação para desktop */}
          <div className="hidden md:flex items-center gap-8">
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
        </div>

        {/* Menu de usuário e logout */}
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

        {/* Botão hamburguer para dispositivos móveis */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Menu lateral para dispositivos móveis */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-blue-600 text-white w-full py-3 flex flex-col items-center`}
      >
        {navItems
          .filter((item) => item.allowed)
          .map(({ name, path }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `px-3 py-2 rounded w-full text-center ${
                  isActive ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
                } transition`
              }
            >
              {name}
            </NavLink>
          ))}
      </div>
    </header>
  );
};
