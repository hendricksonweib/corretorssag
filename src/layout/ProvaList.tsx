import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { Eye } from "lucide-react";

interface Prova {
  id: number;
  nome: string;
  createdAt: string;
  _count: {
    questoes: number;
  };
}

interface ProvaListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  onEdit?: (id: number) => void;
  onVisualizar?: (id: number) => void; 
  searchTitulo?: string;
}

export const ProvaList = ({
  reload,
  onReloadDone,
  onVisualizar,
  searchTitulo = "",
}: ProvaListProps) => {
  const [provas, setProvas] = useState<Prova[]>([]);

  const fetchProvas = async () => {
    try {
      const queryParams = new URLSearchParams();
      if ((searchTitulo ?? "").trim())
        queryParams.append("titulo", (searchTitulo ?? "").trim());

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/provas?${queryParams.toString()}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setProvas(data);
      } else {
        setProvas([]);
      }
    } catch (err) {
      console.error("Erro ao buscar provas", err);
    }
  };

  useEffect(() => {
    fetchProvas();
  }, [searchTitulo]);

  useEffect(() => {
    if (reload) {
      fetchProvas().then(() => onReloadDone?.());
    }
  }, [reload]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir esta prova?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/provas/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const erro = await res.text();
        console.error("Erro ao excluir:", erro);
        alert(
          "Erro ao excluir prova. Verifique se ela possui questões associadas."
        );
        return;
      }

      alert("Prova excluída com sucesso!");
      fetchProvas();
    } catch (err) {
      console.error("Erro inesperado ao excluir prova:", err);
      alert("Erro inesperado ao excluir prova.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-5 py-3 bg-blue-50 border-b border-gray-200 font-semibold text-sm text-gray-800">
        Total: {provas.length} provas
      </div>

      {provas.map((prova) => (
        <div
          key={prova.id}
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              📝
            </div>
            <div>
              <p className="text-blue-700 font-semibold hover:underline cursor-pointer">
                {prova.nome}
              </p>
              <p className="text-sm text-gray-500">
                ID: {prova.id} | Criada em:{" "}
                {new Date(prova.createdAt).toLocaleDateString()} <br />
                Questões: {prova._count.questoes}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {/* <IconButton type="edit" onClick={() => onEdit?.(prova.id)} /> */}
            <IconButton type="delete" onClick={() => handleDelete(prova.id)} />
            <button
              onClick={() => onVisualizar?.(prova.id)}
              className="p-2 rounded-full hover:bg-blue-100 transition"
              title="Visualizar prova"
            >
              <Eye className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>
      ))}

      {provas.length === 0 && (
        <div className="px-5 py-4 text-sm text-gray-500 text-center">
          Nenhuma prova encontrada.
        </div>
      )}
    </div>
  );
};
