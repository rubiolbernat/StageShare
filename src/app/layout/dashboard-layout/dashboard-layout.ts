import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../dashboard/components/header/header';
import { Aside } from '../../dashboard/components/aside/aside';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Header, Aside],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {

}
