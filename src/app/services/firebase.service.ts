import { Injectable, inject } from '@angular/core';
import {
  Database,
  getDatabase,
  ref,
  child,
  push,
  update,
  remove,
} from '@angular/fire/database';
import { get, query, onValue } from '@firebase/database';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db: Database = inject(Database);

  constructor() {}

  getData(path: string): Observable<any> {
    const dataSubject = new Subject<any>();
    const dbRef = ref(this.db, path);

    onValue(dbRef, (snapshot) => {
      dataSubject.next(snapshot.val());
    });

    return dataSubject.asObservable();
  }

  async addData(path: string, data: any): Promise<void> {
    const dbRef = ref(this.db, path);
    const newRef = push(dbRef);
    await update(newRef, data);
  }

  async updateData(path: string, data: any): Promise<void> {
    const dbRef = ref(this.db, path);
    await update(dbRef, data);
  }

  async deleteData(path: string): Promise<void> {
    const dbRef = ref(this.db, path);
    await remove(dbRef);
  }

  async getSingleData(path: string): Promise<any> {
    const dbRef = ref(this.db, path);
    const snapshot = await get(query(dbRef));
    return snapshot.val();
  }
}
