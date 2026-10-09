"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  RefreshCw,
  Navigation,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDistanceMeters, formatDistance } from "@/lib/pwa/haversine";
import {
  savePendingAttendance,
  getPendingAttendances,
  removePendingAttendances,
  type PendingAttendance,
} from "@/lib/pwa/db";
import {
  syncOfflineAttendances,
  processOnlineCheckIn,
  processOnlineCheckOut,
} from "@/app/guru/absen/actions";

interface AttendanceClientProps {
  teacherId: string;
  branchId: string;
  branchName: string;
  branchLat: number | null;
  branchLng: number | null;
  radiusMeters: number;
  initialAttendanceId: string | null;
  initialIsCheckedIn: boolean;
  initialIsCheckedOut: boolean;
}

export function AttendanceClient({
  teacherId,
  branchId,
  branchName,
  branchLat,
  branchLng,
  radiusMeters,
  initialAttendanceId,
  initialIsCheckedIn,
  initialIsCheckedOut,
}: AttendanceClientProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") return navigator.onLine;
    return true;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Real-time distance tracking states
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied" | "unsupported">("locating");

  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [attendanceId, setAttendanceId] = useState<string | null>(initialAttendanceId);

  const watchIdRef = useRef<number | null>(null);

  const attemptSync = useCallback(async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      const records = await getPendingAttendances();
      if (records.length === 0) return;

      const result = await syncOfflineAttendances(records);

      if (result.success.length > 0) {
        await removePendingAttendances(result.success);
      }

      const remaining = await getPendingAttendances();
      setQueueCount(remaining.length);
    } catch {
      // Sync failed, stay in queue
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const checkQueue = useCallback(async () => {
    const records = await getPendingAttendances();
    setQueueCount(records.length);
    if (typeof window !== "undefined" && navigator.onLine && records.length > 0) {
      await attemptSync();
    }
  }, [attemptSync]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void attemptSync();
    };

    const handleOffline = () => setIsOnline(false);

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkQueue();

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [attemptSync, checkQueue]);

  // Realtime GPS Watcher Function
  const startWatchingLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unsupported");
      return;
    }

    setGpsStatus("locating");
    setLocationError(null);

    // Clear previous watcher if exists
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setCurrentCoords({ lat: latitude, lng: longitude });
      setGpsStatus("active");

      if (branchLat !== null && branchLng !== null) {
        const dist = calculateDistanceMeters(latitude, longitude, branchLat, branchLng);
        setCurrentDistance(dist);
      }
    };

    const errorHandler = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus("denied");
      } else {
        // Timeout or Position Unavailable
        setGpsStatus("locating");
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    });
  }, [branchLat, branchLng]);

  // Start watching on mount, cleanup on unmount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startWatchingLocation();

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startWatchingLocation]);

  // Manual request permission trigger for re-request button
  function handleRetryPermission() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setGpsStatus("active");
        if (branchLat !== null && branchLng !== null) {
          const dist = calculateDistanceMeters(latitude, longitude, branchLat, branchLng);
          setCurrentDistance(dist);
        }
        startWatchingLocation();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus("denied");
          setLocationError(
            "Izin GPS diblokir oleh browser. Buka setelan izin situs (ikon gembok di sebelah URL browser) dan ubah Lokasi menjadi 'Izinkan'."
          );
        } else {
          setLocationError("Sinyal GPS belum stabil. Coba keluar ruangan atau tunggu sebentar.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  async function queueAttendanceOffline(type: "check_in" | "check_out", lat: number, lng: number, timestamp: string) {
    const record: PendingAttendance = {
      id: crypto.randomUUID(),
      teacher_id: teacherId,
      branch_id: branchId,
      type,
      lat,
      lng,
      timestamp,
    };

    await savePendingAttendance(record);
    void checkQueue();

    if (type === "check_in") {
      setIsCheckedIn(true);
    } else {
      setIsCheckedOut(true);
    }
  }

  async function handleAttendance(type: "check_in" | "check_out") {
    if (!branchLat || !branchLng) {
      setLocationError("Koordinat cabang belum disetel oleh Admin.");
      return;
    }

    setIsLoadingGPS(true);
    setLocationError(null);

    // If we already have fresh coords from watchPosition and within distance
    const executeWithCoords = async (latitude: number, longitude: number) => {
      const distance = calculateDistanceMeters(latitude, longitude, branchLat, branchLng);

      if (distance > radiusMeters) {
        const userDist = formatDistance(distance);
        const maxDist = formatDistance(radiusMeters);
        setLocationError(`Anda berada di luar radius area cabang. Jarak Anda: ${userDist} (Batas maksimal: ${maxDist})`);
        setIsLoadingGPS(false);
        return;
      }

      const timestamp = new Date().toISOString();

      if (isOnline) {
        try {
          if (type === "check_in") {
            const res = await processOnlineCheckIn(branchId, latitude, longitude, timestamp);
            if (res.success && res.data) {
              setIsCheckedIn(true);
              setAttendanceId(res.data.id);
            } else {
              throw new Error(res.error || "Gagal absen online");
            }
          } else {
            if (!attendanceId) {
              throw new Error("Menunggu sinkronisasi Check-in sebelum bisa Check-out online.");
            }
            const res = await processOnlineCheckOut(attendanceId, latitude, longitude, timestamp);
            if (res.success) {
              setIsCheckedOut(true);
            } else {
              throw new Error(res.error || "Gagal absen online");
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error) setLocationError(err.message);
          await queueAttendanceOffline(type, latitude, longitude, timestamp);
        }
      } else {
        await queueAttendanceOffline(type, latitude, longitude, timestamp);
      }

      setIsLoadingGPS(false);
    };

    // If active coords already cached and recent
    if (currentCoords) {
      await executeWithCoords(currentCoords.lat, currentCoords.lng);
      return;
    }

    // Fallback: one-shot getCurrentPosition
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("GPS tidak didukung di perangkat ini.");
      setIsLoadingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await executeWithCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocationError("Gagal mendapatkan lokasi GPS. Pastikan GPS aktif dan izin diberikan.");
        setIsLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Derive distance status
  const isInsideRadius = currentDistance !== null && currentDistance <= radiusMeters;

  return (
    <div className="space-y-6">
      {/* Online / Offline Status Bar */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isOnline ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isOnline ? "Mode Online" : "Mode Offline"}
            </p>
            <p className="text-xs text-slate-500">
              {isOnline ? "Sistem terhubung" : "Sinyal terputus"}
            </p>
          </div>
        </div>

        {queueCount > 0 && (
          <div className="flex items-center space-x-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full text-xs font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{queueCount} Antrean</span>
          </div>
        )}
      </div>

      {/* Main Attendance Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        {/* Branch Info Header */}
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{branchName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Batas radius: {formatDistance(radiusMeters)}</p>
          </div>
        </div>

        {/* Real-time Distance Guidance Badge */}
        <div className="pt-1">
          {gpsStatus === "denied" && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Izin Lokasi GPS Belum Aktif</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Aplikasi membutuhkan akses GPS untuk mengukur jarak ke lokasi cabang sebelum absen.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-1 border-amber-300 text-amber-800 bg-white hover:bg-amber-100 text-xs font-semibold"
                onClick={handleRetryPermission}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Minta Izin GPS Ulang
              </Button>
            </div>
          )}

          {gpsStatus === "unsupported" && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100">
              Perangkat tidak mendukung sensor Geolocation GPS.
            </div>
          )}

          {gpsStatus === "locating" && (
            <div className="flex items-center space-x-2 p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-500">
              <Navigation className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              <span>Mencari sinyal GPS dan menghitung jarak...</span>
            </div>
          )}

          {gpsStatus === "active" && currentDistance !== null && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                isInsideRadius
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/80 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    isInsideRadius ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                />
                <div>
                  <span className="font-bold text-sm block">
                    Jarak: {formatDistance(currentDistance)}
                  </span>
                  <span className="text-[11px] opacity-90">
                    {isInsideRadius
                      ? "✓ Anda berada di dalam area cabang"
                      : `✕ Di luar radius (Maks. ${formatDistance(radiusMeters)})`}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 uppercase tracking-wider ${
                  isInsideRadius
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {isInsideRadius ? "Siap Absen" : "Mendekatlah"}
              </span>
            </div>
          )}
        </div>

        {/* Location Error Notification */}
        {locationError && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 leading-relaxed">
            {locationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <Button
            size="lg"
            className={`w-full h-auto py-4 flex flex-col space-y-2 ${
              isCheckedIn
                ? "bg-emerald-600 hover:bg-emerald-700"
                : isInsideRadius
                ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                : "bg-slate-700 hover:bg-slate-800"
            }`}
            disabled={isCheckedIn || isLoadingGPS}
            onClick={() => void handleAttendance("check_in")}
          >
            {isCheckedIn ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            <span className="font-semibold text-sm">
              {isCheckedIn ? "Sudah Check-In" : "Check-In"}
            </span>
          </Button>

          <Button
            size="lg"
            variant={!isCheckedIn ? "outline" : "primary"}
            className={`w-full h-auto py-4 flex flex-col space-y-2 ${
              isCheckedOut ? "bg-slate-200 text-slate-500 border-none" : ""
            }`}
            disabled={!isCheckedIn || isCheckedOut || isLoadingGPS}
            onClick={() => void handleAttendance("check_out")}
          >
            <MapPin className="w-6 h-6" />
            <span className="font-semibold text-sm">
              {isCheckedOut ? "Sudah Pulang" : "Check-Out"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
