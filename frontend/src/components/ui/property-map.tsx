import React from 'react';
import Map from './map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from './button';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  propertyId?: string;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  address,
  propertyId,
  className = ''
}) => {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const openInOpenStreetMap = () => {
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16`;
    window.open(url, '_blank');
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Location
          </CardTitle>
          <CardDescription>
            Interactive map showing the exact property location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map */}
          <Map
            center={[latitude, longitude]}
            zoom={16}
            height="400px"
            markers={[
              {
                position: [latitude, longitude],
                popup: `
                  <div style="text-align: center; padding: 8px;">
                    <strong>Property ${propertyId ? `#${propertyId}` : ''}</strong><br/>
                    ${address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
                  </div>
                `,
                title: `Property ${propertyId ? `#${propertyId}` : 'Location'}`
              }
            ]}
          />

          {/* Location Info */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Coordinates</h4>
              <p className="font-mono text-sm">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>

            {address && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
                <p className="text-sm">{address}</p>
              </div>
            )}

            {/* External Map Links */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openInGoogleMaps}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                Google Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openInOpenStreetMap}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                OpenStreetMap
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyMap;