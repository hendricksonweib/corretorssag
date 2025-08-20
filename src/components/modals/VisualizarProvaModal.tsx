import { useEffect, useRef, useState } from "react";
import { EditarQuestaoModal } from "./EditQuestaoModal"; 

interface VisualizarProvaModalProps {
  provaId: number;
  onClose: () => void;
}

interface Alternativa {
  id: number;
  texto: string;
  correta: boolean;
}

interface Questao {
  id: number;
  enunciado: string;
  imagem_url?: string;
  pontos: number;
  alternativas: Alternativa[];
}

interface Prova {
  id: number;
  nome: string;
  arquivo_url?: string;
}

export const VisualizarProvaModal = ({ provaId, onClose }: VisualizarProvaModalProps) => {
  const [prova, setProva] = useState<Prova | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [questaoIdEmEdicao, setQuestaoIdEmEdicao] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const carregarQuestoes = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/provas/${provaId}/questoes-detalhadas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.questoes)) {
          setProva(data.prova);
          setQuestoes(data.questoes);
        } else {
          console.error("Resposta inesperada da API:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar questões:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarQuestoes();
  }, [provaId]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
        onClick={handleClickOutside}
      >
        <div
          ref={contentRef}
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-lg flex flex-col"
        >
          <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-700">{prova?.nome}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl font-light"
            >
              &times;
            </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-6">
            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : questoes.length === 0 ? (
              <p className="text-gray-500">Nenhuma questão encontrada.</p>
            ) : (
              questoes.map((questao, index) => (
                <div key={questao.id} className="p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">
                      {index + 1}. {questao.enunciado}
                    </p>
                    <button
                      onClick={() => setQuestaoIdEmEdicao(questao.id)} 
                      className="text-blue-600 hover:text-blue-800 transition text-sm"
                      title="Editar questão"
                    >
                      Editar
                    </button>
                  </div>

                  {questao.imagem_url && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${questao.imagem_url}`}
                      alt="Imagem da questão"
                      className="mb-4 max-h-48 rounded-lg border"
                    />
                  )}

                  <ul className="space-y-1">
                    {questao.alternativas.map((alt, i) => (
                      <li
                        key={alt.id}
                        className={`p-2 rounded ${
                          alt.correta ? "bg-green-50 border-l-4 border-green-400" : ""
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {alt.texto}
                        {alt.correta && (
                          <span className="ml-2 text-green-600 font-semibold text-xs">
                            (correta)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-gray-400 mt-2">Pontos: {questao.pontos}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {questaoIdEmEdicao !== null && (
        <EditarQuestaoModal
          questaoId={questaoIdEmEdicao}
          onClose={() => setQuestaoIdEmEdicao(null)}
          onSave={() => {
            setQuestaoIdEmEdicao(null);
            carregarQuestoes(); 
          }}
        />
      )}
    </>
  );
};
