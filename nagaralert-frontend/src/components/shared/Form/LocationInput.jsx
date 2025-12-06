import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useController } from 'react-hook-form';
import { MapPin, Crosshair, Loader2, AlertCircle, Globe } from 'lucide-react';

// ============ LOCATION INPUT COMPONENT ============
export const LocationInput = ({
  control,
  name = 'location',
  label = 'Location',
  placeholder = 'Click to get your current location',
  required = false,
  showMapPreview = true,
  animationDelay = 0,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null
  });

  // Controller for react-hook-form
  const { field, fieldState: { error: formError } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false
    }
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update coordinates state
        setCoordinates({ latitude, longitude });
        
        // Update form field value
        field.onChange({
          latitude,
          longitude,
          address
        });

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data.display_name) {
            const formattedAddress = data.display_name;
            setAddress(formattedAddress);
            
            // Update form field with address
            field.onChange({
              latitude,
              longitude,
              address: formattedAddress
            });
          }
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          setAddress(`Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to retrieve your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please try again or enter manually.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Manual coordinate input handlers
  const handleLatitudeChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const newCoords = {
        ...coordinates,
        latitude: value,
        address: address || ''
      };
      setCoordinates(newCoords);
      field.onChange(newCoords);
    }
  };

  const handleLongitudeChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const newCoords = {
        ...coordinates,
        longitude: value,
        address: address || ''
      };
      setCoordinates(newCoords);
      field.onChange(newCoords);
    }
  };

  // Clear location
  const clearLocation = () => {
    setCoordinates({ latitude: null, longitude: null });
    setAddress('');
    field.onChange(null);
    setError('');
  };

  // Format coordinate display
  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return '';
    return coord.toFixed(6);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay * 0.1 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="text-gray-400 ml-1 font-normal">(Optional)</span>
        </label>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className={`
              flex items-center px-3 py-1.5 text-xs font-medium rounded-lg
              transition-all duration-200
              ${isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800'
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            ) : (
              <Crosshair className="w-3 h-3 mr-1.5" />
            )}
            {isLoading ? 'Getting Location...' : 'Get Current Location'}
          </button>
          
          {(coordinates.latitude || coordinates.longitude) && (
            <button
              type="button"
              onClick={clearLocation}
              className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 
                       bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Location Display */}
      {(coordinates.latitude || coordinates.longitude) ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Coordinates Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formatCoordinate(coordinates.latitude)}
                onChange={handleLatitudeChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                         outline-none transition-all pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">°N</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formatCoordinate(coordinates.longitude)}
                onChange={handleLongitudeChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                         outline-none transition-all pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">°E</span>
              </div>
            </div>
          </div>

          {/* Address Display */}
          {address && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Detected Address:</p>
                  <p className="text-sm text-gray-800">{address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Map Preview (Optional) */}
          {showMapPreview && coordinates.latitude && coordinates.longitude && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-3 border-b border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  Location Preview
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center h-40 bg-gradient-to-br from-blue-50 to-green-50 rounded border border-gray-200">
                  <div className="text-center">
                    <div className="mb-2">
                      <MapPin className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {coordinates.latitude.toFixed(6)}°N, {coordinates.longitude.toFixed(6)}°E
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your location will be used for better service accuracy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Initial State - No Location */
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative"
        >
          <div
            onClick={getCurrentLocation}
            className="cursor-pointer border-2 border-dashed border-gray-300 
                     hover:border-primary-400 rounded-xl p-8 text-center 
                     transition-all duration-200 hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary-50 to-blue-50">
                <Crosshair className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Add Your Location
                </p>
                <p className="text-xs text-gray-500 max-w-md">
                  Click to automatically detect your location. This helps us provide 
                  accurate local services and faster issue resolution.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Messages */}
      {(error || formError) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-start text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error || formError?.message}</span>
        </motion.div>
      )}

      {/* Privacy Note */}
      <p className="mt-3 text-xs text-gray-500">
        🔒 Your location data is stored securely and only used to provide relevant 
        municipal services. You can update or remove it anytime from settings.
      </p>

      {/* Debug Information (Remove in production) */}
      {process.env.NODE_ENV === 'development' && field.value && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Form Field Value:</strong> {JSON.stringify(field.value)}
        </div>
      )}
    </motion.div>
  );
};

export default LocationInput;