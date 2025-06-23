import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BehaviorSubject, Observable } from 'rxjs';

interface HealthBridgeDB extends DBSchema {
  patientData: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      lastModified: number;
      synced: boolean;
    };
    indexes: { 'by-type': string };
  };
  pendingActions: {
    key: string;
    value: {
      id: string;
      action: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
  };
}

export class OfflineService {
  private db!: IDBPDatabase<HealthBridgeDB>;
  private readonly DB_NAME = 'healthbridge_offline';
  private readonly DB_VERSION = 1;
  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  private syncInProgress$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }

  private async initializeDB() {
    this.db = await openDB<HealthBridgeDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create stores
        const patientStore = db.createObjectStore('patientData', {
          keyPath: 'id'
        });
        patientStore.createIndex('by-type', 'type');

        db.createObjectStore('pendingActions', {
          keyPath: 'id'
        });
      }
    });
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.onlineStatus$.next(true);
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus$.next(false);
    });
  }

  private async startPeriodicSync() {
    if ('serviceWorker' in navigator && 'periodic-sync' in navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await (registration as any).periodicSync.register('healthbridge-sync', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          });
        }
      } catch (error) {
        console.error('Periodic sync could not be registered:', error);
      }
    }
  }

  public async storeData(type: string, data: any): Promise<void> {
    try {
      const item = {
        id: `${type}_${Date.now()}`,
        type,
        data,
        lastModified: Date.now(),
        synced: false
      };

      await this.db.put('patientData', item);

      if (this.onlineStatus$.value) {
        this.syncData();
      }
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  public async getData(type: string): Promise<any[]> {
    try {
      const index = this.db.transaction('patientData').store.index('by-type');
      return await index.getAll(type);
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  public async queueAction(action: string, data: any): Promise<void> {
    try {
      const pendingAction = {
        id: `${action}_${Date.now()}`,
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };

      await this.db.put('pendingActions', pendingAction);

      if (this.onlineStatus$.value) {
        this.processPendingActions();
      }
    } catch (error) {
      console.error('Error queuing action:', error);
      throw error;
    }
  }

  private async syncData(): Promise<void> {
    if (this.syncInProgress$.value) return;

    try {
      this.syncInProgress$.next(true);

      // Get all unsynced data
      const tx = this.db.transaction('patientData', 'readonly');
      const unsyncedData = await tx.store.index('by-type').getAll();
      
      for (const item of unsyncedData) {
        if (!item.synced) {
          try {
            // Sync with server
            await this.syncItemWithServer(item);
            
            // Mark as synced
            await this.db.put('patientData', {
              ...item,
              synced: true
            });
          } catch (error) {
            console.error('Error syncing item:', error);
          }
        }
      }

      await this.processPendingActions();
    } finally {
      this.syncInProgress$.next(false);
    }
  }

  private async syncItemWithServer(item: any): Promise<void> {
    // Implementation would include API calls to sync with server
    // This is a placeholder for the actual implementation
    console.log('Syncing item with server:', item);
  }

  private async processPendingActions(): Promise<void> {
    const tx = this.db.transaction('pendingActions', 'readwrite');
    const pendingActions = await tx.store.getAll();

    for (const action of pendingActions) {
      try {
        await this.processAction(action);
        await tx.store.delete(action.id);
      } catch (error) {
        console.error('Error processing action:', error);
        if (action.retryCount < 3) {
          await tx.store.put({
            ...action,
            retryCount: action.retryCount + 1
          });
        }
      }
    }
  }

  private async processAction(action: any): Promise<void> {
    // Implementation would include processing different types of actions
    // This is a placeholder for the actual implementation
    console.log('Processing action:', action);
  }

  public getOnlineStatus(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  public getSyncStatus(): Observable<boolean> {
    return this.syncInProgress$.asObservable();
  }

  public async clearOfflineData(): Promise<void> {
    try {
      await this.db.clear('patientData');
      await this.db.clear('pendingActions');
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }
}
