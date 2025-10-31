import { useState } from 'react';

interface LocationData {
  district: string | null;
  districtCode: string | null;
  districtHi: string | null;
  loading: boolean;
  error: string | null;
  detected: boolean;
}

export function useLocationDetection() {
  const [locationData, setLocationData] = useState<LocationData>({
    district: null,
    districtCode: null,
    districtHi: null,
    loading: false,
    error: null,
    detected: false,
  });

  const detectLocation = async () => {
    setLocationData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Request user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Call backend detect endpoint
      const response = await fetch(
        `http://localhost:3001/api/v1/detect-district?lat=${latitude}&lng=${longitude}`
      );
      
      if (!response.ok) throw new Error('Failed to detect district');
      
      const data = await response.json();

      if (data.detected) {
        // Location is in Haryana
        setLocationData({
          district: data.district.name,
          districtCode: data.district.district_code,
          districtHi: data.district.name_hi,
          loading: false,
          error: null,
          detected: true,
        });
      } else {
        // Location is outside Haryana
        setLocationData({
          district: null,
          districtCode: null,
          districtHi: null,
          loading: false,
          error: data.message || 'Location is outside Haryana. Please select your district manually.',
          detected: false,
        });
      }
    } catch (error: any) {
      setLocationData({
        district: null,
        districtCode: null,
        districtHi: null,
        loading: false,
        error: error.message || 'Failed to detect location. Please enable location access and try again.',
        detected: false,
      });
    }
  };

  const resetLocation = () => {
    setLocationData({
      district: null,
      districtCode: null,
      districtHi: null,
      loading: false,
      error: null,
      detected: false,
    });
  };

  return { locationData, detectLocation, resetLocation };
}
