/** @type {import('stylelint').Config} */
export default {
    plugins: ['stylelint-plugin-carbon-tokens'],
    extends: ['stylelint-plugin-carbon-tokens/config/recommended.js'],
    customSyntax: 'postcss-scss',
    ignoreFiles: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.nx/**',
    ],
};
