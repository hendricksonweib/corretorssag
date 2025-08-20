import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { TurmaList } from "../layout/TurmaList";
import { CreateTurmaModal } from "../components/modals/CreateTurmaModal";

interface Escola {
  id: number;
  nome: string;
}

export default function TurmasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/escolas?page=1&limit=200`);
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data;
        setEscolas(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error("Erro ao buscar escolas", err);
        setEscolas([]);
      }
    };

    fetchEscolas();
  }, []);

  const handleFilter = () => {
    setReload(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Turmas"
          description="Gerenciamento de turmas"
          actionLabel="Nova Turma"
          onActionClick={() => {
            setEditId(null);
            setShowModal(true);
          }}
        />

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Buscar Turmas</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <input
              type="text"
              placeholder="Digite o nome da turma..."
              className="w-full md:w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
            />

            <select
              className="w-full md:w-1/4 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={escolaId ?? ""}
              onChange={(e) =>
                setEscolaId(e.target.value === "" ? null : parseInt(e.target.value))
              }
            >
              <option value="">Todas as escolas</option>
              {Array.isArray(escolas) &&
                escolas.map((escola) => (
                  <option key={escola.id} value={escola.id}>
                    {escola.nome}
                  </option>
                ))}
            </select>

            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              Filtrar
            </button>
          </div>
        </div>

        <TurmaList
          reload={reload}
          onReloadDone={() => setReload(false)}
          onEdit={handleEdit}
          searchNome={searchNome}
          escolaId={escolaId}
        />
      </div>

      {showModal && (
        <CreateTurmaModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          turmaId={editId}
        />
      )}
    </>
  );
}
