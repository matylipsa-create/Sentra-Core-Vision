import { openDB, type DBSchema, type IDBPDatabase, type IDBPObjectStore, type StoreNames } from 'idb';

export function openDatabase<DB extends DBSchema>(
  dbName: string,
  version: number,
  onUpgrade: (db: IDBPDatabase<DB>) => void,
): Promise<IDBPDatabase<DB>> {
  return openDB<DB>(dbName, version, {
    upgrade(db) {
      onUpgrade(db);
    },
  });
}

export async function withStore<
  DB extends DBSchema,
  StoreName extends StoreNames<DB>,
  Result,
>(
  db: IDBPDatabase<DB>,
  storeName: StoreName,
  mode: IDBTransactionMode,
  callback: (store: IDBPObjectStore<DB, StoreNames<DB>[], StoreName, 'readwrite'>) => Promise<Result> | Result,
): Promise<Result> {
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName) as IDBPObjectStore<DB, StoreNames<DB>[], StoreName, 'readwrite'>;
  const result = await callback(store);
  await transaction.done;
  return result;
}
