// A photo a visitor attached on the home page before they had an account. It waits in
// IndexedDB (a sign up can happen on another page, or after a reload) until the Library
// uploads it for the new account. Everything here is best effort: private windows can block
// IndexedDB, and then the visitor simply attaches the photo again.

const DB_NAME = 'easyrender';
const STORE = 'pending-upload';
const KEY = 'photo';

export type PendingUpload = { file: File; prompt: string };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, act: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = act(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function savePending(file: Blob, name: string, prompt: string): Promise<void> {
  try {
    await run('readwrite', (store) =>
      store.put({ file, name, prompt, type: file.type || 'image/jpeg' }, KEY),
    );
  } catch {
    // Not saved: the visitor re-attaches the photo after signing up.
  }
}

export async function hasPending(): Promise<boolean> {
  try {
    return (await run('readonly', (store) => store.count(KEY))) > 0;
  } catch {
    return false;
  }
}

// Reads and removes the waiting photo, so it is uploaded once.
export async function takePending(): Promise<PendingUpload | null> {
  try {
    const saved = await run<{ file: Blob; name: string; prompt: string; type: string } | undefined>(
      'readonly',
      (store) => store.get(KEY),
    );
    if (!saved) return null;
    await run('readwrite', (store) => store.delete(KEY));
    return {
      file: new File([saved.file], `${saved.name}.jpg`, { type: saved.type }),
      prompt: saved.prompt,
    };
  } catch {
    return null;
  }
}
