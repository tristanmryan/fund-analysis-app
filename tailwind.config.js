const scoreColors = ['#16a34a', '#22c55e', '#6b7280', '#eab308', '#dc2626']

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  safelist: scoreColors.flatMap((c) => [
    `text-[${c}]`,
    `bg-[${c}]/10`,
    `bg-[${c}]/20`,
    `border-[${c}]/50`
  ]),
  theme: {
    extend: {},
  },
  plugins: [],
}
