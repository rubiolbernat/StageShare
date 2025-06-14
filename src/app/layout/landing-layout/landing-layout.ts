import { Component } from '@angular/core';
import { Header } from '../../landing/components/header/header';
import { Footer } from '../../landing/components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.css'
})
export class LandingLayout {

}
