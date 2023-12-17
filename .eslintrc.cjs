/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: ["**/*"],
  overrides: [
    {
      files: ['*.ts'],
      plugins: ['prettier', 'rxjs', 'unused-imports', '@nx'],
      extends: [
        'standard-with-typescript',
        'plugin:prettier/recommended',
        'plugin:rxjs/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: [
          './tsconfig.json',
          './modules/*/tsconfig.*?.json',
        ],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        'linebreak-style': ['error', 'unix'],
        '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
        'prettier/prettier': 'error',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        'accessor-pairs': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            fixStyle: 'inline-type-imports',
          },
        ],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "domain:camping",
                "onlyDependOnLibsWithTags": ["domain:camping", "domain:GLOBAL"]
              },
              {
                "sourceTag": "domain:travel-map",
                "onlyDependOnLibsWithTags": ["domain:travel-map", "domain:GLOBAL"]
              },
              {
                "sourceTag": "layer:apps",
                "notDependOnLibsWithTags": ["layer:apps"]
              },
              {
                "sourceTag": "layer:pages",
                "notDependOnLibsWithTags": ["layer:apps", "layer:pages"]
              },
              {
                "sourceTag": "layer:widgets",
                "notDependOnLibsWithTags": ["layer:apps", "layer:pages", "layer:widgets"]
              },
              {
                "sourceTag": "layer:features",
                "notDependOnLibsWithTags": ["layer:apps", "layer:pages", "layer:widgets", "layer:features"]
              },
              {
                "sourceTag": "layer:entities",
                "notDependOnLibsWithTags": ["layer:apps", "layer:pages", "layer:widgets", "layer:features", "layer:entities"]
              },
              {
                "sourceTag": "layer:shared",
                "notDependOnLibsWithTags": ["layer:apps", "layer:pages", "layer:widgets", "layer:features", "layer:entities", "layer:shared"]
              },
            ]
          }
        ]
      },
    },
    {
      files: ['*.html'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/accessibility',
      ],
      rules: {
        '@angular-eslint/template/click-events-have-key-events': 'off',
        '@angular-eslint/template/interactive-supports-focus': 'off',
      },
    },
  ],
};
