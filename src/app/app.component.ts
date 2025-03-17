import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

/**
 * Root component of the application.
 * It manages the overall layout and dynamically adjusts the footer based on the current route.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'videoflix_frontend';
  isFixedFooter = false;

  /**
   * Constructor for AppComponent.
   * Subscribes to router events to determine if the footer should be fixed based on the current route.
   * @param router - The Router service for navigation and route event handling.
   */
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isFixedFooter = ['/', '/login', '/register', '/reset-password', '/forgot-password'].includes(event.url);
      }
    });
  }
}