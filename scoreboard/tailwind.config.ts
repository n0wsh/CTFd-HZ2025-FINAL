import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "mirage-background-image": "url('/assets/img/cs2-mirage.png')",
      },
    },
  },
  plugins: [],
};

export default config;