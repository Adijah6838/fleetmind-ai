import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import LiveMap from './pages/LiveMap';
import Vehicles from './pages/Vehicles';
import Deliveries from './pages/Deliveries';
import Analytics from './pages/Analytics';

function Navbar() {
  const location = useLocation();
  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex gap-6 text-white fixed top-0 w-full z-[1000]">
      <Link to="/" className="font-bold text-blue-400">FLEETMIND AI</Link>
      <Link to="/" className={`hover:text-blue-400 ${location.pathname === '/' ? 'text-blue-400' : 'text-slate-300'}`}>Home</Link>
      <Link to="/vehicles" className={`hover:text-blue-400 ${location.pathname === '/vehicles' ? 'text-blue-400' : 'text-slate-300'}`}>Fleet</Link>
      <Link to="/deliveries" className={`hover:text-blue-400 ${location.pathname === '/deliveries' ? 'text-blue-400' : 'text-slate-300'}`}>Deliveries</Link>
      <Link to="/map" className={`hover:text-blue-400 ${location.pathname === '/map' ? 'text-blue-400' : 'text-slate-300'}`}>Live Map</Link>
      <Link to="/analytics" className={`hover:text-blue-400 ${location.pathname === '/analytics' ? 'text-blue-400' : 'text-slate-300'}`}>Analytics</Link>
    </nav>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-blue-400 mb-4">FLEETMIND AI</h1>
        <p className="text-slate-400 mb-8 text-lg">Intelligent Fleet Management, Route Optimization & Logistics Simulation</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link to="/vehicles" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold mb-2">🚚 Fleet</h2>
            <p className="text-slate-400 text-sm">Manage vehicles</p>
          </Link>
          <Link to="/deliveries" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold mb-2">📦 Deliveries</h2>
            <p className="text-slate-400 text-sm">Track orders</p>
          </Link>
          <Link to="/map" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold mb-2">🗺️ Live Map</h2>
            <p className="text-slate-400 text-sm">Visualize fleet</p>
          </Link>
          <Link to="/analytics" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold mb-2">📊 Analytics</h2>
            <p className="text-slate-400 text-sm">View insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
