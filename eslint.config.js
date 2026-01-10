//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginReact from 'eslint-plugin-react'
import reactCompiler from 'eslint-plugin-react-compiler'
import * as pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import stylistic from '@stylistic/eslint-plugin'

export default [
  ...tanstackConfig,
  stylistic.configs.customize({
        // the following options are the default values
        indent: 4,
        quotes: 'double',
        semi: true,
        jsx: true,
        // ...
    }),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': eslintPluginJsxA11y,
      perfectionist,
      react: pluginReact,
      'react-compiler': reactCompiler,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh
    },
    rules: {
      ...eslintPluginJsxA11y.configs.strict.rules,
      ...perfectionist.configs['recommended-natural'].rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-compiler/react-compiler': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
