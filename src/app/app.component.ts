import { Component} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule,RouterOutlet } from '@angular/router';
import { WordCloudService } from './word-cloud.service';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { MatSidenavModule } from '@angular/material/sidenav'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ MatSidenavModule, RouterOutlet],
  templateUrl: './app.component.html',
  providers: [WordCloudService],
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'word-cloud-app';
  constructor(private wordCloudService: WordCloudService) {
  }
  ngOnInit(): void {
    (window as any).WordCloudService = this.wordCloudService;
  }
 
}
