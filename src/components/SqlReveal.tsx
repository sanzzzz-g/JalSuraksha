interface SqlRevealProps {
  sql: string;
  label?: string;
  variant?: "inline" | "button";
  className?: string;
}

/**
 * SqlReveal — intentionally hidden from the live UI.
 *
 * The SQL strings are still constructed and passed in via props throughout
 * the codebase (see `src/lib/explainSQL.ts` and call sites in
 * `src/pages/Dashboard.tsx`, `src/pages/Predict.tsx`) so they remain
 * available for code review / project documentation, but they are NOT
 * rendered to end users to avoid leaking schema details.
 *
 * To re-enable for an internal/dev view, restore the original render logic.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SqlReveal = (_props: SqlRevealProps) => null;

export default SqlReveal;
