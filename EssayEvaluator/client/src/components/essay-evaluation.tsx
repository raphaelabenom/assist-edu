import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, History, Target, CheckCircle, Layout, Lightbulb, Download, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EvaluationResult {
  essayId: number;
  evaluationId: number;
  finalScore: number;
  relevanceScore: number;
  grammarScore: number;
  structureScore: number;
  depthScore: number;
  corrections: string;
}

export default function EssayEvaluation() {
  const [theme, setTheme] = useState("");
  const [content, setContent] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const evaluateMutation = useMutation({
    mutationFn: async (data: { content: string; theme?: string }) => {
      const response = await apiRequest("POST", "/api/essays/evaluate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setEvaluationResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 200) {
      alert("A redação deve ter pelo menos 200 caracteres.");
      return;
    }
    evaluateMutation.mutate({ content, theme: theme || undefined });
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600";
    if (score >= 8) return "text-blue-600";
    if (score >= 7) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excelente";
    if (score >= 8) return "Muito bom";
    if (score >= 7) return "Bom";
    return "Regular";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Avaliar Redação</h2>
          <p className="text-gray-600">
            Use IA para avaliar redações automaticamente com critérios múltiplos
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <History size={16} />
          <span>Histórico</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Essay Input */}
        <Card>
          <CardHeader>
            <CardTitle>Texto da Redação</CardTitle>
            <p className="text-sm text-gray-600">
              Cole ou digite o texto da redação para avaliação
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="theme">Tema da Redação (Opcional)</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: O impacto da tecnologia na educação"
                />
              </div>
              <div>
                <Label htmlFor="content">Texto da Redação</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cole aqui o texto da redação para ser avaliada..."
                  rows={12}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Mínimo de 200 caracteres ({content.length}/200)
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={evaluateMutation.isPending || content.length < 200}
              >
                <Wand2 className="mr-2" size={16} />
                {evaluateMutation.isPending ? "Avaliando..." : "Avaliar com IA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Evaluation Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Avaliação</CardTitle>
            <p className="text-sm text-gray-600">
              Análise detalhada com pontuação e feedback
            </p>
          </CardHeader>
          <CardContent>
            {evaluateMutation.isPending && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Avaliando redação com IA...</p>
              </div>
            )}

            {!evaluationResult && !evaluateMutation.isPending && (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wand2 className="text-gray-400" size={32} />
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  Aguardando Redação
                </h4>
                <p className="text-gray-600">
                  Insira uma redação para começar a avaliação automática
                </p>
              </div>
            )}

            {evaluationResult && (
              <div className="space-y-6">
                {/* Final Score */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl mb-4">
                    <h4 className="text-lg font-medium mb-2">Pontuação Final</h4>
                    <div className="text-4xl font-bold">
                      {evaluationResult.finalScore.toFixed(1)}
                    </div>
                    <p className="text-indigo-100 text-sm mt-1">de 10.0</p>
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="space-y-4">
                  {[
                    {
                      label: "Relevância",
                      description: "Aderência ao tema",
                      score: evaluationResult.relevanceScore,
                      icon: <Target size={16} />,
                      bgColor: "bg-blue-500",
                    },
                    {
                      label: "Gramática",
                      description: "Correção linguística",
                      score: evaluationResult.grammarScore,
                      icon: <CheckCircle size={16} />,
                      bgColor: "bg-green-500",
                    },
                    {
                      label: "Estrutura",
                      description: "Organização textual",
                      score: evaluationResult.structureScore,
                      icon: <Layout size={16} />,
                      bgColor: "bg-purple-500",
                    },
                    {
                      label: "Profundidade",
                      description: "Análise e argumentação",
                      score: evaluationResult.depthScore,
                      icon: <Lightbulb size={16} />,
                      bgColor: "bg-orange-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${item.bgColor} p-2 rounded-lg text-white`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                          {item.score.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getScoreLabel(item.score)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Feedback Detalhado
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {evaluationResult.corrections}
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Button className="flex-1" variant="default">
                      <Download className="mr-2" size={16} />
                      Exportar Relatório
                    </Button>
                    <Button className="flex-1" variant="secondary">
                      <Save className="mr-2" size={16} />
                      Salvar Avaliação
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
