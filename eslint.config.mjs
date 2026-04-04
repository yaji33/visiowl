import nextConfig from "eslint-config-next";
import nextCwv from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextConfig,
  ...nextCwv,
  ...nextTypescript,
  {
    rules: {
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default config;
