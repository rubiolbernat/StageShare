import { Component, inject, signal } from '@angular/core';
import { DashLayoutService } from '../../../core/services/dash-layout-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  private LayoutService = inject(DashLayoutService)

  public settingsModal = signal<boolean>(false)
  public messagesModal = signal<boolean>(false)
  /* Modal Options */
  openSettingsModal() {
    this.closeModals()
    this.settingsModal.set(true)
  }

  openMessagesModal() {
    this.closeModals()
    this.messagesModal.set(true)
  }

  closeModals() {
    this.messagesModal.set(false)
    this.settingsModal.set(false)
  }

  toggleAside() {
    this.LayoutService.toggleAside();
  }

  /* THEME OPTIONS */
  setDarkMode(mode: boolean) {
    this.LayoutService.setDarkMode(mode)
  }

  setSysTheme() {
    this.LayoutService.setSystemTheme()
  }

  isDarkMode(){
    return this.LayoutService.getIsDarkTheme()
  }
  isSysTheme(){
    return this.LayoutService.getIsSysTheme()
  }

}
