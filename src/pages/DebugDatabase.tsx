import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DebugDatabase() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/debug/db')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Database Viewer</h1>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!data && !error && <div className="text-gray-500">Loading database contents...</div>}

      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-2 text-mzansi-blue">Users Table</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto p-4">
              <pre className="text-xs text-gray-800 font-mono">
                {JSON.stringify(data.users, null, 2)}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-mzansi-green">Driver Profiles Table</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto p-4">
              <pre className="text-xs text-gray-800 font-mono">
                {JSON.stringify(data.driver_profiles, null, 2)}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2 text-mzansi-yellow">Routes Table</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto p-4">
              <pre className="text-xs text-gray-800 font-mono">
                {JSON.stringify(data.routes, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
