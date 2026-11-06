import tseslint from "typescript-eslint";
export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".wrangler/**", "test-results/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "worker/**/*.ts", "tests/**/*.ts", "e2e/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },
);
