import { getTokenInfo } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

export default function DebugAuth() {
  const { isAuthenticated, user } = useAuth();
  const tokenInfo = getTokenInfo();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.username : 'None'}</div>
        <div>Token exists: {tokenInfo.token ? 'Yes' : 'No'}</div>
        <div>Token expired: {tokenInfo.isExpired ? 'Yes' : 'No'}</div>
        {tokenInfo.payload && (
          <div>
            <div>User ID: {tokenInfo.payload.userId}</div>
            <div>Expires: {new Date(tokenInfo.payload.exp * 1000).toLocaleString()}</div>
          </div>
        )}
      </div>
      <button 
        onClick={() => {
          localStorage.removeItem('auth_token');
          window.location.reload();
        }}
        className="mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
      >
        Clear Token & Reload
      </button>
    </div>
  );
}
