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
      keyframes: {
        tada: {
          "0%": {
              transform: "scale3d(1, 1, 1)",
          },
          "10%, 20%": {
              transform: "scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)",
          },
          "30%, 50%, 70%, 90%": {
              transform: "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)",
          },
          "40%, 60%, 80%": {
              transform: "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)",
          },
          "100%": {
              transform: "scale3d(1, 1, 1)",
          },
      },

      },
      animation: {
        tada: 'tada 1s ease-in-out 0.25s 1',
      },
      opacity: {
        hover: "0.08",
      },
      borderColor: {
        blue: {
          grey: {
            100: '#CFD8DC',
            700: '#455A64'
          }
        }
      },
      boxShadow: {
        'header': '0px 0px 5px 0px #00000026'
      },
      // fontSize: {
      //   'keyboard-downward-arrow': ['24px', {
      //     lineHeight: '18px',
      //     fontWeight: '500',
      //   }],
      //   'menu-item-icon': ['20px', {
      //     lineHeight: '23px',
      //     fontWeight: '500',
      //   }],
      //   'note-regular': ['12px', {
      //     lineHeight: '18px',
      //     fontWeight: '400',
      //   }],
      //   'note-medium': ['12px', {
      //     lineHeight: '18px',
      //     fontWeight: '500',
      //   }],
      //   'note-semibold': ['12px', {
      //     lineHeight: '18px',
      //     fontWeight: '600',
      //   }],
      //   'caption-small': ['10px', {
      //     lineHeight: '15px',
      //     fontWeight: '500',
      //   }],
      //   'caption-regular': ['14px', {
      //     lineHeight: '21px',
      //     fontWeight: '400',
      //   }],
      //   'caption-medium': ['14px', {
      //     lineHeight: '21px',
      //     fontWeight: '500',
      //   }],
      //   'caption-semibold': ['14px', {
      //     lineHeight: '21px',
      //     fontWeight: '600',
      //   }],
      //   'body-1-regular': ['16px', {
      //     lineHeight: '24px',
      //     fontWeight: '400',
      //   }],
      //   'body-1-medium': ['16px', {
      //     lineHeight: '24px',
      //     fontWeight: '500',
      //   }],
      //   'body-1-semibold': ['16px', {
      //     lineHeight: '24px',
      //     fontWeight: '600',
      //   }],
      //   'body-2-regular': ['18px', {
      //     lineHeight: '27px',
      //     fontWeight: '400',
      //   }],
      //   'body-2-medium': ['18px', {
      //     lineHeight: '27px',
      //     fontWeight: '500',
      //   }],
      //   'body-2-semibold': ['18px', {
      //     lineHeight: '27px',
      //     fontWeight: '600',
      //   }],
      //   'subheading-1-regular': ['20px', {
      //     lineHeight: '30px',
      //     fontWeight: '400',
      //   }],
      //   'subheading-1-medium': ['20px', {
      //     lineHeight: '30px',
      //     fontWeight: '500',
      //   }],
      //   'subheading-1-semibold': ['20px', {
      //     lineHeight: '30px',
      //     fontWeight: '600',
      //   }],
      //   'subheading-2-regular': ['24px', {
      //     lineHeight: '36px',
      //     fontWeight: '400',
      //   }],
      //   'subheading-2-medium': ['24px', {
      //     lineHeight: '36px',
      //     fontWeight: '500',
      //   }],
      //   'subheading-2-semibold': ['24px', {
      //     lineHeight: '36px',
      //     fontWeight: '600',
      //   }],
      //   'title-regular': ['32px', {
      //     lineHeight: '48px',
      //     fontWeight: '400',
      //   }],
      //   'title-medium': ['32px', {
      //     lineHeight: '48px',
      //     fontWeight: '500',
      //   }],
      //   'title-semibold': ['32px', {
      //     lineHeight: '48px',
      //     fontWeight: '600',
      //   }],
      //   'headline-regular': ['36px', {
      //     lineHeight: '54px',
      //     fontWeight: '400',
      //   }],
      //   'headline-medium': ['36px', {
      //     lineHeight: '54px',
      //     fontWeight: '500',
      //   }],
      //   'headline-semibold': ['36px', {
      //     lineHeight: '54px',
      //     fontWeight: '600',
      //   }],
      //   'display-1-regular': ['40px', {
      //     lineHeight: '60px',
      //     fontWeight: '400',
      //   }],
      //   'display-1-medium': ['40px', {
      //     lineHeight: '60px',
      //     fontWeight: '500',
      //   }],
      //   'display-1-semibold': ['40px', {
      //     lineHeight: '60px',
      //     fontWeight: '600',
      //   }],
      //   'display-2-regular': ['48px', {
      //     lineHeight: '72px',
      //     fontWeight: '400',
      //   }],
      //   'display-2-medium': ['48px', {
      //     lineHeight: '72px',
      //     fontWeight: '500',
      //   }],
      //   'display-2-semibold': ['48px', {
      //     lineHeight: '72px',
      //     fontWeight: '600',
      //   }],
      //   'display-3-regular': ['52px', {
      //     lineHeight: '78px',
      //     fontWeight: '400',
      //   }],
      //   'display-3-medium': ['52px', {
      //     lineHeight: '78px',
      //     fontWeight: '500',
      //   }],
      //   'display-3-semibold': ['52px', {
      //     lineHeight: '78px',
      //     fontWeight: '600',
      //   }],
      // },
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
