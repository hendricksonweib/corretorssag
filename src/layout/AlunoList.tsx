import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, RefreshCw, AlertCircle, X, School, IdCard, GraduationCap, Star } from "lucide-react";
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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

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
      if (err.name !== "AbortError") setError(err?.message || "Erro ao buscar alunos.");
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
    if (reload) fetchAlunos({ resetPage: true }).then(() => onReloadDone?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  // Infinite scroll
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

  const openAlunoDetails = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsModalOpen(true);
    setTimeout(() => modalCloseBtnRef.current?.focus(), 0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  };

  const Avatar = ({ name }: { name: string }) => {
    const initials = name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "?";

    return (
      <div className="relative">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center shadow-sm">
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white" />
      </div>
    );
  };

  const NotaBadge = ({ nota }: { nota: string }) => {
    if (!nota || nota === "S/N") return null;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Star size={14} className="opacity-90" />
        {nota}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="text-[13px] sm:text-sm text-slate-600">
            <strong className="text-slate-900">{page}</strong>
            <span className="text-slate-400"> / </span>
            <strong className="text-slate-900">{totalPages}</strong>
            <span className="text-slate-300 mx-2">•</span>
            <span>Total: {totalItems}</span>
          </div>
          <button
            onClick={() => fetchAlunos({ resetPage: true })}
            className="inline-flex items-center gap-2 text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition"
            aria-label="Atualizar lista"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        {/* Estados */}
        {initialLoading && (
          <div className="p-4 sm:p-6 grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-slate-100 p-4 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/80 to-transparent animate-[shimmer_1.2s_infinite]" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 bg-slate-200 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!initialLoading && error && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={22} />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Falha ao carregar</h3>
            <p className="mt-1 text-sm text-slate-600">{error}</p>
            <button
              onClick={() => fetchAlunos({ resetPage: true })}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 active:scale-[0.98] transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!initialLoading && !error && alunos.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <GraduationCap />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Nenhum aluno encontrado</h3>
            <p className="mt-1 text-sm text-slate-600">Ajuste os filtros ou a busca por nome.</p>
          </div>
        )}

        {/* Lista — cards estilizados */}
        <div className="p-3 sm:p-4 grid grid-cols-1 gap-3">
          {alunos.map((aluno) => (
            <button
              key={aluno.id}
              onClick={() => openAlunoDetails(aluno)}
              className="group relative text-left rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_0_rgba(2,6,23,0.04)] hover:shadow-[0_8px_24px_-12px_rgba(2,6,23,0.25)] transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              {/* Borda lateral animada */}
              <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-4">
                <Avatar name={aluno.nome} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 font-semibold text-[15px] sm:text-base truncate">
                      {aluno.nome}
                    </p>
                    {/* Nota como badge compacta */}
                    <NotaBadge nota={aluno.nota} />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <IdCard size={14} className="text-slate-400" />
                      ID: {aluno.id}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <School size={14} className="text-slate-400" />
                      Escola: {aluno.escola?.nome || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap size={14} className="text-slate-400" />
                      Turma: {aluno.turma?.nome || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Ação: câmera */}
                <div className="shrink-0">
                  <button
                    onClick={(e) => handleCameraClick(aluno.id, e)}
                    aria-label={`Abrir gabaritos do aluno ${aluno.nome}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50 active:scale-[0.98] transition"
                    title="Ir para gabaritos"
                  >
                    <Camera size={18} />
                  </button>
                </div>
              </div>

              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-blue-50/0 via-blue-50/40 to-indigo-50/0" />
            </button>
          ))}
        </div>

        {/* Sentinela + loader */}
        <div ref={sentinelRef} />
        {loading && !initialLoading && (
          <div className="py-3 text-center text-xs text-slate-500">Carregando…</div>
        )}
      </div>

      {/* Modal bonito */}
      {isModalOpen && selectedAluno && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />

          {/* Conteúdo */}
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
              {/* Header gradiente */}
              <div className="relative px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-semibold">
                    {(selectedAluno.nome?.split(" ").map(n => n[0]).slice(0,2).join("") || "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold truncate">{selectedAluno.nome}</h3>
                    <p className="text-white/80 text-xs sm:text-[13px] truncate">
                      ID {selectedAluno.id}
                    </p>
                  </div>
                </div>

                <button
                  ref={modalCloseBtnRef}
                  onClick={closeModal}
                  className="absolute right-3 top-3 p-2 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Fechar modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5">
                <div className="grid grid-cols-1 gap-3">
                  <InfoRow icon={<School size={16} />} label="Escola" value={selectedAluno.escola?.nome || "N/A"} />
                  <InfoRow icon={<GraduationCap size={16} />} label="Turma" value={selectedAluno.turma?.nome || "N/A"} />
                  <InfoRow icon={<Star size={16} />} label="Nota" value={selectedAluno.nota || "—"} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-sm"
                >
                  Fechar
                </button>
                <button
                  onClick={() => navigate("/gabaritos", { state: { alunoId: selectedAluno.id } })}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm shadow-sm active:scale-[0.98] transition"
                >
                  Ir para gabaritos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* --------- UI helpers --------- */

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_0_0_rgba(2,6,23,0.03)]">
    <div className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{value || "—"}</p>
    </div>
  </div>
);

/* Tailwind keyframes para shimmer (opcional) — adicione no tailwind.config se quiser persistente
theme.extend.keyframes.shimmer = {
  "0%,100%": { transform: "translateX(-100%)" },
  "50%": { transform: "translateX(100%)" },
};
theme.extend.animation.shimmer = "shimmer 1.2s ease-in-out infinite";
*/
