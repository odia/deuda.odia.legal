module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'header'],
  root: true,
  rules: {
    "react/no-unknown-property": 0,
    "react/no-unescaped-entities": 0,
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/no-unused-vars": [2,{argsIgnorePattern:"^_"}],
    "header/header": [2,"copyleft-header.js"]
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    jsx: true,
  },
  settings: {
    react: {
      version: "18",
      pragma: "h",
    }
  },
};
