import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { MapPin, Navigation, Search } from 'lucide-react';
import Map from './map';

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationChange,
  initialLat = 28.6139,
  initialLng = 77.2090,
  className = ''
}) => {
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          onLocationChange(lat, lng);
          reverseGeocode(lat, lng);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Search for address
  const searchAddress = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLatitude(lat);
        setLongitude(lng);
        onLocationChange(lat, lng, data[0].display_name);
        setAddress(data[0].display_name);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    onLocationChange(lat, lng);
    reverseGeocode(lat, lng);
  };

  // Handle manual coordinate input
  const handleCoordinateChange = () => {
    onLocationChange(latitude, longitude);
    reverseGeocode(latitude, longitude);
  };

  useEffect(() => {
    if (initialLat !== 28.6139 || initialLng !== 77.2090) {
      reverseGeocode(initialLat, initialLng);
    }
  }, [initialLat, initialLng]);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Location
          </CardTitle>
          <CardDescription>
            Click on the map, search for an address, or enter coordinates manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Search */}
          <div className="space-y-2">
            <Label htmlFor="address">Search Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder="Enter address or landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
              />
              <Button 
                onClick={searchAddress} 
                disabled={isLoading}
                variant="outline"
                size="icon"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Location Button */}
          <Button 
            onClick={getCurrentLocation} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLoading ? 'Getting Location...' : 'Use Current Location'}
          </Button>

          {/* Manual Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                onBlur={handleCoordinateChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                onBlur={handleCoordinateChange}
              />
            </div>
          </div>

          {/* Map */}
          <div className="space-y-2">
            <Label>Interactive Map</Label>
            <Map
              center={[latitude, longitude]}
              zoom={15}
              height="300px"
              markers={[
                {
                  position: [latitude, longitude],
                  popup: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                  title: 'Property Location'
                }
              ]}
              onLocationSelect={handleMapClick}
            />
          </div>

          {/* Selected Location Info */}
          {address && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-muted-foreground">{address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPicker;