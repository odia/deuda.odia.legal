/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: [
      "./src/**/*.{html,tsx}",
      "./node_modules/@gnu-taler/web-util/src/**/*.{html,tsx}"
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
