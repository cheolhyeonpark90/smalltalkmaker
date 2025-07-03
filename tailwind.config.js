// tailwind.config.js
module.exports = {
  content: [
    "./*.{html,js}", // 현재 폴더의 모든 html, js 파일을 감시
  ],
  theme: {
    extend: {
      // 이 부분이 가장 중요합니다!
      colors: {
        'beige': '#F7F3EE',
        'terracotta': '#D57A66',
        'dark-gray': '#4A4A4A',
        'heading-gray': '#333',
      }
    },
  },
  plugins: [],
}