'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, AlertCircle, Check } from 'lucide-react';
import { Language } from '@/types';
import { useLocationDetection } from '@/hooks/useLocationDetection';

interface DistrictAutoDetectProps {
  language: Language;
}

export default function DistrictAutoDetect({ language }: DistrictAutoDetectProps) {
  const router = useRouter();
  const { locationData, detectLocation, resetLocation } = useLocationDetection();
  const [showDetails, setShowDetails] = useState(false);

  const handleDetectClick = async () => {
    setShowDetails(true);
    await detectLocation();
  };

  const handleViewDistrict = () => {
    if (locationData.districtCode) {
      router.push(`/district/${locationData.districtCode}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {language === 'en' ? 'Find Your District' : 'अपना जिला खोजें'}
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {language === 'en'
          ? 'Automatically detect your location and view MGNREGA data for your district'
          : 'अपने स्थान का स्वचालित रूप से पता लगाएं और अपने जिले के लिए मनरेगा डेटा देखें'}
      </p>

      {!showDetails ? (
        <button
          onClick={handleDetectClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <MapPin className="w-5 h-5" />
          {language === 'en' ? 'Detect My Location' : 'मेरा स्थान पता करें'}
        </button>
      ) : (
        <div className="space-y-3">
          {locationData.loading && (
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {language === 'en' ? 'Detecting your location...' : 'आपका स्थान पता लगाया जा रहा है...'}
              </span>
            </div>
          )}

          {locationData.error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">
                  {language === 'en' ? 'Location Detection Failed' : 'स्थान पता लगाना विफल'}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {locationData.error}
                </p>
              </div>
            </div>
          )}

          {locationData.detected && locationData.district && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">
                  {language === 'en' ? 'Location Detected' : 'स्थान पता लगाया गया'}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'en' ? 'Your District:' : 'आपका जिला:'}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'en' ? locationData.district : locationData.districtHi}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Haryana, India
                </p>
              </div>

              <button
                onClick={handleViewDistrict}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {language === 'en' ? 'View District Dashboard' : 'जिला डैशबोर्ड देखें'}
                <span>→</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setShowDetails(false);
              resetLocation();
            }}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
          >
            {language === 'en' ? 'Detect Again' : 'फिर से पता लगाएं'}
          </button>
        </div>
      )}
    </div>
  );
}
