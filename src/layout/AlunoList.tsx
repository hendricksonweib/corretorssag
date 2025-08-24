import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  RefreshCw,
  AlertCircle,
  X,
  School,
  GraduationCap,
  Star,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
  const [perPage, setPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);

  const filtersKey = useMemo(
    () => JSON.stringify({ searchNome, escolaId, turmaId }),
    [searchNome, escolaId, turmaId]
  );

  const fetchAlunos = async (opts?: { resetPage?: boolean }) => {
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const targetPage = opts?.resetPage ? 1 : page;
    if (opts?.resetPage) setPage(1);
    
    setLoading(true);
    if (targetPage === 1) setInitialLoading(true);

    try {
      const queryParams = new URLSearchParams({ 
        page: String(targetPage),
        limit: String(perPage)
      });
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
      setAlunos(newAlunos);
    } catch (err: any) {
      if (err.name !== "AbortError") setError(err?.message || "Erro ao buscar alunos.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // primeira carga / mudança de página
  useEffect(() => {
    fetchAlunos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  // mudança de filtros
  useEffect(() => {
    fetchAlunos({ resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // reload externo
  useEffect(() => {
    if (reload) {
      fetchAlunos({ resetPage: true }).then(() => onReloadDone?.());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  // ações
  const handleCameraClick = (alunoId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate("/gabaritos", { state: { alunoId } });
  };

  const openAlunoDetails = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  };

  // Paginação
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  // Gerar array de páginas para exibição
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // UI helpers
  const Avatar = ({ name }: { name: string }) => {
    const initials =
      name?.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("") || "?";
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
    const notaNum = parseFloat(nota);
    let bgColor = "bg-slate-100";
    let textColor = "text-slate-700";
    
    if (notaNum >= 8) {
      bgColor = "bg-emerald-100";
      textColor = "text-emerald-700";
    } else if (notaNum >= 6) {
      bgColor = "bg-amber-100";
      textColor = "text-amber-700";
    } else if (notaNum > 0) {
      bgColor = "bg-rose-100";
      textColor = "text-rose-700";
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} ring-1 ring-opacity-50 ${textColor.replace('text-', 'ring-')}`}>
        <Star size={14} className="opacity-90" />
        {nota}
      </span>
    );
  };

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

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header com controles de paginação */}
        <div className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-[13px] sm:text-sm text-slate-600">
              <span className="hidden sm:inline">Página </span>
              <strong className="text-slate-900">{page}</strong>
              <span className="text-slate-400"> de </span>
              <strong className="text-slate-900">{totalPages}</strong>
              <span className="text-slate-300 mx-2">•</span>
              <span>Total: {totalItems}</span>
            </div>
            
            {/* Filtros ativos visíveis apenas no desktop */}
            <div className="hidden md:flex items-center gap-2">
              {searchNome && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                  <Search size={12} />
                  {searchNome}
                </span>
              )}
              {(escolaId || turmaId) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                  <Filter size={12} />
                  Filtros ativos
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Itens por página */}
            <div className="flex items-center gap-2">
              <label htmlFor="perPage" className="text-xs text-slate-600 whitespace-nowrap">
                Itens por página:
              </label>
              <select
                id="perPage"
                value={perPage}
                onChange={handlePerPageChange}
                className="text-xs px-2 py-1 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              onClick={() => fetchAlunos({ resetPage: true })}
              className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-50"
              aria-label="Atualizar lista"
              title="Atualizar"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Estados */}
        {initialLoading && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: perPage }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-slate-100 p-4 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.03)] animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 bg-slate-200 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
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

        {/* ======= LISTA ======= */}
        {!initialLoading && !error && alunos.length > 0 && (
          <div className="p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {alunos.map((aluno) => (
              <div
                key={aluno.id}
                className="group w-full text-left rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_0_rgba(2,6,23,0.04)] hover:shadow-[0_8px_24px_-12px_rgba(2,6,23,0.25)] transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <button 
                  onClick={() => openAlunoDetails(aluno)}
                  className="w-full text-left"
                >
                  <div className="flex flex-col gap-3 px-4 py-4">
                    {/* Cabeçalho com avatar e informações básicas */}
                    <div className="flex items-start justify-between">
                      <Avatar name={aluno.nome} />
                      <div className="flex flex-col items-end gap-1">
                        <NotaBadge nota={aluno.nota} />
                        <span className="text-xs text-slate-500">ID: {aluno.id}</span>
                      </div>
                    </div>

                    {/* Nome do aluno */}
                    <div>
                      <h3 className="text-slate-900 font-semibold text-base leading-snug whitespace-normal break-words line-clamp-2">
                        {aluno.nome}
                      </h3>
                    </div>

                    {/* Informações da escola e turma */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <School size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{aluno.escola?.nome || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <GraduationCap size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{aluno.turma?.nome || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Botão de ação - Câmera */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                  <button
                    onClick={(e) => handleCameraClick(aluno.id, e)}
                    aria-label={`Abrir gabaritos do aluno ${aluno.nome}`}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50 active:scale-[0.98] transition"
                    title="Ir para gabaritos"
                  >
                    <Camera size={16} />
                    <span className="text-sm font-medium">Acessar Gabaritos</span>
                  </button>
                </div>

                {/* realce sutil no hover */}
                <div className="pointer-events-none h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/15 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {!initialLoading && !error && totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Mostrando {alunos.length} de {totalItems} alunos
              </div>
              
              <div className="flex items-center gap-1">
                {/* Primeira página */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={page === 1 || loading}
                  className="p-2 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Primeira página"
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Página anterior */}
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1 || loading}
                  className="p-2 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1 mx-2">
                  {getPageNumbers().map((pageNum, index) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum as number)}
                        disabled={loading}
                        className={`min-w-[2rem] px-2 py-1 rounded-md border transition ${
                          page === pageNum
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                {/* Próxima página */}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages || loading}
                  className="p-2 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Próxima página"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Última página */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages || loading}
                  className="p-2 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Última página"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======= MODAL ======= */}
      {isModalOpen && selectedAluno && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />

          {/* Conteúdo */}
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-4">
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header gradiente */}
              <div className="sticky top-0 z-10 px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-semibold">
                    {(selectedAluno.nome?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold truncate">{selectedAluno.nome}</h3>
                    <p className="text-white/80 text-xs sm:text-[13px] truncate">ID {selectedAluno.id}</p>
                  </div>
                </div>

                <button
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
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
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