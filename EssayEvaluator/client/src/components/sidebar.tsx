import { BookOpen, BarChart, FileText, Wand2, Folder, MessageSquare, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: "dashboard", icon: <BarChart size={20} />, label: "Dashboard" },
    { id: "evaluate", icon: <FileText size={20} />, label: "Avaliar Redação" },
    { id: "generate", icon: <Wand2 size={20} />, label: "Gerar Redação" },
    { id: "materials", icon: <Folder size={20} />, label: "Materiais" },
    { id: "chat", icon: <MessageSquare size={20} />, label: "Chat AI" },
    { id: "settings", icon: <Settings size={20} />, label: "Configurações" },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 flex items-center space-x-3 border-b border-indigo-800">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BookOpen size={24} />
        </div>
        <h1 className="text-xl font-bold">EduAssist</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-indigo-700 text-white"
                    : "text-indigo-200 hover:bg-indigo-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-indigo-300">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 p-3 text-indigo-200 hover:bg-indigo-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
