import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { ColorUtil } from './utils/color-util';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { registerIcons } from './app.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'qpon';

  constructor(private themeService: ThemeService, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    ColorUtil.setThemeFromSeed('#2962FF');

    this.themeService.initializeTheme();
    registerIcons(this.iconRegistry, this.sanitizer);
  }
}
