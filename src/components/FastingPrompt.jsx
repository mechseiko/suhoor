import { useState, useEffect } from 'react';
import { Calendar, Check, X, Bell, Loader2, AlertCircle } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function FastingPrompt() {
    const { currentUser, userProfile } = useAuth();
    const [status, setStatus] = useState('idle');
    const [loading, setLoading] = useState(false);
    const [targetDate, setTargetDate] = useState('');
    const [targetDisplay, setTargetDisplay] = useState('');

    useEffect(() => {
        const determineTargetDate = async () => {
            const now = new Date();
            const hour = now.getHours();
            let target = null;

            if (hour >= 0 && hour < 5) {
                target = new Date();
            } else if (hour >= 17) {
                target = new Date();
                target.setDate(target.getDate() + 1);
            } else {
                setStatus('hidden');
                return;
            }

            const targetStr = target.toLocaleDateString('en-CA');

            // Check if already answered for this specific target date
            const alreadyAnswered = localStorage.getItem(`suhoor_intent_${targetStr}`);
            if (alreadyAnswered) {
                setStatus('hidden');
                return;
            }

            setTargetDate(targetStr);
            setTargetDisplay(target.toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            }));
        };

        determineTargetDate();
    }, []);

    const handleYes = async () => {
        setLoading(true);
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const response = await fetch(
                `https://islamicapi.com/api/v1/fasting/?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&api_key=A3A2CmTNN6m2l7pZhjCr2og3iscpW6AoFCGvOdzaiXpT3hKs`
            );
            const data = await response.json();
            const fastingInfo = data.data.fasting[0];
            const sahurTime = fastingInfo.time.sahur;

            if (Capacitor.isNativePlatform()) {
                let scheduleDate = new Date(targetDate);
                const [hours, minutes] = sahurTime.split(':').map(Number);

                // Determine Alarm Time
                if (userProfile?.customWakeUpTime) {
                    // Use User's Custom Preference
                    const [customH, customM] = userProfile.customWakeUpTime.split(':').map(Number);
                    scheduleDate.setHours(customH, customM, 0, 0);
                } else {
                    // Default: 30 minutes BEFORE Sahur ends
                    scheduleDate.setHours(hours, minutes, 0, 0);
                    scheduleDate.setMinutes(scheduleDate.getMinutes() - 30);
                }

                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Suhoor Time! 🌅",
                            body: "It's time for suhoor. May Allah accept your fast.",
                            id: 1001,
                            schedule: { at: scheduleDate },
                            sound: 'alarm.wav',
                            extra: { type: 'suhoor_alarm' }
                        }
                    ]
                });
            }

            const statusRef = doc(db, 'daily_fasting_status', `${currentUser.uid}_${targetDate}`);
            await setDoc(statusRef, {
                userId: currentUser.uid,
                date: targetDate,
                wantsToFast: true,
                updatedAt: serverTimestamp()
            });

            localStorage.setItem(`suhoor_intent_${targetDate}`, 'yes');
            setStatus('success');

            setTimeout(() => setStatus('hidden'), 3000);

        } catch (error) {
            console.error("Error scheduling suhoor:", error);
            alert("Could not schedule alarm. Please check permissions.");
        } finally {
            setLoading(false);
        }
    };

    const handleNo = async () => {
        try {
            const statusRef = doc(db, 'daily_fasting_status', `${currentUser.uid}_${targetDate}`);
            await setDoc(statusRef, {
                userId: currentUser.uid,
                date: targetDate,
                wantsToFast: false,
                updatedAt: serverTimestamp()
            });
            localStorage.setItem(`suhoor_intent_${targetDate}`, 'no');
            setStatus('hidden');
        } catch (error) {
            console.error("Error dismissing fasting:", error);
            setStatus('hidden');
        }
    };

    if (status === 'hidden') return null;

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-primary/90 rounded-xl p-4 text-white shadow-sm border-1 border-blue-600 shadow-blue-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>

                <div className="relative z-10">
                    {status === 'idle' && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    {(() => {
                                        const dateObj = new Date(targetDate + 'T00:00:00');
                                        const dayOfWeek = dateObj.getDay();
                                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                                        const todayStr = new Date().toLocaleDateString('en-CA');
                                        const isToday = targetDate === todayStr;
                                        const timeLabel = isToday ? "today" : "tomorrow";
                                        const TitleLabel = isToday ? "Today" : "Tomorrow";

                                        const isSunnahDay = dayOfWeek === 1 || dayOfWeek === 4;

                                        return (
                                            <>
                                                <p className="text-blue-100 text-lg">
                                                    Are you planning to fast {timeLabel}, <span className="font-semibold">{targetDisplay}</span>?
                                                </p>

                                                {isSunnahDay && (
                                                    <div className="mt-3 bg-green-500/20 border border-green-300/30 rounded-lg p-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
                                                        <div className="flex items-start gap-2">
                                                            <div>
                                                                <p className="text-sm font-bold text-green-100">
                                                                    {TitleLabel} is {dayName}, a blessed Sunnah day!
                                                                </p>
                                                                <p className="text-xs text-green-200 mt-1">
                                                                    The Prophet ﷺ used to fast on Mondays and Thursdays
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setStatus('confirming_no')}
                                    className="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all border border-white/20 cursor-pointer"
                                >
                                    No
                                </button>
                                <button
                                    onClick={() => setStatus('confirming_yes')}
                                    className="flex-1 md:flex-none px-4 py-2.5 bg-white text-primary rounded-lg font-bold transition-all shadow-lg cursor-pointer"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'confirming_yes' && (
                        <div className="flex flex-col items-center text-center py-2 space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="p-3 bg-yellow-400/20 rounded-full">
                                <AlertCircle className="h-8 w-8 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Confirm Fasting Intention?</h3>
                                <p className="text-blue-100 text-sm max-w-sm">
                                    We'll schedule an alarm for {targetDate} and your group members will be aware.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full max-w-xs">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="flex-1 px-4 py-2.5 bg-white/10 rounded-xl font-bold border border-white/20 cursor-pointer"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleYes}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-white text-primary rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    {loading ? 'Confirming...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'confirming_no' && (
                        <div className="flex flex-col items-center text-center py-2 space-y-4 animate-in zoom-in-95 duration-200">
                            <div>
                                <h3 className="text-lg font-bold">Dismiss for today?</h3>
                                <p className="text-blue-100 text-sm">Your group members will not wake you for suhoor.</p>
                            </div>
                            <div className="flex gap-3 w-full max-w-xs">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="flex-1 px-4 py-2.5 bg-white/10 rounded-xl font-bold border border-white/20 cursor-pointer"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleNo}
                                    className="flex-1 px-4 py-2.5 bg-red-400 text-white rounded-xl font-bold shadow-lg cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center text-center py-4 animate-in bounce-in duration-500">
                            <div className="h-16 w-16 bg-white text-primary rounded-full flex items-center justify-center mb-4 shadow-xl">
                                <Bell className="h-8 w-8 animate-bounce" />
                            </div>
                            <h3 className="text-2xl font-black">Alhamdulillah!</h3>
                            <p className="text-blue-50 text-sm">Alarms scheduled. We'll wake you for suhoor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
