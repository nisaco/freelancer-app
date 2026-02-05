/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: This tells Tailwind to look for a "dark" class on the <html> tag
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your existing colors
        primary: '#0F172A',
        secondary: '#3B82F6',
        accent: '#F59E0B',
        
        // ADD THESE for that "Classy" Dark Mode look
        darkBg: '#0B0F1A',     // Deepest background
        darkCard: '#161C2C',   // Slightly lighter for cards
        darkBorder: '#1E293B', // Subtle borders for dark mode
      }
    },
  },
  plugins: [],
}