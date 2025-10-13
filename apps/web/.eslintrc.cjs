module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],

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