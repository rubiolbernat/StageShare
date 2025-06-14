import { Component } from '@angular/core';

@Component({
  selector: 'app-aside',
  imports: [],
  templateUrl: './aside.html',
  styleUrl: './aside.css'
})
export class Aside {
  toggleSubmenu(event: MouseEvent): void {
    const button = (event.currentTarget as HTMLElement);
    const submenu = button.querySelector('.submenu');
    const arrow = button.querySelector('.submenu-arrow svg');

    if (submenu && arrow) {
      submenu.classList.toggle('open');
      const arrowEl = arrow as HTMLElement;
      arrowEl.style.transition = 'transform 0.4s';
      arrowEl.style.transform = submenu.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0deg)';
    }

    event.stopPropagation();
  }

  onNavClick(target: string): void {
    console.log('Navegar a:', target);
    // Pots integrar un router.navigate aquí si vols
  }
}
