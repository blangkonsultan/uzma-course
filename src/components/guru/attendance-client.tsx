"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Wifi, WifiOff, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDistanceMeters, formatDistance } from "@/lib/pwa/haversine";
import { savePendingAttendance, getPendingAttendances, removePendingAttendances, type PendingAttendance } from "@/lib/pwa/db";
import { syncOfflineAttendances, processOnlineCheckIn, processOnlineCheckOut } from "@/app/guru/absen/actions";

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
  
  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [attendanceId, setAttendanceId] = useState<string | null>(initialAttendanceId);

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

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("GPS tidak didukung di perangkat ini.");
      setIsLoadingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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
              // Online check-out requires attendanceId
              if (!attendanceId) {
                // If they checked in offline, they don't have an ID yet!
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
      },
      () => {
        setLocationError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
        setIsLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
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
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{queueCount} Antrean</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3 mb-6">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{branchName}</h2>
            <p className="text-sm text-slate-500">Radius area: {formatDistance(radiusMeters)}</p>
          </div>
        </div>

        {locationError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
            {locationError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className={`w-full h-auto py-4 flex flex-col space-y-2 ${isCheckedIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
            className={`w-full h-auto py-4 flex flex-col space-y-2 ${isCheckedOut ? 'bg-slate-200 text-slate-500 border-none' : ''}`}
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
