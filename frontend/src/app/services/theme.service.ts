import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject } from "rxjs";
import { Theme } from "../../enums";

@Injectable({
    providedIn: "root"
})
export class ThemeService {

    private theme = new BehaviorSubject<Theme>(Theme.LIGHT);

    public theme$ = this.theme.asObservable();

    private systemThemePreference: Theme = Theme.LIGHT;

    private userThemePreference: Theme;

    private renderer: Renderer2;

    constructor(
        rendererFactory: RendererFactory2,
        private cookieService: CookieService
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);

        this.systemThemePreference = this.getSystemThemePreference()

        const themePreferenceFromCookie = this.cookieService.get("theme")
        this.userThemePreference = Theme[themePreferenceFromCookie?.toUpperCase() as keyof typeof Theme];
    }

    public getSystemThemePreference(){
        const isDarkThemeEnabled = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if(isDarkThemeEnabled == true)
            return Theme.DARK
        return Theme.LIGHT
    }

    public initializeTheme() {
        if (this.userThemePreference != null) {
            this.setTheme(this.userThemePreference);
            this.updateThemingClasses(this.userThemePreference);
        }
        else if (this.systemThemePreference != null) {
            this.setTheme(Theme.SYSTEM);
            this.updateThemingClasses(this.systemThemePreference);
        }
        else {
            this.setTheme(Theme.LIGHT);
            this.updateThemingClasses(Theme.LIGHT);
        }

    }

    public setTheme(theme: Theme) {
        this.theme.next(theme);

        this.updateThemingClasses(theme);

        this.cookieService.set("theme", theme, undefined, '/', `localhost`, true, 'Strict');

    }

    private updateThemingClasses(theme: Theme) {
        if(theme == Theme.SYSTEM){
            theme = this.getSystemThemePreference()
        }

        switch (theme) {
            case Theme.LIGHT:
                this.renderer.addClass(document.body, 'light-theme');
                this.renderer.removeClass(document.body, 'dark-theme');
                break;
            case Theme.DARK:
                this.renderer.addClass(document.body, 'dark-theme');
                this.renderer.removeClass(document.body, 'light-theme');
                break;
            default:
                this.renderer.addClass(document.body, 'light-theme');
                this.renderer.removeClass(document.body, 'dark-theme');
                break;
        }
    }
}