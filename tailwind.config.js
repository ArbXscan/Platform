export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Robinhood Lime theme — override cyan/blue so existing classes turn lime
        cyan: {
          50: "#f7ffd6",
          100: "#ecff99",
          200: "#e0ff4d",
          300: "#c6ff00",
          400: "#d4ff00",
          500: "#b8f400",
          600: "#a6e000",
          700: "#8fbf00",
          800: "#739900",
          900: "#5c7a00",
        },
        blue: {
          50: "#f9ffcc",
          100: "#ecff99",
          200: "#dcff4d",
          300: "#c6ff00",
          400: "#c6ff00",
          500: "#b8f400",
          600: "#a6e000",
          700: "#8fbf00",
          800: "#739900",
          900: "#5c7a00",
        },
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: { marquee: "marquee 28s linear infinite" },
    },
  },
  plugins: [],
}
