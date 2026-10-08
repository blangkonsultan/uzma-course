export interface PendingAttendance {
  id: string; // uuid
  teacher_id: string;
  branch_id: string;
  type: "check_in" | "check_out";
  lat: number;
  lng: number;
  timestamp: string; // ISO string captured at the moment
}

const DB_NAME = "UzmaCoursePWA";
const DB_VERSION = 1;
const STORE_NAME = "attendance_queue";

function openDB(): Promise<IDBDatabase> {
  const { promise, resolve, reject } = Promise.withResolvers<IDBDatabase>();
  if (typeof window === "undefined") {
    reject(new Error("IndexedDB is not available on the server."));
    return promise;
  }

  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  
  return promise;
}

export async function savePendingAttendance(record: PendingAttendance): Promise<void> {
  const db = await openDB();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.put(record);

  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error);
  return promise;
}

export async function getPendingAttendances(): Promise<PendingAttendance[]> {
  if (typeof window === "undefined") return [];
  
  try {
    const db = await openDB();
    const { promise, resolve, reject } = Promise.withResolvers<PendingAttendance[]>();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    return promise;
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return [];
  }
}

export async function removePendingAttendances(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDB();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  ids.forEach((id) => store.delete(id));

  transaction.oncomplete = () => resolve();
  transaction.onerror = () => reject(transaction.error);
  return promise;
}
