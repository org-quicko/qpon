import type { Config } from 'tailwindcss';

const tailwindConfig: Config = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['"General Sans", sans-serif']
    },
    extend: {
     colors: getColorConfig(),
    },
  },
  plugins: [

  ]
}

export default tailwindConfig;

function getColorConfig() {

  const colors = ["primary", "secondary", "tertiary", "surface", "error", "warn", "success"];

  const colorConfig: Record<string, string> = {};

  colors.forEach(color => {

    // Mapping all variations for each color
    colorConfig[color] = `var(--sys-${color})`;
    colorConfig[`${color}-variant`] = `var(--sys-${color}-variant)`;
    colorConfig[`${color}-bright`] = `var(--sys-${color}-bright)`;
    colorConfig[`${color}-dim`] = `var(--sys-${color}-dim)`;
    colorConfig[`${color}-tint`] = `var(--sys-${color}-tint)`;
    colorConfig[`${color}-container`] = `var(--sys-${color}-container)`;
    colorConfig[`${color}-container-low`] = `var(--sys-${color}-container-low)`;
    colorConfig[`${color}-container-lowest`] = `var(--sys-${color}-container-lowest)`;
    colorConfig[`${color}-container-high`] = `var(--sys-${color}-container-high)`;
    colorConfig[`${color}-container-highest`] = `var(--sys-${color}-container-highest)`;
    colorConfig[`inverse-${color}`] = `var(--sys-inverse-${color})`;
    colorConfig[`inverse-on-${color}`] = `var(--sys-inverse-on-${color})`;
    colorConfig[`on-${color}`] = `var(--sys-on-${color})`;
    colorConfig[`on-${color}-variant`] = `var(--sys-on-${color}-variant)`;
    colorConfig[`on-${color}-container`] = `var(--sys-on-${color}-container)`;
    colorConfig[`on-${color}-fixed`] = `var(--sys-on-${color}-fixed)`;
    colorConfig[`${color}-fixed`] = `var(--sys-${color}-fixed)`;
    colorConfig[`${color}-fixed-dim`] = `var(--sys-${color}-fixed-dim)`;
    colorConfig[`on-${color}-fixed-variant`] = `var(--sys-on-${color}-fixed-variant)`;
  });

  colorConfig['outline'] = "var(--sys-outline)";
  colorConfig['outline-variant'] = "var(--sys-outline-variant)"

  return colorConfig;
}
