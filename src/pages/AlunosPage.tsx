import { useState } from "react";
import { Header } from "../components/Header";
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

  const handleFilter = (
    nome: string,
    escolaId: number | null,
    turmaId: number | null
  ) => {
    setSearchNome(nome);
    setEscolaId(escolaId);
    setTurmaId(turmaId);
  };

  const openCreateAlunoModal = () => {
    setEditId(null);
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">

        <AlunoFilter onFilter={handleFilter} onOpenCreateAlunoModal={openCreateAlunoModal} />

        <AlunoList
          reload={reload}
          onReloadDone={() => setReload(false)}
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
