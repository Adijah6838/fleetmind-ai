import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [customer, setCustomer] = useState('');
  const [weight, setWeight] = useState(100);
  const [priority, setPriority] = useState('Normal');

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', {
        customer, pickup_lat: 40.71, pickup_lng: -74.00,
        dest_lat: 40.75 + (Math.random() * 0.1), dest_lng: -73.98 + (Math.random() * 0.1),
        weight: Number(weight), priority
      });
      setCustomer('');
      fetchDeliveries();
    } catch (err: any) { alert(err.response?.data?.detail || 'Error'); }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setResult(null);
    try {
      const res = await api.post('/optimize/run');
      setResult(res.data);
      fetchDeliveries();
    } catch (err: any) { alert(err.response?.data?.detail || 'Optimization failed'); } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Delivery Orders</h1>
          <button 
            onClick={handleOptimize} 
            disabled={optimizing}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold shadow-lg shadow-purple-900/50 disabled:opacity-50"
          >
            {optimizing ? 'Running C++ Engine...' : '⚡ Run Fleet Optimization'}
          </button>
        </div>

        {result && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-lg mb-8">
            <p className="font-bold">{result.message}</p>
            <p className="text-sm mt-1">Unassigned: {result.unassigned_deliveries}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-4">Create Order</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Customer Name</label>
                <input required value={customer} onChange={e => setCustomer(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Weight (kg)</label>
                <input type="number" required value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded">
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-medium">Create Delivery</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Customer</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Weight</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Priority</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : 
                 deliveries.map(d => (
                  <tr key={d.id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 font-medium">{d.customer}</td>
                    <td className="px-6 py-4 text-slate-400">{d.weight} kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        d.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                        d.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>{d.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        d.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>{d.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{d.assigned_vehicle_id ? `#${d.assigned_vehicle_id}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
