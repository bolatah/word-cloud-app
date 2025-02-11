import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  routes = [
    {
      name: 'Word Clouds',
      command: () => {
        this.router.navigate(['/word-clouds']);
      },
    },
   /*  {
      name: 'Test',
      command: () => {
        this.router.navigate(['/test']);
      },
    }, */
  ];

  constructor(private router: Router) {}
}
