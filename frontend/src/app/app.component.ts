import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { ColorUtil } from './utils/color-util';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'qpon';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    ColorUtil.setThemeFromSeed('#2962FF');

    this.themeService.initializeTheme();
  }
}
