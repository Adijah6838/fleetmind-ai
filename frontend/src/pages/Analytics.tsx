import { useEffect, useState } from 'react';
import { api } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
  const [overview, setOverview] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, usRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/fleet-usage')
        ]);
        setOverview(ovRes.data);
        setUsage(usRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !overview) return <div className="p-8 text-white">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Operational Analytics</h1>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Total Fleet Size</h3>
            <p className="text-3xl font-bold">{overview.total_vehicles}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Total Deliveries</h3>
            <p className="text-3xl font-bold">{overview.total_deliveries}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-400">{overview.pending_deliveries}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Total Cargo Weight</h3>
            <p className="text-3xl font-bold text-blue-400">{overview.total_weight_kg} <span className="text-lg">kg</span></p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-6">Deliveries per Vehicle</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} cursor={{fill: '#334155'}} />
                  <Bar dataKey="deliveries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center items-center">
             <h3 className="text-lg font-semibold mb-6 self-start">Fleet Efficiency</h3>
             <div className="relative w-48 h-48 rounded-full border-8 border-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin-slow"></div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-400">
                    {overview.total_deliveries > 0 ? Math.round((overview.delivered_deliveries / overview.total_deliveries) * 100) : 0}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Completion Rate</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
