import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, RefreshCw, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Turma { id: number; nome: string; }
interface Escola { id: number; nome: string; }

interface Aluno {
  id: number;
  nome: string;
  turma_id: number;
  turma: Turma;
  escola: Escola;
  nota: string;
  prova?: { id: number; nome: string } | null;
}

interface AlunoListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  searchNome: string;
  escolaId: number | null;
  turmaId: number | null;
}

export const AlunoList = ({
  reload,
  onReloadDone,
  searchNome,
  escolaId,
  turmaId,
}: AlunoListProps) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  const filtersKey = useMemo(
    () => JSON.stringify({ searchNome, escolaId, turmaId }),
    [searchNome, escolaId, turmaId]
  );

  const fetchAlunos = async (opts?: { append?: boolean; resetPage?: boolean }) => {
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isFirstPage = opts?.resetPage || page === 1;
    if (isFirstPage) setInitialLoading(true);
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({ page: String(opts?.resetPage ? 1 : page) });
      if (searchNome.trim() !== "") queryParams.append("nome", searchNome.trim());
      if (escolaId !== null) queryParams.append("escola_id", String(escolaId));
      if (turmaId !== null) queryParams.append("turma_id", String(turmaId));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/alunos?${queryParams.toString()}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error(`Erro ${res.status}: não foi possível carregar os alunos.`);

      const data = await res.json();
      const newAlunos: Aluno[] = data.data || [];

      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      setAlunos((prev) => (opts?.append ? [...prev, ...newAlunos] : newAlunos));
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err?.message || "Erro ao buscar alunos.");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos({ append: page > 1 && !initialLoading });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchAlunos({ resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    if (reload) {
      fetchAlunos({ resetPage: true }).then(() => onReloadDone?.());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const canLoadMore = page < totalPages && !loading && !initialLoading && !error;
        if (entry.isIntersecting && canLoadMore) {
          setPage((p) => Math.min(p + 1, totalPages));
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loading, initialLoading, error]);

  const handleCameraClick = (alunoId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate("/gabaritos", { state: { alunoId } });
  };

  const openAlunoDetails = async (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsModalOpen(true);
    setModalLoading(false);
    setModalError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
    setModalError(null);
    setModalLoading(false);
  };

  const notaBadge = (nota: string) => {
    if (!nota || nota === "S/N") return null;
    const base = "px-2 py-0.5 rounded-full text-xs font-semibold";
    const cls = "bg-green-100 text-green-700";
    return <span className={`${base} ${cls}`}>{nota}</span>;
  };

  const Avatar = ({ name }: { name: string }) => {
    const letter = (name?.trim?.()[0] || "?").toUpperCase();
    return (
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
        {letter}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <strong>{page}</strong>/<strong>{totalPages}</strong>
            <span className="mx-2">•</span>
            Total: {totalItems}
          </div>
          <button
            onClick={() => fetchAlunos({ resetPage: true })}
            className="px-2 py-1 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Lista */}
        <div className="divide-y divide-gray-100">
          {alunos.map((aluno) => (
            <button
              key={aluno.id}
              onClick={() => openAlunoDetails(aluno)}
              className="w-full text-left focus:outline-none"
            >
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={aluno.nome} />
                  <div className="min-w-0">
                    <p className="text-blue-700 font-semibold text-sm truncate">{aluno.nome}</p>
                    <p className="text-xs text-gray-500 truncate">
                      ID: {aluno.id} • Turma: {aluno.turma?.nome || "N/A"} • Escola: {aluno.escola?.nome || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notaBadge(aluno.nota)}
                  <button
                    onClick={(e) => handleCameraClick(aluno.id, e)}
                    className="w-9 h-9 rounded-full border text-blue-700 hover:bg-blue-50 flex items-center justify-center"
                  >
                    <Camera size={18} />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div ref={sentinelRef} />
      </div>

      {/* Modal simples */}
      {isModalOpen && selectedAluno && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Detalhes do Aluno</h3>
              <button onClick={closeModal} ref={modalCloseBtnRef}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p><strong>Nome:</strong> {selectedAluno.nome}</p>
              <p><strong>ID:</strong> {selectedAluno.id}</p>
              <p><strong>Turma:</strong> {selectedAluno.turma?.nome || "N/A"}</p>
              <p><strong>Escola:</strong> {selectedAluno.escola?.nome || "N/A"}</p>
              <p><strong>Nota:</strong> {selectedAluno.nota}</p>
            </div>
            <div className="px-4 py-3 border-t flex justify-end">
              <button
                onClick={() => handleCameraClick(selectedAluno.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Ir para gabaritos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
