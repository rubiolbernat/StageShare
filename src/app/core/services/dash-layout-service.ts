import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashLayoutService {

  constructor() { }

  private expandAside = signal<boolean>(false)

  getisAside() {
    return this.expandAside()
  }

  toggleAside() {
    this.expandAside.set(!this.expandAside())
  }

  closeAside(){
    this.expandAside.set(false)
  }
}
