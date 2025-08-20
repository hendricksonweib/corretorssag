import { useEffect, useState } from "react";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  userId?: number | null;
}

const userTypes = [
  "ADMINISTRADOR",
  "COORDENADOR",
  "PROFESSOR",
  "GESTOR",
  "SECRETARIA",
];

export const CreateUserModal = ({ onClose, onSuccess, userId }: CreateUserModalProps) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Buscar dados do usuário se for edição
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${userId}`);
        if (!res.ok) throw new Error("Erro ao buscar usuário");
        const data = await res.json();
        setNome(data.nome || "");
        setEmail(data.email || "");
        setTipoUsuario(data.tipo_usuario || "");
      } catch (err: any) {
        setError(err.message || "Erro ao carregar usuário");
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      nome,
      email,
      senha,
      tipo_usuario: tipoUsuario,
    };

    try {
      const res = await fetch(
        userId
          ? `${import.meta.env.VITE_API_URL}/api/usuarios/${userId}`
          : `${import.meta.env.VITE_API_URL}/api/register`,
        {
          method: userId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar usuário");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
     <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {userId ? "Editar Usuário" : "Adicionar Novo Usuário"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nome
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Senha
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required={!userId} // Só obriga senha no cadastro
              placeholder={userId ? "Deixe em branco para manter" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tipo de Usuário
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              required
            >
              <option value="">Selecione o tipo</option>
              {userTypes.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading
                ? userId
                  ? "Salvando..."
                  : "Cadastrando..."
                : userId
                ? "Salvar"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
