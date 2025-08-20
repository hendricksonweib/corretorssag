import { useState } from "react";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { AlunoList } from "../layout/AlunoList";
import { CreateAlunoModal } from "../components/modals/CreateAlunoModal";
import { AlunoFilter } from "../components/AlunoFilter";
import { ImportAlunosModal } from "../components/modals/ImportAlunosModal ";

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [turmaId, setTurmaId] = useState<number | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleFilter = (
    nome: string,
    escolaId: number | null,
    turmaId: number | null
  ) => {
    setSearchNome(nome);
    setEscolaId(escolaId);
    setTurmaId(turmaId);
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
       <PageHeader
  title="Alunos"
  description="Gerenciamento de alunos"
  actionLabel="Novo Aluno"
  onActionClick={() => {
    setEditId(null);
    setShowModal(true);
  }}
  actionsRight={(
    <button
      onClick={() => setShowImportModal(true)}
      className="flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-md text-sm transition"
    >
      Importar via CSV
    </button>
  )}
/>

        </div>

        <AlunoFilter onFilter={handleFilter} />

        <AlunoList
          reload={reload}
          onReloadDone={() => setReload(false)}
          onEdit={handleEdit}
          searchNome={searchNome}
          escolaId={escolaId}
          turmaId={turmaId}
        />
      </div>

      {showModal && (
        <CreateAlunoModal
          alunoId={editId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showImportModal && (
        <ImportAlunosModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            setReload(true);
          }}
        />
      )}
    </>
  );
}
