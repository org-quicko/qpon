import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router'
import { argbFromHex, hexFromArgb, Hct, TonalPalette, CorePalette, themeFromSourceColor } from '@material/material-color-utilities';
export class ColorUtil {

  static identifiers = ['0','4','6','10', '17', '12', '22', '20', '24', '25', '30', '35', '40', '50', '60', '70', '80', '87', '90', '92', '94', '95', '96', '98', '99', '100'];

  static setThemeFromSeed(seedColor: string) {

    const corePalette = CorePalette.of(argbFromHex(seedColor));

    // Extract palettes directly from CorePalette
    const primaryPalette = corePalette.a1;
    const secondaryPalette = corePalette.a2;
    const tertiaryPalette = corePalette.a3;
    const neutralPalette = corePalette.n1;
    const neutralVariantPalette = corePalette.n2;
    const errorPalette = corePalette.error; // Material 3 error palette

    this.setThemeVariables('primary', primaryPalette);
    this.setThemeVariables('secondary', secondaryPalette);
    this.setThemeVariables('tertiary', tertiaryPalette);
    this.setThemeVariables('neutral', neutralPalette);
    this.setThemeVariables('neutral-variant', neutralVariantPalette);
    this.setThemeVariables('error', errorPalette);

  }

  private static setThemeVariables(prefix: string, palette: TonalPalette) {
    for (const identifier of ColorUtil.identifiers) {
      const toneValue = parseInt(identifier, 10);
      const argb = palette.tone(toneValue);
      const hexColor = hexFromArgb(argb);
      document.documentElement.style.setProperty(
        `--sys-${prefix}-${identifier}`,
        hexColor
      );
    }
  }



}
