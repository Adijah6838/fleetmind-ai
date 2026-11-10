import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reg, setReg] = useState('');
  const [vType, setVType] = useState('Van');
  const [maxLoad, setMaxLoad] = useState(500);
  const [fuel, setFuel] = useState('Petrol');
  const [cost, setCost] = useState(1.0);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        registration: reg, v_type: vType, max_load: Number(maxLoad),
        fuel_type: fuel, cost_per_km: Number(cost), lat: 40.71, lng: -74.00
      });
      setReg('');
      fetchVehicles();
    } catch (err: any) { alert(err.response?.data?.detail || 'Error'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Fleet Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-4">Add Vehicle</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Registration</label>
                <input required value={reg} onChange={e => setReg(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded" placeholder="ABC-123" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Type</label>
                <select value={vType} onChange={e => setVType(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded">
                  <option>Van</option>
                  <option>Box Truck</option>
                  <option>18-Wheeler</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Max Load (kg)</label>
                <input type="number" required value={maxLoad} onChange={e => setMaxLoad(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-medium">Add Vehicle</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Reg</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Capacity</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : 
                 vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 font-medium">{v.registration}</td>
                    <td className="px-6 py-4 text-slate-400">{v.v_type}</td>
                    <td className="px-6 py-4 text-slate-400">{v.max_load} kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        v.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{v.status}</span>
                    </td>
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
