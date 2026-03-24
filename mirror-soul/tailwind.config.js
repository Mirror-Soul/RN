/** @type {import('tailwindcss').Config} */
module.exports = {
  // Expo 앱 전체에서 Tailwind 클래스를 사용할 경로를 지정합니다.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 1. Primary Colors
        'soul-black': '#000000',
        'electric-cyan': '#00FFFF',
        'vivid-purple': '#9333EA',
        'hot-pink': '#EC4899',
        
        // 2. Neutral Colors
        'pure-white': '#FFFFFF',
        'light-gray': '#9CA3AF',
        'dark-gray': '#6B7280',

        // 3. Semantic Colors
        'success-green': '#4ADE80',
        'warning-yellow': '#FBBF24',
        'error-red': '#EF4444',
      },
      // 4. Gradient Combinations 
      // Tailwind의 from-xxx to-xxx 유틸리티로도 사용 가능하지만, 
      // 고정된 그라디언트를 재사용하기 위해 정의해 둡니다.
      backgroundImage: {
        'gradient-cyan-purple': 'linear-gradient(to right, #00FFFF, #9333EA)',
        'gradient-purple-pink': 'linear-gradient(to right, #9333EA, #EC4899)',
        'gradient-pink-purple': 'linear-gradient(to right, #EC4899, #9333EA)',
      }
    },
  },
  plugins: [],
}
