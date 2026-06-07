import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt, FaSync } from 'react-icons/fa';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for delivery staff
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const inactiveIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DeliveryPerson {
  _id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentLocation: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const LiveMap: React.FC = () => {
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Default center (can be set to city center)
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi
  
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDeliveryLocations();
      if (res.data.success) {
        setDeliveryStaff(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLocations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaMapMarkerAlt className="text-red-500" /> Live Delivery Map
          </h2>
          <p className="text-gray-500 mt-1">Track online delivery staff in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            Last updated: <span className="font-semibold text-gray-700">{lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={fetchLocations}
            className={`bg-white border shadow-sm hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold ${loading ? 'opacity-70' : ''}`}
            disabled={loading}
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
        <MapContainer 
          center={defaultCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {deliveryStaff.map((staff) => {
            // MongoDB stores coordinates as [longitude, latitude]
            // Leaflet expects [latitude, longitude]
            if (!staff.currentLocation || !staff.currentLocation.coordinates || staff.currentLocation.coordinates.length < 2) return null;
            
            const [lng, lat] = staff.currentLocation.coordinates;
            // Only plot if coordinates are somewhat valid (not 0,0 default unless actually there)
            if (lat === 0 && lng === 0) return null;

            return (
              <Marker 
                key={staff._id} 
                position={[lat, lng]} 
                icon={staff.isAvailable ? deliveryIcon : inactiveIcon}
              >
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-gray-800 text-base m-0">{staff.name}</h3>
                    <p className="text-sm text-gray-600 m-0 mt-1">📞 {staff.phone}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${staff.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {staff.isAvailable ? '🟢 Available' : '🟡 On Delivery'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-[1000] border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-2 text-sm">Legend</h4>
          <div className="flex items-center gap-2 mb-1">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" alt="Available" className="h-6" />
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png" alt="On Delivery" className="h-6" />
            <span className="text-sm text-gray-600">On Delivery / Busy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
