import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatasourceService {
  private dataSource = new BehaviorSubject<string>('json');

  dataSource$ = this.dataSource.asObservable();

  constructor() {}

  setValue(source: string) {
    this.dataSource.next(source);
  }

  getValue(): string {
    return this.dataSource.getValue();
  }
}
