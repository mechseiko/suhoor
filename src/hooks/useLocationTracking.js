import { useState, useEffect, useRef } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export function useLocationTracking(groupId, userId, shouldTrack) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const watchId = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const startTracking = async () => {
            // 1. Request Permission
            try {
                if (Capacitor.isNativePlatform()) {
                    const permission = await Geolocation.checkPermissions();
                    if (permission.location !== 'granted') {
                        await Geolocation.requestPermissions();
                    }
                }
            } catch (err) {
                console.warn("Error checking permissions", err);
                // Continues safely, browser might handle it
            }

            // 2. Start Watch
            try {
                // Clear existing watch if any
                if (watchId.current) {
                    Geolocation.clearWatch({ id: watchId.current });
                }

                watchId.current = await Geolocation.watchPosition(
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 3000
                    },
                    (position, err) => {
                        if (err) {
                            console.error("Location watch error:", err);
                            if (isMounted) setError(err);
                            return;
                        }

                        if (position) {
                            const { latitude, longitude } = position.coords;

                            if (isMounted) {
                                setLocation({ lat: latitude, lng: longitude });
                                setError(null);
                            }

                            // 3. Upload to Firestore
                            if (groupId && userId) {
                                const locationRef = doc(db, 'groups', groupId, 'locations', userId);
                                setDoc(locationRef, {
                                    lat: latitude,
                                    lng: longitude,
                                    timestamp: serverTimestamp(),
                                    device_timestamp: Date.now(),
                                    accuracy: position.coords.accuracy,
                                    is_online: true
                                }, { merge: true }).catch(e => console.error("Firestore loc update failed", e));
                            }
                        }
                    }
                );

            } catch (err) {
                console.error("Failed to start watching position", err);
                if (isMounted) setError(err);
            }
        };

        const stopTracking = async () => {
            if (watchId.current) {
                await Geolocation.clearWatch({ id: watchId.current });
                watchId.current = null;
            }
        };

        if (shouldTrack) {
            startTracking();
        } else {
            stopTracking();
        }

        return () => {
            isMounted = false;
            stopTracking();
        };
    }, [groupId, userId, shouldTrack]);

    return { location, error };
}
