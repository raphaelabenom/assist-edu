import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import EssayEvaluation from "@/components/essay-evaluation";
import EssayGeneration from "@/components/essay-generation";
import Materials from "@/components/materials";
import Chat from "@/components/chat";
import Settings from "@/components/settings";
import { Search, Bell } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      evaluate: "Avaliar Redação",
      generate: "Gerar Redação",
      materials: "Materiais",
      chat: "Chat AI",
      settings: "Configurações",
    };
    return titles[activeTab as keyof typeof titles] || "Dashboard";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "evaluate":
        return <EssayEvaluation />;
      case "generate":
        return <EssayGeneration />;
      case "materials":
        return <Materials />;
      case "chat":
        return <Chat />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
