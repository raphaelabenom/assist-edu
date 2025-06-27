import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Login from "@/pages/login";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {isAuthenticated ? (
        <Route path="/" component={Home} />
      ) : (
        <Route>
          <Login />
        </Route>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        {/* Debug component for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
            <h3 className="font-bold mb-2">Auth Debug</h3>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            >
              Clear Token & Reload
            </button>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
