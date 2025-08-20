import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";

interface Escola {
  id: number;
  nome: string;
}

interface Turma {
  id: number;
  nome: string;
  escola_id: number;
  escola: Escola;
}

interface TurmaListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  onEdit?: (id: number) => void;
  searchNome: string;
  escolaId: number | null;
}

export const TurmaList = ({
  reload,
  onReloadDone,
  onEdit,
  searchNome,
  escolaId,
}: TurmaListProps) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTurmas = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
      });

      if (searchNome.trim() !== "") queryParams.append("nome", searchNome);
      if (escolaId !== null) queryParams.append("escola_id", String(escolaId));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turmas?${queryParams.toString()}`
      );

      const data = await res.json();
      setTurmas(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar turmas", err);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, [page, searchNome, escolaId]);

  useEffect(() => {
    if (reload) {
      fetchTurmas().then(() => onReloadDone?.());
    }
  }, [reload, onReloadDone]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Deseja excluir esta turma?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turmas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir");

      fetchTurmas();
    } catch (err) {
      alert("Erro ao excluir turma");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-5 py-3 bg-blue-50 border-b border-gray-200 font-semibold text-sm text-gray-800">
        Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> - Total: {totalItems} turmas
      </div>

      {turmas.map((turma) => (
        <div
          key={turma.id}
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              📚
            </div>
            <div>
              <p className="text-blue-700 font-semibold hover:underline cursor-pointer">
                {turma.nome}
              </p>
              <p className="text-sm text-gray-500">
                ID: {turma.id} | Escola: {turma.escola?.nome || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <IconButton type="edit" onClick={() => onEdit?.(turma.id)} />
            <IconButton type="delete" onClick={() => handleDelete(turma.id)} />
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          &lt;
        </button>
        <span className="px-3 py-1 bg-blue-600 text-white rounded">{page}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
