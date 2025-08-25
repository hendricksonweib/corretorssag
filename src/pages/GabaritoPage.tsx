import { Header } from "../components/Header";
import CameraCapture from "../layout/CameraCapture";

export default function GabaritoPage() {
  const apiUrl = `${import.meta.env.VITE_API_CORRETOR}/api/leitor/`;

  return (
    <>
      <Header />
          <CameraCapture apiUrl={apiUrl} />
    </>
  );
}
