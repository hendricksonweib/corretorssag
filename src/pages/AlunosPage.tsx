import { useState } from "react";
import { Header } from "../components/Header";
import { AlunoList } from "../layout/AlunoList";
import { CreateAlunoModal } from "../components/modals/CreateAlunoModal";
import { AlunoFilter } from "../components/AlunoFilter";
import { Plus, Users, Filter, BookOpen, GraduationCap } from "lucide-react";

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header Mobile */}
        <div className="lg:hidden sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Alunos</h1>
                <p className="text-sm text-slate-600">Gerenciamento de estudantes</p>
              </div>
            </div>
            <button
              onClick={openCreateAlunoModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
              aria-label="Criar novo aluno"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Novo</span>
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestão de Alunos</h1>
                <p className="text-slate-600">Gerencie e consulte os estudantes cadastrados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700">
                <BookOpen size={16} />
                <span className="text-sm font-medium">Sistema Escolar</span>
              </div>
              <button
                onClick={openCreateAlunoModal}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                Novo Aluno
              </button>
            </div>
          </div>

          {/* Filtros Section */}
          <section className="mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Filtros e Busca</h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Encontre alunos específicos usando os filtros abaixo
                </p>
              </div>
              <div className="p-5">
                <AlunoFilter
                  onFilter={handleFilter}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-slate-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Lista de Alunos</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="hidden sm:inline">Filtros ativos:</span>
                    {searchNome && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                        Nome: {searchNome}
                      </span>
                    )}
                    {escolaId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                        Escola
                      </span>
                    )}
                    {turmaId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                        Turma
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-1 sm:p-2">
                <AlunoList
                  reload={reload}
                  onReloadDone={() => setReload(false)}
                  searchNome={searchNome}
                  escolaId={escolaId}
                  turmaId={turmaId}
                />
              </div>
            </div>
          </section>

          {/* Espaço inferior para mobile */}
          <div className="h-20 lg:h-10" />
        </div>
      </div>

      {/* Botão flutuante para mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={openCreateAlunoModal}
          className="rounded-full shadow-lg bg-blue-600 text-white p-4 hover:bg-blue-700 active:scale-95 transition-all transform hover:rotate-90 duration-200"
          aria-label="Criar novo aluno"
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