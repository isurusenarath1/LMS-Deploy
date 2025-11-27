import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Loader } from 'lucide-react';

export function DevLoginPanel() {
  const { quickLogin, loading, getDevUsers } = useAuth();
  const [devUsers, setDevUsers] = useState<any[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (showPanel) {
      loadDevUsers();
    }
  }, [showPanel]);

  const loadDevUsers = async () => {
    const result = await getDevUsers();
    if (result?.users) {
      setDevUsers(result.users);
    }
  };

  const handleQuickLogin = async (email: string) => {
    const success = await quickLogin(email);
    if (success) {
      setShowPanel(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showPanel && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-64">
          <h3 className="font-bold text-sm mb-3 text-slate-900 dark:text-white">
            Dev Quick Login
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {devUsers.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No dev users available
              </p>
            ) : (
              devUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleQuickLogin(user.email)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 disabled:opacity-50 rounded border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100 font-medium transition-colors"
                >
                  {loading ? (
                    <Loader className="w-3 h-3 inline animate-spin mr-1" />
                  ) : null}
                  {user.name}
                  <span className="text-xs opacity-75 block">{user.role}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setShowPanel(!showPanel)}
        title="Dev Mode"
        className="bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Zap className="w-5 h-5" />
      </button>
    </div>
  );
}
