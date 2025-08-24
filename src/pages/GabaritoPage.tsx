import { Header } from "../components/Header";
import CameraCapture from "../layout/CameraCapture";

export default function GabaritoPage() {
  const apiUrl = "https://gerador-gabarito-corretor-experimental.lh6c5d.easypanel.host/api/leitor/";

  return (
    <>
      <Header />
          <CameraCapture apiUrl={apiUrl} />
    </>
  );
}
