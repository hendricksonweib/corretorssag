import { useEffect, useState } from "react";

interface Escola {
  id: number;
  nome: string;
}

interface Prova {
  id: number;
  nome: string;
  _count: {
    questoes: number;
  };
}

const serieNomes: Record<string, string> = {
  "PRIMEIRO_ANO": "1º Ano",
  "SEGUNDO_ANO": "2º Ano",
  "TERCEIRO_ANO": "3º Ano",
  "QUARTO_ANO": "4º Ano",
  "QUINTO_ANO": "5º Ano",
  "SEXTO_ANO": "6º Ano",
  "SETIMO_ANO": "7º Ano",
  "OITAVO_ANO": "8º Ano",
  "NONO_ANO": "9º Ano"
};

export const SelecaoEscolaSerieProva = () => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);

  const [escolaSelecionada, setEscolaSelecionada] = useState<number | null>(null);
  const [serieSelecionada, setSerieSelecionada] = useState<string | null>(null);
  const [provaSelecionada, setProvaSelecionada] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/escolas?page=1&limit=200`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setEscolas(data.data);
        } else {
          setEscolas([]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!escolaSelecionada) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/obter-series-escola?escola_id=${escolaSelecionada}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSeries(data);
        } else {
          setSeries([]);
        }
      })
      .catch(console.error);
  }, [escolaSelecionada]);

  useEffect(() => {
    if (!serieSelecionada) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/provas?serie=${serieSelecionada}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProvas(data);
        } else {
          setProvas([]);
        }
      })
      .catch(console.error);
  }, [serieSelecionada]);

  const gerarGabarito = async () => {
    if (!escolaSelecionada || !serieSelecionada || !provaSelecionada) {
      alert("Selecione todos os campos antes de gerar o gabarito.");
      return;
    }

    const prova = provas.find(p => p.id === provaSelecionada);
    const payload = {
      school_id: escolaSelecionada,
      exam_id: provaSelecionada,
      classroom_name: serieSelecionada,
      question: prova?._count?.questoes || 0
    };

    try {
      const res = await fetch("https://gerador-gabarito-gerador-gabarito.lh6c5d.easypanel.host/api/gerar-gabarito/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Erro ao gerar o gabarito");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "gabarito.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar o gabarito.");
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm mb-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        1. Selecione a Escola, Série e Prova
      </h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="text-sm text-gray-600 mb-1 block">Escola</label>
          <select
            value={escolaSelecionada ?? ""}
            onChange={(e) => {
              setEscolaSelecionada(Number(e.target.value));
              setSerieSelecionada(null);
              setProvaSelecionada(null);
              setSeries([]);
              setProvas([]);
            }}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Selecione uma escola</option>
            {escolas.map((escola) => (
              <option key={escola.id} value={escola.id}>
                {escola.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="text-sm text-gray-600 mb-1 block">Série</label>
          <select
            value={serieSelecionada ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setSerieSelecionada(value || null);
              setProvaSelecionada(null);
              setProvas([]);
            }}
            disabled={!escolaSelecionada}
            className="w-full p-2 border border-gray-300 rounded bg-white"
          >
            <option value="">
              {escolaSelecionada ? "Selecione uma série" : "Selecione uma escola primeiro"}
            </option>
            {series.map((serie) => (
              <option key={serie} value={serie}>
                {serieNomes[serie] || serie}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="text-sm text-gray-600 mb-1 block">Prova</label>
          <select
            value={provaSelecionada ?? ""}
            onChange={(e) => setProvaSelecionada(Number(e.target.value))}
            disabled={!serieSelecionada}
            className="w-full p-2 border border-gray-300 rounded bg-white"
          >
            <option value="">
              {serieSelecionada ? "Selecione uma prova" : "Selecione uma série primeiro"}
            </option>
            {provas.map((prova) => (
              <option key={prova.id} value={prova.id}>
                {prova.nome} ({prova._count?.questoes ?? 0} questões)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={gerarGabarito}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Gerar Gabarito
        </button>
      </div>
    </div>
  );
};
