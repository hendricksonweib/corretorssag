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
    { name: "Alunos", path: "/alunos", allowed: tipo !== "GESTOR" },
    { name: "Usuários", path: "/usuarios", allowed: tipo === "ADMINISTRADOR" },
  ];

  // Gera iniciais do usuário (ex.: "Wellington Wescles" -> "WW")
  const getInitials = (fullName?: string) => {
    if (!fullName || typeof fullName !== "string") return "US";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  const initials = getInitials(user?.nome);

  return (
    <header className="sticky top-0 z-50">
      {/* faixa superior: logo + nome do app + avatar + logout */}
      <div className="bg-violet-700 text-white">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* logo + nome */}
          <div className="flex items-center gap-3">
            {/* troque por sua logo se tiver */}
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              {/* SVG placeholder de logo */}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 12h16M4 12a8 8 0 118 8" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide">SAG CORRETOR</span>
          </div>

          {/* usuário + logout */}
          <div className="flex items-center gap-3">
            {/* avatar circular com iniciais */}
            <div
              className="w-9 h-9 rounded-full bg-white text-violet-700 font-semibold flex items-center justify-center shadow-inner"
              title={user?.nome || "Usuário"}
              aria-label="Usuário"
            >
              {initials}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1 hover:underline focus:outline-none"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>

            {/* hambúrguer (mobile) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden text-white focus:outline-none"
              aria-label="Abrir menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* faixa inferior: opções de navegação (sempre visível embaixo do header) */}
      <nav className="bg-white shadow-sm border-b border-violet-100">
        <div className="max-w-screen-xl mx-auto">
          {/* desktop: itens lado a lado; mobile: scroll horizontal */}
          <div className="hidden sm:flex gap-2 px-2">
            {navItems.filter(i => i.allowed).map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition
                   ${isActive ? "bg-violet-100 text-violet-800" : "text-slate-700 hover:bg-slate-50"}`
                }
              >
                {name}
              </NavLink>
            ))}
          </div>

          {/* mobile: menu colapsável logo abaixo */}
          <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}>
            <div className="flex gap-2 overflow-x-auto px-2 py-2">
              {navItems.filter(i => i.allowed).map(({ name, path }) => (
                <NavLink
                  key={name}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition
                     ${isActive ? "bg-violet-100 text-violet-800" : "text-slate-700 hover:bg-slate-50"}`
                  }
                >
                  {name}
                </NavLink>
              ))}
              {/* botão sair aparece dentro do menu no mobile */}
              <button
                onClick={handleLogout}
                className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
