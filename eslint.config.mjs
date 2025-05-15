import antfu from '@antfu/eslint-config'

export default antfu([
  {
    rules: {
      'unicorn/prefer-node-protocol': 'off',
    },
  },
], {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // SonarCloud will complain about this rule, but it is a good practice to use
    'ts/prefer-nullish-coalescing': 'error',
  },
})
