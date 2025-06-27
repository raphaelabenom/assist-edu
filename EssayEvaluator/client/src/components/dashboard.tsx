import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Clock, FileText, Star, TrendingUp } from "lucide-react";

interface DashboardStats {
  essaysEvaluated: number;
  materialsCreated: number;
  timeSaved: number;
  averageScore: string;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
  time: string;
}

export default function Dashboard() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/recent-activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "evaluation":
        return <FileText className="text-indigo-600" size={20} />;
      case "generation":
        return <Star className="text-green-600" size={20} />;
      case "material":
        return <BarChart className="text-blue-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`;
    } else {
      return "Agora mesmo";
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Redações Avaliadas</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats?.essaysEvaluated || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  <span>+12% este mês</span>
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FileText className="text-indigo-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Materiais Criados</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats?.materialsCreated || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  <span>+8% este mês</span>
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BarChart className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tempo Economizado</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats?.timeSaved || 0}h
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  <span>+15% este mês</span>
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pontuação Média</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats?.averageScore || "0.0"}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  <span>+5% este mês</span>
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Star className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avaliações por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"].map((month, i) => (
                <div
                  key={month}
                  className="flex flex-col items-center space-y-2"
                >
                  <div
                    className="bg-indigo-500 w-8 rounded-t"
                    style={{ height: `${20 + i * 15}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">{month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { range: "9.0 - 10.0", percentage: 35, color: "bg-green-500" },
              { range: "8.0 - 8.9", percentage: 28, color: "bg-blue-500" },
              { range: "7.0 - 7.9", percentage: 22, color: "bg-yellow-500" },
              { range: "6.0 - 6.9", percentage: 15, color: "bg-orange-500" },
            ].map((item) => (
              <div
                key={item.range}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-600">{item.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atividades Recentes</CardTitle>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Ver todas
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {activities?.slice(0, 5).map((activity: any) => (
              <div
                key={activity.id}
                className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg px-2"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Ver detalhes
                </button>
              </div>
            ))}
            {(!activities || activities.length === 0) && (
              <div className="py-8 text-center text-gray-500">
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
