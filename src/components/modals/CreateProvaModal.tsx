import { useState } from "react";
import { CreateQuestoesModal } from "../modals/CreateQuestoesModal";

interface ProvaModalProps {
  provaId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProvaModal = ({ provaId, onClose, onSuccess }: ProvaModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [novaProvaId, setNovaProvaId] = useState<number | null>(null);
  const [mostrarQuestoesModal, setMostrarQuestoesModal] = useState(false);

  const handleSubmit = async () => {
    try {
      const payload = { nome: titulo };

      const provaRes = await fetch(`${import.meta.env.VITE_API_URL}/api/provas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!provaRes.ok) {
        const errorText = await provaRes.text();
        console.error("Erro ao criar prova:", provaRes.status, errorText);
        throw new Error("Erro ao salvar prova");
      }

      const provaSalva = await provaRes.json();
      console.log("Prova criada com sucesso:", provaSalva);
      setNovaProvaId(provaSalva.id);
      setMostrarQuestoesModal(true);
    } catch (err) {
      alert("Erro ao salvar prova. Veja o console para mais informações.");
      console.error(err);
    }
  };

  const handleQuestoesFinalizadas = () => {
    setMostrarQuestoesModal(false);
    onSuccess();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{provaId ? "Editar Prova" : "Criar Nova Prova"}</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Prova</label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Prova de Matemática"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              {provaId ? "Salvar" : "Criar e Adicionar Questões"}
            </button>
          </div>
        </div>
      </div>

      {mostrarQuestoesModal && novaProvaId && (
  <CreateQuestoesModal
    key={novaProvaId} 
    provaId={novaProvaId}
    onClose={handleQuestoesFinalizadas}
  />
)}

    </>
  );
};
