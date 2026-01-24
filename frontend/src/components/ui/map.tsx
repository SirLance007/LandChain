import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    title?: string;
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center = [28.6139, 77.2090], // Default to New Delhi
  zoom = 10,
  height = '400px',
  markers = [],
  onLocationSelect,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler for location selection
    if (onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
        
        // Clear existing markers if selecting location
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];
        
        // Add new marker
        const marker = L.marker([lat, lng]).addTo(map);
        markersRef.current.push(marker);
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onLocationSelect]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstanceRef.current!.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    markers.forEach(({ position, popup, title }) => {
      const marker = L.marker(position).addTo(mapInstanceRef.current!);
      
      if (title) {
        marker.bindTooltip(title);
      }
      
      if (popup) {
        marker.bindPopup(popup);
      }
      
      markersRef.current.push(marker);
    });
  }, [markers]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className={`rounded-lg border ${className}`}
    />
  );
};

export default Map;