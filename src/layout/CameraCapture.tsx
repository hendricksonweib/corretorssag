import React, { useState } from "react";
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

  const webcamRef = React.useRef<Webcam>(null);

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
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

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("questionCount", String(questionCount));

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar os dados.");
      }

      const result = await response.json();
      console.log("Resposta da API:", result);

      alert("Foto e número de questões enviados com sucesso!");
    } catch (err) {
      setError("Erro ao enviar os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold text-blue-600 text-center mb-4">
          Tire uma Foto e Envie os Dados
        </h2>

        <div className="w-full mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "user",
            }}
          />
        </div>

        <Button
          label="Capturar Foto"
          onClick={handleCapture}
          disabled={loading}
        />

        {photo && (
          <div className="mt-4 mb-4 text-center">
            <h3 className="text-sm text-gray-500">Pré-visualização da Foto:</h3>
            <img src={photo} alt="Captured" className="w-48 h-48 rounded-lg mx-auto" />
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
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <div className="w-full">
          <Button
            label={loading ? "Enviando..." : "Enviar"}
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
