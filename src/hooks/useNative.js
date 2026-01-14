import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export function useNative() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const isCapacitor = Capacitor.isNativePlatform();
    const isIOSPWA = window.navigator.standalone === true;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    setIsNative(isCapacitor || isIOSPWA || isStandalone);
  }, []);

  return isNative;
}
