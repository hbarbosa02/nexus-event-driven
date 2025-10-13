module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "@typescript-eslint/recommended"],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js", "dist/**/*"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Proibir any completamente
    "@typescript-eslint/no-explicit-any": "error",

    // Remover variáveis e imports não utilizados
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-unused-vars": "off",

    // Proibir comentários (exceto diretivas especiais)
    "no-inline-comments": "error",
    "no-warning-comments": [
      "error",
      {
        terms: ["todo", "fixme", "hack"],
        location: "anywhere",
      },
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        markers: ["/"],
        exceptions: ["*", "-", "+"],
      },
    ],
  },
};