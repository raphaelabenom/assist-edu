import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Copy, Download, Share } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface GenerationResult {
  id: number;
  title: string;
  content: string;
  wordCount: number;
  charCount: number;
  readTime: string;
}

export default function EssayGeneration() {
  const [theme, setTheme] = useState("");
  const [type, setType] = useState("dissertativa");
  const [level, setLevel] = useState("medio");
  const [wordCount, setWordCount] = useState("500");
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: { theme: string; type: string; level: string; wordCount: number }) => {
      const response = await apiRequest("POST", "/api/essays/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGenerationResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      alert("Por favor, insira um tema para a redação.");
      return;
    }
    generateMutation.mutate({
      theme,
      type,
      level,
      wordCount: parseInt(wordCount),
    });
  };

  const copyToClipboard = () => {
    if (generationResult) {
      navigator.clipboard.writeText(generationResult.content);
      alert("Texto copiado para a área de transferência!");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gerar Redação Exemplar</h2>
        <p className="text-gray-600">
          Crie redações exemplares usando IA para usar como modelo ou referência
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Input */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <p className="text-sm text-gray-600">
              Defina o tema e parâmetros para gerar a redação
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="theme">Tema da Redação *</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: A importância da sustentabilidade ambiental"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Redação</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dissertativa">Dissertativa Argumentativa</SelectItem>
                    <SelectItem value="narrativa">Narrativa</SelectItem>
                    <SelectItem value="descritiva">Descritiva</SelectItem>
                    <SelectItem value="expositiva">Expositiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Nível Educacional</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                    <SelectItem value="medio">Ensino Médio</SelectItem>
                    <SelectItem value="superior">Ensino Superior</SelectItem>
                    <SelectItem value="enem">ENEM/Vestibular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="wordCount">Tamanho Aproximado</Label>
                <Select value={wordCount} onValueChange={setWordCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">~300 palavras</SelectItem>
                    <SelectItem value="500">~500 palavras</SelectItem>
                    <SelectItem value="700">~700 palavras</SelectItem>
                    <SelectItem value="1000">~1000 palavras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={generateMutation.isPending || !theme.trim()}
              >
                <Wand2 className="mr-2" size={16} />
                {generateMutation.isPending ? "Gerando..." : "Gerar Redação"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Essay */}
        <Card>
          <CardHeader>
            <CardTitle>Redação Gerada</CardTitle>
            <p className="text-sm text-gray-600">Texto exemplar gerado pela IA</p>
          </CardHeader>
          <CardContent>
            {generateMutation.isPending && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Gerando redação exemplar...</p>
              </div>
            )}

            {!generationResult && !generateMutation.isPending && (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wand2 className="text-gray-400" size={32} />
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Pronto para Gerar</h4>
                <p className="text-gray-600">
                  Defina um tema para começar a geração da redação exemplar
                </p>
              </div>
            )}

            {generationResult && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    {generationResult.title}
                  </h4>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    {generationResult.content}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                  <span>
                    Palavras: <strong>{generationResult.wordCount}</strong>
                  </span>
                  <span>
                    Caracteres: <strong>{generationResult.charCount}</strong>
                  </span>
                  <span>
                    Tempo de leitura: <strong>{generationResult.readTime}</strong>
                  </span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Copy className="mr-2" size={16} />
                    Copiar Texto
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Download className="mr-2" size={16} />
                    Baixar PDF
                  </Button>
                  <Button variant="secondary">
                    <Share size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
