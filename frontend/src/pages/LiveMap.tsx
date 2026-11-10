import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api';

// Pure CSS icons (no external images, no CORS issues)
const truckIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const packageIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function LiveMap() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/deliveries')
      ]);
      setVehicles(vRes.data);
      setDeliveries(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-white">Loading map data...</div>;

  return (
    <div className="h-screen w-full pt-14">
      <MapContainer center={[40.73, -73.99]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {vehicles.map(v => (
          <Marker key={`v-${v.id}`} position={[v.lat, v.lng]} icon={truckIcon}>
            <Popup>
              <div className="text-slate-800">
                <strong>Vehicle: {v.registration}</strong><br/>
                Type: {v.v_type}<br/>
                Status: {v.status}
              </div>
            </Popup>
          </Marker>
        ))}

        {deliveries.map(d => (
          <Marker key={`d-${d.id}`} position={[d.dest_lat, d.dest_lng]} icon={packageIcon}>
            <Popup>
              <div className="text-slate-800">
                <strong>Delivery: {d.customer}</strong><br/>
                Priority: {d.priority}<br/>
                Status: {d.status}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
