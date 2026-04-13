/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EAF2FF',
          100: '#CCE1FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052D9',
          700: '#003FAD',
          800: '#002C80',
          900: '#001A54',
        },
        // TDesign 语义色
        success: '#00A870',
        warning: '#ED7B2F',
        danger:  '#E34D59',
        // 侧边栏深色
        sidebar: {
          bg:     '#1B2337',
          hover:  '#242F48',
          active: '#0052D9',
          text:   '#A3AABF',
          title:  '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '6px',
        '2xl': '8px',
      },
    },
  },
  plugins: [],
}
