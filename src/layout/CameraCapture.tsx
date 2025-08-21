import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../components/Button";

interface CameraCaptureProps {
  apiUrl: string;
}

const CameraCapture = ({ apiUrl }: CameraCaptureProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  // Constraints de resolução (para a câmera)
  const videoConstraints: MediaTrackConstraints = {
    facingMode: "environment", // Garante que a câmera traseira seja usada
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  useEffect(() => {
    // Checa se a câmera foi inicializada corretamente
    const checkCamera = () => {
      if (webcamRef.current?.video) {
        setCameraReady(true);  // A câmera foi inicializada corretamente
      }
    };

    const v = webcamRef.current?.video as HTMLVideoElement | undefined;
    v?.addEventListener("loadedmetadata", checkCamera);
    return () => v?.removeEventListener("loadedmetadata", checkCamera);
  }, []);

  const handleCapture = () => {
    // Verificar se a câmera está pronta
    if (!webcamRef.current || !cameraReady) {
      setError("A câmera não está pronta.");
      return;
    }

    // Capturar a imagem da câmera
    const imageSrc = webcamRef.current.getScreenshot(); // Usando o método `getScreenshot` do WebCam

    if (imageSrc) {
      setPhoto(imageSrc);
      setError(null);
    } else {
      setError("Não foi possível capturar a imagem.");
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      setError("Por favor, tire uma foto primeiro.");
      return;
    }

    if (questionCount <= 0) {
      setError("Por favor, informe o número de questões.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = await fetch(photo).then((res) => res.blob());

      const formData = new FormData();
      formData.append("imagem", blob, "high_quality_photo.png");
      formData.append("numero_questoes", String(questionCount));

      console.log("📤 Enviando imagem:", {
        size: blob.size,
        type: blob.type,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const rawJson = await response.json();

      if (rawJson.error || Object.keys(rawJson).length === 0) {
        throw new Error("Erro na API: Nenhum dado válido retornado.");
      }

      console.log("✅ Resposta (bruta) da API:", rawJson);

      // Adicionando o alert para mostrar o JSON da resposta
      alert(JSON.stringify(rawJson, null, 2)); // Exibe o JSON formatado

    } catch (err: any) {
      console.error("❌ Erro no envio:", err);
      setError(err?.message ? `Erro ao enviar: ${err.message}` : "Erro ao enviar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-3xl p-6">
        <h2 className="text-2xl font-semibold text-blue-600 text-center mb-4">
          Tire a Foto do Gabarito
        </h2>

        <div className="w-full mb-4 relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            width="100%"
            videoConstraints={videoConstraints}
            onUserMediaError={() => {
              setError("Erro ao acessar a câmera. Verifique as permissões.");
            }}
          />

          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <p className="text-white">Carregando câmera...</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <Button label="Capturar Foto" onClick={handleCapture} disabled={loading || !cameraReady} />
        </div>

        {photo && (
          <div className="mt-4 mb-4 text-center">
            <h3 className="text-sm text-gray-500 mb-2">Pré-visualização (reduzida):</h3>
            <img
              src={photo}
              alt="Captured HD"
              className="w-64 h-64 object-contain rounded-lg mx-auto border"
            />
          </div>
        )}

        <div className="w-full mb-4">
          <label htmlFor="questionCount" className="block text-sm text-gray-700 mb-2">
            Número de Questões:
          </label>
          <input
            id="questionCount"
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            min={1}
            placeholder="Ex: 60"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <Button
          label={loading ? "⏳ Enviando..." : "Enviar Foto"}
          onClick={handleSubmit}
          disabled={loading || !photo}
        />
      </div>
    </div>
  );
};

export default CameraCapture;
