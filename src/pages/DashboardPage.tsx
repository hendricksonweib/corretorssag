import { Header } from "../components/Header";
import { PdfUploader } from "../ui/PdfUploader";
import { FileText, Smartphone, Monitor } from "lucide-react";

export const DashboardPage = () => {
  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50/30 pt-24 sm:pt-28 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">


          {/* Main Content Section */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                {/* Sidebar - Desktop */}
                <aside className="lg:col-span-4 xl:col-span-3 hidden lg:block">
                  <div className="sticky top-32 space-y-6">
                    <div className="bg-blue-50 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <FileText size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-900">Informações Importantes</h3>
                      </div>
                      <ul className="space-y-3 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700">1</span>
                          </div>
                          <span>Arraste e solte ou clique para selecionar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700">2</span>
                          </div>
                          <span>Tamanho máximo: 20MB por arquivo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700">3</span>
                          </div>
                          <span>Formatos suportados: PDF</span>
                        </li>
                      </ul>
                    </div>

                  </div>
                </aside>

                {/* Main Upload Area */}
                <div className="lg:col-span-8 xl:col-span-9">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 p-6 sm:p-8">
                    <PdfUploader />
                  </div>

                  {/* Features Grid - Mobile & Desktop */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Monitor size={18} />
                        </div>
                        <h4 className="font-medium text-slate-900">Desktop</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Arraste e solte arquivos diretamente na área indicada
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <Smartphone size={18} />
                        </div>
                        <h4 className="font-medium text-slate-900">Mobile</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Toque para selecionar arquivos da sua galeria
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Tips Section */}
          <section className="lg:hidden bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Dicas para Upload
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <span className="text-sm text-slate-700">Toque na área central para selecionar arquivos</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <span className="text-sm text-slate-700">Mantenha os arquivos abaixo de 20MB</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <span className="text-sm text-slate-700">Apenas arquivos PDF são aceitos</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};