import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, FileText, Send, Upload, User, X } from "lucide-react";
import { useState } from "react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Document {
  id: number;
  name: string;
  size: string;
  createdAt: string;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat/messages", {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (document: {
      name: string;
      size: string;
      content?: string;
    }) => {
      const response = await apiRequest("POST", "/api/documents", document);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    uploadDocumentMutation.mutate({
      name: file.name,
      size: `${sizeInMB} MB`,
      content: "Conteúdo do documento simulado", // In real app, read file content
    });
  };

  const handleDeleteDocument = (id: number) => {
    if (confirm("Tem certeza que deseja remover este documento?")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            Chat AI Educacional
          </h2>
          <p className="text-gray-600">
            Faça perguntas baseadas nos seus documentos ou sobre educação em
            geral
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-white text-gray-800 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-indigo-600 p-1 rounded-full">
                    <Bot className="text-white" size={12} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    EduAssist AI
                  </span>
                </div>
                <p>
                  Olá! Sou o assistente EduAssist. Posso ajudar você com
                  questões sobre educação, criação de materiais didáticos,
                  métodos de avaliação e muito mais. Como posso ajudar hoje?
                </p>
              </div>
            </div>
          )}

          {messages.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-indigo-600 p-1 rounded-full">
                      <Bot className="text-white" size={12} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      EduAssist AI
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <span className="text-xs text-indigo-200">
                      {formatTime(msg.createdAt)}
                    </span>
                    <User className="text-indigo-200" size={12} />
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-white text-gray-800 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm text-gray-600">
                    EduAssist está digitando...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>

      {/* Document Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white">
        {/* Documents Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Documentos Carregados</h3>
          <p className="text-xs text-gray-600">Contexto para o Chat AI</p>
        </div>

        {/* Document Upload */}
        <div className="p-4">
          <label className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-500 transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Carregar Documento</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
          </label>
        </div>

        {/* Documents List */}
        <div className="p-4 space-y-3">
          {documents.map((doc: Document) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-indigo-600" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">{doc.size}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-600"
                onClick={() => handleDeleteDocument(doc.id)}
                disabled={deleteDocumentMutation.isPending}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={32} className="mx-auto mb-2" />
              <p className="text-sm">Nenhum documento carregado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
