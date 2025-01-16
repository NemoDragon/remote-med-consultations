import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from '@angular/fire/auth';
import { Database, ref, set, get } from '@angular/fire/database';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {
    this.auth.onAuthStateChanged((user) => this.currentUserSubject.next(user));
  }

  async register(email: string, password: string, role: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    const userRef = ref(this.db, `users/${userId}`);
    await set(userRef, { email, role });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async getUserRole(userId: string): Promise<string | null> {
    const userRef = ref(this.db, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val().role;
    }
    return null;
  }

  async setPersistenceMode(mode: 'local' | 'session' | 'none'): Promise<void> {
    let persistence;
    switch (mode) {
      case 'local':
        persistence = browserLocalPersistence;
        break;
      case 'session':
        persistence = browserSessionPersistence;
        break;
      case 'none':
        persistence = inMemoryPersistence;
        break;
      default:
        throw new Error('Invalid persistence mode');
    }

    try {
      await setPersistence(this.auth, persistence);
      console.log(`Persistence mode set to: ${mode}`);
    } catch (error) {
      console.error('Error setting persistence mode:', error);
    }
  }
}
