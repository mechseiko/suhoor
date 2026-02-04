import { useState, useEffect } from 'react';
import { Calendar, Check, X, Bell, Loader2, AlertCircle, Moon, Sun } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { db } from '../config/firebase';
import { collection, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getHijriDate, isMondayOrThursday, isWhiteDay, isRamadan, getTargetFastingDate, getDefaultIntention } from '../utils/fastingUtils';

export default function FastingPrompt() {
    const { currentUser, userProfile } = useAuth();
    const [status, setStatus] = useState('idle');
    const [loading, setLoading] = useState(false);
    const [targetDate, setTargetDate] = useState('');
    const [targetDisplay, setTargetDisplay] = useState('');
    const [defaultAnswer, setDefaultAnswer] = useState(false);

    useEffect(() => {
        const determineTarget = async () => {
            const target = getTargetFastingDate();

            if (!target) {
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

            // Also check Firestore to be sure (server of truth)
            try {
                const statusRef = doc(db, 'daily_fasting_status', `${currentUser.uid}_${targetStr}`);
                const statusSnap = await getDoc(statusRef);
                if (statusSnap.exists()) {
                    localStorage.setItem(`suhoor_intent_${targetStr}`, statusSnap.data().wantsToFast ? 'yes' : 'no');
                    setStatus('hidden');
                    return;
                }
            } catch (err) {
                console.error("Error checking fasting status from DB:", err);
            }

            setTargetDate(targetStr);
            setTargetDisplay(target.toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            }));

            // Calculate default answer based on settings and date
            setDefaultAnswer(getDefaultIntention(target, userProfile));
        };

        if (currentUser) {
            determineTarget();
        }
    }, [currentUser, userProfile]);

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
                let scheduleDate = new Date(targetDate + 'T00:00:00');
                const [hours, minutes] = sahurTime.split(':').map(Number);

                // Determine Alarm Time
                if (userProfile?.customWakeUpTime) {
                    const [customH, customM] = userProfile.customWakeUpTime.split(':').map(Number);
                    scheduleDate.setHours(customH, customM, 0, 0);
                } else {
                    scheduleDate.setHours(hours, minutes, 0, 0);
                    scheduleDate.setMinutes(scheduleDate.getMinutes() - 30);
                }

                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Suhoor Time! 🌅",
                            body: "It's time to wake up for sahoor. May Allah accept your fast.",
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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    if (status === 'hidden' || !targetDate) return null;

    const dateObj = new Date(targetDate + 'T00:00:00');
    const isSpecial = isMondayOrThursday(dateObj) || isWhiteDay(dateObj) || isRamadan(dateObj);
    const hijri = getHijriDate(dateObj);

    return (
        <div className="mb-0 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-primary/95 rounded-2xl p-6 text-white shadow-xl border-1 border-white/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                <div className="relative z-10">
                    {status === 'idle' && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <img className="md:size-12 size-10 rounded-lg"  src="/logo.png" />
                                <div className="flex-1">
                                    <h3 className="text-xl font-black tracking-tight">Suhoor for Tomorrow?</h3>
                                    <p className="text-blue-100/80 text-sm mt-1">
                                        Are you planning to fast tomorrow, <span className="text-white font-bold">{targetDisplay}</span>?
                                    </p>

                                    {isSpecial && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            {isMondayOrThursday(dateObj) && (
                                                <span className="w-fit px-3 py-1 bg-green-400/20 text-green-200 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-400/30">
                                                    Sunnah Fast
                                                </span>
                                            )}
                                            {isWhiteDay(dateObj) && (
                                                <span className="w-fit px-3 py-1 bg-blue-400/20 text-blue-100 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-400/30">
                                                    White Day - {hijri.day}th
                                                </span>
                                            )}
                                            {isRamadan(dateObj) && (
                                                <span className="w-fit px-3 py-1 bg-yellow-400/20 text-yellow-100 text-[10px] font-bold uppercase tracking-wider rounded-full border border-yellow-400/30">
                                                    Ramadan day {hijri.day}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setStatus('confirming_no')}
                                    className={`flex-1 flex items-center justify-center gap-2 md:px-6 md:py-3 px-4 py-2 rounded-xl font-black transition-all border-2 border-white/10 cursor-pointer ${!defaultAnswer ? 'bg-white text-primary' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    <X className="h-5 w-5" />
                                    No
                                </button>
                                <button
                                    onClick={() => setStatus('confirming_yes')}
                                    className={`flex-1 flex items-center justify-center gap-2 md:px-6 md:py-3 px-4 py-2 rounded-xl font-black transition-all border-2 cursor-pointer ${defaultAnswer ? 'bg-white text-primary border-white' : 'bg-primary border-white/20 hover:bg-white/5'}`}
                                >
                                    <Check className="h-5 w-5" />
                                    Yes
                                </button>
                            </div>

                            <p className="text-center text-[10px] text-blue-200/50 uppercase font-bold tracking-widest">
                                This defaults to <span className='text-green-500'>{defaultAnswer ? 'YES' : 'NO'}</span> based on your settings
                            </p>
                        </div>
                    )}

                    {status === 'confirming_yes' && (
                        <div className="flex flex-col items-center text-center py-4 space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="p-4 bg-yellow-400/20 rounded-3xl border border-yellow-400/30">
                                <Bell className="h-8 w-8 text-yellow-300 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic">Confirm Intention</h3>
                                <p className="text-blue-100 text-sm mt-2 max-w-xs leading-relaxed">
                                    We'll schedule your alarm and your group will be notified to wake you.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="flex-1 px-6 py-4 bg-white/10 rounded-lg font-black uppercase text-xs tracking-widest border border-white/10 cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleYes}
                                    disabled={loading}
                                    className="flex-1 px-6 py-4 bg-white text-primary rounded-lg font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Confirm
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'confirming_no' && (
                        <div className="flex flex-col items-center text-center py-4 space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="p-4 bg-red-400/20 rounded-3xl border border-red-400/30">
                                <AlertCircle className="h-8 w-8 text-red-300" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic">Skip Suhoor?</h3>
                                <p className="text-blue-100 text-sm mt-2 max-w-xs leading-relaxed">
                                    Your team will be aware and won't be able to wake you for suhoor.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="flex-1 px-6 py-4 bg-white/10 rounded-lg font-black uppercase text-xs tracking-widest border border-white/10 cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNo}
                                    disabled={loading}
                                    className="flex-1 px-6 py-4 bg-red-500/80 text-white rounded-lg font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                    Skip Suhoor
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center text-center py-8 animate-in bounce-in duration-500">
                            <div className="h-20 w-20 bg-white text-primary rounded-full flex items-center justify-center mb-6 shadow-2xl">
                                <Sun className="h-10 w-10 animate-spin-slow" />
                            </div>
                            <h3 className="text-3xl font-black">Success!</h3>
                            <p className="text-blue-100 font-medium mt-2">Intent recorded. We'll wake you for suhoor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
