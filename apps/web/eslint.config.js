import config from '@pulse/eslint-config/start'

export default [
  ...config,
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]
