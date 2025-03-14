import js from "@eslint/js";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  react.configs.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
      "import/prefer-default-export": "off",
    },
  },
];
