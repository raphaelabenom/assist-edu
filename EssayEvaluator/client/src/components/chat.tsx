import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Bot,
  FileText,
  MessageSquare,
  PenTool,
  Send,
  Upload,
  User,
  X,
} from "lucide-react";
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

interface LessonPlan {
  tema: string;
  anoSerie: string;
  disciplina: string;
  duracaoMinutos: number;
  objetivos: string[];
  conteudoProgramatico: string[];
  metodologia: {
    introducao: string;
    desenvolvimento: string;
    fechamento: string;
  };
  recursosNecessarios: string[];
  avaliacao: string;
}

interface Activity {
  titulo: string;
  disciplina: string;
  anoSerie: string;
  tipoAtividade: string;
  dificuldade: string;
  instrucoes: string;
  material: string;
  questoes: Array<{
    numero: number;
    enunciado: string;
    tipo: string;
    alternativas?: string[];
  }>;
  gabarito: Array<{
    questao: number;
    resposta: string;
    explicacao: string;
  }>;
}

interface StructuredResponse {
  tipo: "plano_aula" | "atividade";
  plano?: LessonPlan;
  atividade?: Activity;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  // Form states for structured inputs
  const [lessonForm, setLessonForm] = useState({
    tema: "",
    anoSerie: "",
    disciplina: "",
    duracao: "50",
  });

  const [activityForm, setActivityForm] = useState({
    tema: "",
    disciplina: "",
    anoSerie: "",
    tipoAtividade: "",
    dificuldade: "medio",
  });

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

  const handleCreateLessonPlan = () => {
    const prompt = `Crie um plano de aula sobre "${lessonForm.tema}" para ${lessonForm.anoSerie} na disciplina ${lessonForm.disciplina}, com duração de ${lessonForm.duracao} minutos.`;
    sendMessageMutation.mutate(prompt);
    setLessonForm({ tema: "", anoSerie: "", disciplina: "", duracao: "50" });
  };

  const handleCreateActivity = () => {
    const prompt = `Crie uma atividade de ${activityForm.tipoAtividade} sobre "${activityForm.tema}" para ${activityForm.anoSerie} na disciplina ${activityForm.disciplina}, com dificuldade ${activityForm.dificuldade}.`;
    sendMessageMutation.mutate(prompt);
    setActivityForm({
      tema: "",
      disciplina: "",
      anoSerie: "",
      tipoAtividade: "",
      dificuldade: "medio",
    });
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

  const renderStructuredContent = (content: string) => {
    try {
      const structured: StructuredResponse = JSON.parse(content);

      if (structured.tipo === "plano_aula" && structured.plano) {
        return renderLessonPlan(structured.plano);
      } else if (structured.tipo === "atividade" && structured.atividade) {
        return renderActivity(structured.atividade);
      }
    } catch (e) {
      // Se não for JSON válido, renderiza como texto normal
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  const renderLessonPlan = (plano: LessonPlan) => (
    <div className="space-y-4">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg text-indigo-800 mb-2">
          📚 Plano de Aula: {plano.tema}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Série:</strong> {plano.anoSerie}
          </div>
          <div>
            <strong>Disciplina:</strong> {plano.disciplina}
          </div>
          <div>
            <strong>Duração:</strong> {plano.duracaoMinutos} minutos
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">
          🎯 Objetivos de Aprendizagem
        </h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {plano.objetivos.map((obj, idx) => (
            <li key={idx}>{obj}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">
          📖 Conteúdo Programático
        </h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {plano.conteudoProgramatico.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">🎓 Metodologia</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Introdução:</strong> {plano.metodologia.introducao}
          </div>
          <div>
            <strong>Desenvolvimento:</strong>{" "}
            {plano.metodologia.desenvolvimento}
          </div>
          <div>
            <strong>Fechamento:</strong> {plano.metodologia.fechamento}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">
          🛠️ Recursos Necessários
        </h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {plano.recursosNecessarios.map((recurso, idx) => (
            <li key={idx}>{recurso}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">📝 Avaliação</h4>
        <p className="text-sm">{plano.avaliacao}</p>
      </div>
    </div>
  );

  const renderActivity = (atividade: Activity) => (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg text-green-800 mb-2">
          ✏️ {atividade.titulo}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Série:</strong> {atividade.anoSerie}
          </div>
          <div>
            <strong>Disciplina:</strong> {atividade.disciplina}
          </div>
          <div>
            <strong>Tipo:</strong> {atividade.tipoAtividade}
          </div>
          <div>
            <strong>Dificuldade:</strong> {atividade.dificuldade}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">📋 Instruções</h4>
        <p className="text-sm bg-gray-50 p-3 rounded">{atividade.instrucoes}</p>
      </div>

      {atividade.material && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">
            📄 Material de Apoio
          </h4>
          <div className="text-sm bg-blue-50 p-4 rounded border-l-4 border-blue-400">
            <div className="whitespace-pre-wrap leading-relaxed">
              {atividade.material.split("\n").map((linha, index) => (
                <div key={index} className={linha.trim() === "" ? "h-4" : ""}>
                  {linha.trim() === "" ? "\u00A0" : linha}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">❓ Questões</h4>
        <div className="space-y-3">
          {atividade.questoes.map((questao, idx) => (
            <div key={idx} className="border border-gray-200 p-3 rounded">
              <p className="font-medium mb-2">
                {questao.numero}. {questao.enunciado}
              </p>
              {questao.alternativas && (
                <div className="space-y-1 text-sm">
                  {questao.alternativas.map((alt, altIdx) => (
                    <div key={altIdx}>{alt}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">✅ Gabarito</h4>
        <div className="space-y-2">
          {atividade.gabarito.map((resposta, idx) => (
            <div key={idx} className="text-sm">
              <strong>Questão {resposta.questao}:</strong> {resposta.resposta}
              {resposta.explicacao && (
                <div className="text-gray-600 mt-1 italic">
                  Explicação: {resposta.explicacao}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            Chat AI Educacional
          </h2>
          <p className="text-gray-600">
            Professora Ana - Especialista em Ensino Fundamental e Médio
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="border-b border-gray-200 bg-white px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare size={16} />
                Chat Livre
              </TabsTrigger>
              <TabsTrigger value="lesson" className="flex items-center gap-2">
                <BookOpen size={16} />
                Plano de Aula
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <PenTool size={16} />
                Atividades
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
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
                        Professora Ana
                      </span>
                    </div>
                    <p>
                      Olá! Sou a Professora Ana, especialista em educação
                      fundamental e média. Posso ajudar você com criação de
                      planos de aula, atividades educacionais, estratégias
                      pedagógicas e muito mais. Como posso ajudar hoje?
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
                          Professora Ana
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
                    {msg.role === "assistant" ? (
                      renderStructuredContent(msg.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-white text-gray-800 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      <span className="text-sm text-gray-600">
                        Professora Ana está preparando a resposta...
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
                  placeholder="Faça uma pergunta sobre educação..."
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
          </TabsContent>

          <TabsContent value="lesson" className="flex-1 flex flex-col m-0 p-0">
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-indigo-600" size={20} />
                    Criar Plano de Aula
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tema">Tema da Aula</Label>
                    <Input
                      id="tema"
                      value={lessonForm.tema}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, tema: e.target.value })
                      }
                      placeholder="Ex: Sistema Solar, Fotossíntese, Revolução Industrial"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="anoSerie">Ano/Série</Label>
                      <Select
                        value={lessonForm.anoSerie}
                        onValueChange={(value) =>
                          setLessonForm({ ...lessonForm, anoSerie: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1º ano EF">
                            1º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="2º ano EF">
                            2º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="3º ano EF">
                            3º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="4º ano EF">
                            4º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="5º ano EF">
                            5º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="6º ano EF">
                            6º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="7º ano EF">
                            7º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="8º ano EF">
                            8º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="9º ano EF">
                            9º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="1º ano EM">
                            1º ano - Ensino Médio
                          </SelectItem>
                          <SelectItem value="2º ano EM">
                            2º ano - Ensino Médio
                          </SelectItem>
                          <SelectItem value="3º ano EM">
                            3º ano - Ensino Médio
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="disciplina">Disciplina</Label>
                      <Select
                        value={lessonForm.disciplina}
                        onValueChange={(value) =>
                          setLessonForm({ ...lessonForm, disciplina: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Português">
                            Língua Portuguesa
                          </SelectItem>
                          <SelectItem value="Matemática">Matemática</SelectItem>
                          <SelectItem value="Ciências">Ciências</SelectItem>
                          <SelectItem value="História">História</SelectItem>
                          <SelectItem value="Geografia">Geografia</SelectItem>
                          <SelectItem value="Inglês">Inglês</SelectItem>
                          <SelectItem value="Educação Física">
                            Educação Física
                          </SelectItem>
                          <SelectItem value="Arte">Arte</SelectItem>
                          <SelectItem value="Física">Física</SelectItem>
                          <SelectItem value="Química">Química</SelectItem>
                          <SelectItem value="Biologia">Biologia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duracao">Duração da Aula (minutos)</Label>
                    <Select
                      value={lessonForm.duracao}
                      onValueChange={(value) =>
                        setLessonForm({ ...lessonForm, duracao: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="50">50 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCreateLessonPlan}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={
                      !lessonForm.tema ||
                      !lessonForm.anoSerie ||
                      !lessonForm.disciplina ||
                      sendMessageMutation.isPending
                    }
                  >
                    {sendMessageMutation.isPending
                      ? "Criando Plano..."
                      : "Criar Plano de Aula"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="activity"
            className="flex-1 flex flex-col m-0 p-0"
          >
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="text-green-600" size={20} />
                    Criar Atividade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="temaAtividade">Tema/Conteúdo</Label>
                    <Input
                      id="temaAtividade"
                      value={activityForm.tema}
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          tema: e.target.value,
                        })
                      }
                      placeholder="Ex: Interpretação de texto, Frações, Ecossistemas"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="anoSerieAtiv">Ano/Série</Label>
                      <Select
                        value={activityForm.anoSerie}
                        onValueChange={(value) =>
                          setActivityForm({ ...activityForm, anoSerie: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1º ano EF">
                            1º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="2º ano EF">
                            2º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="3º ano EF">
                            3º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="4º ano EF">
                            4º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="5º ano EF">
                            5º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="6º ano EF">
                            6º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="7º ano EF">
                            7º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="8º ano EF">
                            8º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="9º ano EF">
                            9º ano - Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="1º ano EM">
                            1º ano - Ensino Médio
                          </SelectItem>
                          <SelectItem value="2º ano EM">
                            2º ano - Ensino Médio
                          </SelectItem>
                          <SelectItem value="3º ano EM">
                            3º ano - Ensino Médio
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="disciplinaAtiv">Disciplina</Label>
                      <Select
                        value={activityForm.disciplina}
                        onValueChange={(value) =>
                          setActivityForm({
                            ...activityForm,
                            disciplina: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Português">
                            Língua Portuguesa
                          </SelectItem>
                          <SelectItem value="Matemática">Matemática</SelectItem>
                          <SelectItem value="Ciências">Ciências</SelectItem>
                          <SelectItem value="História">História</SelectItem>
                          <SelectItem value="Geografia">Geografia</SelectItem>
                          <SelectItem value="Inglês">Inglês</SelectItem>
                          <SelectItem value="Educação Física">
                            Educação Física
                          </SelectItem>
                          <SelectItem value="Arte">Arte</SelectItem>
                          <SelectItem value="Física">Física</SelectItem>
                          <SelectItem value="Química">Química</SelectItem>
                          <SelectItem value="Biologia">Biologia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipoAtividade">Tipo de Atividade</Label>
                      <Select
                        value={activityForm.tipoAtividade}
                        onValueChange={(value) =>
                          setActivityForm({
                            ...activityForm,
                            tipoAtividade: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interpretacao_texto">
                            Interpretação de Texto
                          </SelectItem>
                          <SelectItem value="questoes_objetivas">
                            Questões Objetivas
                          </SelectItem>
                          <SelectItem value="producao_textual">
                            Produção Textual
                          </SelectItem>
                          <SelectItem value="experimento">
                            Experimento/Prática
                          </SelectItem>
                          <SelectItem value="exercicios_matematica">
                            Exercícios de Matemática
                          </SelectItem>
                          <SelectItem value="pesquisa">
                            Atividade de Pesquisa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dificuldade">Nível de Dificuldade</Label>
                      <Select
                        value={activityForm.dificuldade}
                        onValueChange={(value) =>
                          setActivityForm({
                            ...activityForm,
                            dificuldade: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facil">Fácil</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="dificil">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateActivity}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={
                      !activityForm.tema ||
                      !activityForm.anoSerie ||
                      !activityForm.disciplina ||
                      !activityForm.tipoAtividade ||
                      sendMessageMutation.isPending
                    }
                  >
                    {sendMessageMutation.isPending
                      ? "Criando Atividade..."
                      : "Criar Atividade"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Document Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white">
        {/* Documents Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Documentos de Apoio</h3>
          <p className="text-xs text-gray-600">
            Materiais para contexto da Professora Ana
          </p>
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
          <p className="text-xs text-gray-500 mt-2 text-center">
            PDFs, Word, TXT até 10MB
          </p>
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
              <p className="text-xs mt-1">
                Carregue materiais para enriquecer as respostas da Professora
                Ana
              </p>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 text-sm mb-2">
            💡 Dicas de Uso
          </h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div>• Use "plano de aula" para gerar planos estruturados</div>
            <div>• Peça "atividade sobre [tema]" para exercícios</div>
            <div>• Mencione ano/série para respostas adequadas</div>
            <div>• Faça perguntas sobre metodologias pedagógicas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
