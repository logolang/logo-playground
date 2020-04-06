module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    },
    project: "./tsconfig.json"
  },
  extends: [
    "eslint:recommended",
    "plugin:sonarjs/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended" // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  settings: {
    react: {
      version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },
  ignorePatterns: ["webpack.config.js"],
  env: {
    browser: true,
    mocha: true,
    es6: true,
    commonjs: true
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/promise-function-async": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-extra-non-null-assertion": "error",

    "sonarjs/no-small-switch": "off",
    "sonarjs/prefer-immediate-return": "off",
    "sonarjs/cognitive-complexity": ["error", 20],

    "no-constructor-return": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-unneeded-ternary": "error"
  }
};
