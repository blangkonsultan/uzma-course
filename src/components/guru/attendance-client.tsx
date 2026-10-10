"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Check,
  Building2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDistanceMeters, formatDistance } from "@/lib/pwa/haversine";
import { formatTimeString } from "@/lib/utils";
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
import type { Branch } from "@/types";
import type { BranchShift } from "@/lib/shifts";

interface AttendanceClientProps {
  teacherId: string;
  assignedBranches: Branch[];
  shiftsMap: Record<string, BranchShift[]>;
  initialAttendanceId: string | null;
  initialIsCheckedIn: boolean;
  initialIsCheckedOut: boolean;
}

function calculateShiftStatus(shifts: BranchShift[]) {
  if (!shifts || shifts.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  for (const shift of shifts) {
    const sStart = parseToMinutes(shift.start_time);
    const sEnd = parseToMinutes(shift.end_time);

    if (currentMinutes >= sStart && currentMinutes <= sEnd) {
      return {
        type: "ongoing" as const,
        shift,
        label: "Shift Sedang Berlangsung",
        badgeColor: "bg-emerald-600 text-white",
      };
    }
  }

  for (const shift of shifts) {
    const sStart = parseToMinutes(shift.start_time);
    if (currentMinutes < sStart) {
      return {
        type: "upcoming" as const,
        shift,
        label: null,
        badgeColor: "",
      };
    }
  }

  const lastShift = shifts[shifts.length - 1];
  return {
    type: "ended" as const,
    shift: lastShift,
    label: "Shift Selesai Hari Ini",
    badgeColor: "bg-slate-600 text-white",
  };
}

export function AttendanceClient({
  teacherId,
  assignedBranches,
  shiftsMap,
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

  // Selected Branch ID (Defaults to first assigned branch)
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    assignedBranches[0]?.id || ""
  );
  // Track if user manually switched branch (to avoid overriding user intent)
  const userManuallySelectedRef = useRef<boolean>(false);

  // Real-time distance tracking states
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied" | "unsupported">("locating");

  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [attendanceId, setAttendanceId] = useState<string | null>(initialAttendanceId);

  const watchIdRef = useRef<number | null>(null);

  // Active Branch object
  const activeBranch = useMemo(() => {
    return assignedBranches.find((b) => b.id === selectedBranchId) || assignedBranches[0];
  }, [assignedBranches, selectedBranchId]);

  const branchLat = activeBranch?.latitude ?? null;
  const branchLng = activeBranch?.longitude ?? null;
  const radiusMeters = activeBranch?.geofence_radius_m || 50;

  // Active Branch shifts
  const activeBranchShifts = useMemo(() => {
    return shiftsMap[activeBranch?.id || ""] || [];
  }, [shiftsMap, activeBranch?.id]);

  // Current distance to ACTIVE selected branch
  const currentDistance = useMemo(() => {
    if (!currentCoords || branchLat === null || branchLng === null) return null;
    return calculateDistanceMeters(currentCoords.lat, currentCoords.lng, branchLat, branchLng);
  }, [currentCoords, branchLat, branchLng]);

  // Nearest Branch Detection based on live GPS
  const nearestBranchResult = useMemo(() => {
    if (!currentCoords || assignedBranches.length <= 1) return null;

    let nearest = assignedBranches[0];
    let minD = Infinity;

    for (const b of assignedBranches) {
      if (b.latitude !== null && b.longitude !== null) {
        const d = calculateDistanceMeters(currentCoords.lat, currentCoords.lng, b.latitude, b.longitude);
        if (d < minD) {
          minD = d;
          nearest = b;
        }
      }
    }

    if (minD === Infinity) return null;
    return { branch: nearest, distance: minD };
  }, [currentCoords, assignedBranches]);

  // Auto-select nearest branch when GPS first locks on (if user hasn't explicitly chosen)
  useEffect(() => {
    if (!userManuallySelectedRef.current && nearestBranchResult?.branch) {
      setSelectedBranchId(nearestBranchResult.branch.id);
    }
  }, [nearestBranchResult]);

  // Determine current nearest / active shift for the active branch
  const shiftStatusResult = calculateShiftStatus(activeBranchShifts);

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

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setCurrentCoords({ lat: latitude, lng: longitude });
      setGpsStatus("active");
    };

    const errorHandler = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus("denied");
      } else {
        setGpsStatus("locating");
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    });
  }, []);

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

  function handleRetryPermission() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setGpsStatus("active");
        startWatchingLocation();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus("denied");
          setLocationError(
            "Izin GPS diblokir oleh browser. Buka setelan izin situs (ikon gembok di sebelah URL browser) dan ubah Lokasi menjadi 'Izinkan'."
          );
        } else {
          setLocationError("Sinyal GPS belum stabil. Coba berada di ruang terbuka atau tunggu sebentar.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  async function queueAttendanceOffline(type: "check_in" | "check_out", lat: number, lng: number, timestamp: string) {
    const record: PendingAttendance = {
      id: crypto.randomUUID(),
      teacher_id: teacherId,
      branch_id: activeBranch.id,
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

    const executeWithCoords = async (latitude: number, longitude: number) => {
      const distance = calculateDistanceMeters(latitude, longitude, branchLat, branchLng);

      if (distance > radiusMeters) {
        const userDist = formatDistance(distance);
        const maxDist = formatDistance(radiusMeters);
        setLocationError(`Anda masih berjarak ${userDist} dari cabang. Mendekatlah ke area dalam radius ${maxDist} untuk bisa presensi.`);
        setIsLoadingGPS(false);
        return;
      }

      const timestamp = new Date().toISOString();

      if (isOnline) {
        try {
          if (type === "check_in") {
            const res = await processOnlineCheckIn(activeBranch.id, latitude, longitude, timestamp);
            if (res.success && res.data) {
              setIsCheckedIn(true);
              setAttendanceId(res.data.id);
            } else {
              throw new Error(res.error || "Gagal mencatat presensi online");
            }
          } else {
            if (!attendanceId) {
              throw new Error("Menunggu sinkronisasi Check-in sebelum bisa Check-out online.");
            }
            const res = await processOnlineCheckOut(attendanceId, latitude, longitude, timestamp);
            if (res.success) {
              setIsCheckedOut(true);
            } else {
              throw new Error(res.error || "Gagal mencatat presensi online");
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

    if (currentCoords) {
      await executeWithCoords(currentCoords.lat, currentCoords.lng);
      return;
    }

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

  const isInsideRadius = currentDistance !== null && currentDistance <= radiusMeters;

  return (
    <div className="space-y-4">
      {/* Network & Connectivity Status Card */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl transition-colors ${
              isOnline ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {isOnline ? "Mode Online" : "Mode Offline"}
            </p>
            <p className="text-[11px] text-slate-500">
              {isOnline ? "Tersambung ke server pusat" : "Presensi tersimpan lokal (IndexedDB)"}
            </p>
          </div>
        </div>

        {queueCount > 0 && (
          <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-bold border border-amber-200/60">
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{queueCount} Antrean</span>
          </div>
        )}
      </div>

      {/* Main Geofence & Attendance Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Multi-Branch Selector (If teacher is assigned to > 1 branch) */}
        {assignedBranches.length > 1 ? (
          <div className="space-y-1.5 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="branch-selector" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary-600" />
                <span>Pilih Lokasi Mengajar</span>
              </label>
              {nearestBranchResult?.branch.id === selectedBranchId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                  <Sparkles className="w-2.5 h-2.5" />
                  Terdekat (Auto)
                </span>
              )}
            </div>

            <div className="relative">
              <select
                id="branch-selector"
                value={selectedBranchId}
                onChange={(e) => {
                  userManuallySelectedRef.current = true;
                  setSelectedBranchId(e.target.value);
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              >
                {assignedBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.sub_name ? `(${b.sub_name})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-3.5 border-b border-slate-100 pb-4">
            <div className="bg-primary-50 text-primary-600 p-2.5 rounded-xl border border-primary-100 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800 tracking-tight truncate">{activeBranch.name}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Cabang Tugas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Radius toleransi: <span className="font-semibold text-slate-700">{formatDistance(radiusMeters)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Nearest Shift Card */}
        {shiftStatusResult ? (
          <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100/70 text-primary-700 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Shift {shiftStatusResult.shift.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    ({formatTimeString(shiftStatusResult.shift.start_time)} - {formatTimeString(shiftStatusResult.shift.end_time)})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Presensi akan dialokasikan ke shift ini
                </p>
              </div>
            </div>

            {shiftStatusResult.label && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${shiftStatusResult.badgeColor}`}>
                {shiftStatusResult.label}
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500 text-center">
            Belum ada data shift operasional untuk cabang ini.
          </div>
        )}

        {/* Real-time Distance Guidance Panel */}
        <div aria-live="polite" className="pt-0.5">
          {gpsStatus === "denied" && (
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Izin Lokasi GPS Belum Aktif</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Aplikasi membutuhkan akses GPS untuk menghitung jarak presisi ke lokasi cabang sebelum presensi.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-1 border-amber-300 text-amber-900 bg-white hover:bg-amber-100 text-xs font-semibold rounded-full min-h-[38px]"
                onClick={handleRetryPermission}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Coba Minta Izin GPS Ulang
              </Button>
            </div>
          )}

          {gpsStatus === "unsupported" && (
            <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-medium rounded-xl border border-rose-200">
              Perangkat ini tidak mendukung fitur sensor Geolocation GPS.
            </div>
          )}

          {gpsStatus === "locating" && (
            <div className="flex items-center space-x-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600">
              <Navigation className="w-4 h-4 text-primary-600 animate-spin shrink-0" />
              <span className="font-medium">Menghubungkan ke satelit GPS & mengukur jarak...</span>
            </div>
          )}

          {gpsStatus === "active" && currentDistance !== null && (
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isInsideRadius
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-rose-50/70 border-rose-200 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isInsideRadius ? "bg-emerald-600 animate-pulse" : "bg-rose-600"
                    }`}
                  />
                  <div>
                    <span className="font-bold text-sm block">
                      Jarak: {formatDistance(currentDistance)}
                    </span>
                    <span className="text-[11px] font-medium opacity-90">
                      {isInsideRadius
                        ? `✓ Di dalam area ${activeBranch.name}`
                        : `✕ Di luar radius (Maks. ${formatDistance(radiusMeters)})`}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                    isInsideRadius
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-rose-600 text-white shadow-2xs"
                  }`}
                >
                  {isInsideRadius ? "Siap Presensi" : "Mendekatlah"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Location Error Notification */}
        {locationError && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl leading-relaxed flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            size="lg"
            className={`w-full py-4.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              isCheckedIn
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                : isInsideRadius
                ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20"
                : "bg-slate-800 text-white hover:bg-slate-900"
            }`}
            disabled={isCheckedIn || isLoadingGPS}
            onClick={() => void handleAttendance("check_in")}
          >
            {isCheckedIn ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <span className="font-bold text-sm leading-none">
              {isCheckedIn ? "Sudah Masuk" : "Check-In"}
            </span>
            <span className="text-[10px] opacity-80 font-normal">
              {isCheckedIn ? "Kehadiran tercatat" : "Mulai sesi mengajar"}
            </span>
          </Button>

          <Button
            size="lg"
            variant={!isCheckedIn ? "outline" : "primary"}
            className={`w-full py-4.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              isCheckedOut
                ? "bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed"
                : !isCheckedIn
                ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                : isInsideRadius
                ? "bg-primary-700 text-white hover:bg-primary-800 shadow-md shadow-primary-600/20"
                : "bg-slate-800 text-white hover:bg-slate-900"
            }`}
            disabled={!isCheckedIn || isCheckedOut || isLoadingGPS}
            onClick={() => void handleAttendance("check_out")}
          >
            {isCheckedOut ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <MapPin className="w-5 h-5" />}
            <span className="font-bold text-sm leading-none">
              {isCheckedOut ? "Sudah Pulang" : "Check-Out"}
            </span>
            <span className="text-[10px] opacity-80 font-normal">
              {isCheckedOut ? "Selesai bertugas" : "Akhiri sesi mengajar"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
