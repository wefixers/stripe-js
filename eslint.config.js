import antfu from '@antfu/eslint-config'

export default antfu({
  root: true,
  rules: {
    curly: ['error', 'all'],
  },
})
