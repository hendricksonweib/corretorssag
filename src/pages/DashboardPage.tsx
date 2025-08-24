import { Header } from "../components/Header";
import { PdfUploader } from "../ui/PdfUploader";

export const DashboardPage = () => {
  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-gray-50 pt-24 sm:pt-28 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="flex flex-col gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Enviar documentos PDF
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Faça o upload do seu arquivo para começarmos a análise. Suporte a mobile com feedbacks visuais e layout adaptativo.
            </p>
          </section>

          <section className="mt-4 sm:mt-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <aside className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-28 space-y-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">Dicas rápidas</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Arraste e solte ou selecione o arquivo.</li>
                      <li>Tamanho recomendado: até 20MB.</li>
                      <li>Formatos: PDF (preferencial).</li>
                    </ul>
                  </div>
                </aside>

                <div className="lg:col-span-2">
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-3 sm:p-4">
                    <PdfUploader />
                  </div>

                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs sm:text-sm text-gray-700">
                      Toque para selecionar um arquivo
                    </div>
                    <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs sm:text-sm text-gray-700">
                      Arraste e solte no desktop
                    </div>
                    <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs sm:text-sm text-gray-700">
                      Visualização segura e privada
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};
