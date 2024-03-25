tailwind.config = {
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        "a": { "color": "blue" },
        "a:hover": { "text-decoration": "underline" },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    }
  ]
}