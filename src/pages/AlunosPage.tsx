import { useState } from "react";
import { Header } from "../components/Header";
import { AlunoList } from "../layout/AlunoList";
import { CreateAlunoModal } from "../components/modals/CreateAlunoModal";
import { AlunoFilter } from "../components/AlunoFilter";
import { Plus } from "lucide-react";

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [turmaId, setTurmaId] = useState<number | null>(null);

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleFilter = (
    nome: string,
    escola: number | null,
    turma: number | null
  ) => {
    setSearchNome(nome);
    setEscolaId(escola);
    setTurmaId(turma);
  };

  const openCreateAlunoModal = () => {
    setEditId(null);
    setShowModal(true);
  };

  return (
    <>
      <Header />

      <div className="pt-16 sm:pt-20 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">

          <div className="sm:hidden sticky top-16 z-20 bg-gradient-to-b from-gray-50 to-gray-100/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
            <div className="flex items-center justify-between py-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Alunos</h1>
                <p className="text-sm text-gray-600">Gerenciamento de alunos</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreateAlunoModal}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm active:scale-[0.98] transition"
                  aria-label="Criar novo aluno"
                >
                  <Plus className="h-4 w-4" />
                  Novo
                </button>
              </div>
            </div>
          </div>

          <section
            aria-label="Filtros"
            className="mt-4 sm:mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h2>
            </div>
            <div className="px-2 sm:px-4 py-2 sm:py-4">
              <AlunoFilter
                onFilter={handleFilter}
                onOpenCreateAlunoModal={openCreateAlunoModal}
              />
              <p className="sm:hidden mt-2 text-xs text-gray-500">
                Dica: use os filtros para encontrar alunos por nome, escola ou turma.
              </p>
            </div>
          </section>

          <section
            aria-label="Lista de alunos"
            className="mt-4 sm:mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Todos os alunos</h2>
            </div>

            <div className="px-2 sm:px-4 py-2 sm:py-4">
              <AlunoList
                reload={reload}
                onReloadDone={() => setReload(false)}
                searchNome={searchNome}
                escolaId={escolaId}
                turmaId={turmaId}
              />
            </div>
          </section>

          <div className="h-28 sm:h-0 pb-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <div className="sm:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={openCreateAlunoModal}
          className="rounded-full shadow-lg border border-gray-200 bg-white p-4 active:scale-95 transition"
          aria-label="Criar novo aluno (flutuante)"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {showModal && (
        <CreateAlunoModal
          alunoId={editId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
