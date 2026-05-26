import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Ignore build artifacts(which files not releted to your original source coede)
  globalIgnores(['dist']),
  
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { 
        ecmaFeatures: { jsx: true } 
      },
    },
    rules: {
      // Disable strict Vite rule to allow exporting standard Context and Hooks
      'react-refresh/only-export-components': 'off',
    },
  },
]);