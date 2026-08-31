/**
 * Swizzled from docusaurus-theme-openapi-docs/theme/ResponseExamples (v5.2.0),
 * wrapping the original rather than replacing it.
 *
 * `ExampleFromSchema` renders the "Example (auto)" tab: a fake payload sampled
 * from the schema. Every request body and response in our spec ships a
 * hand-written example, so the sampled one is redundant.
 *
 * It is stubbed out here rather than in the callers because v5 calls it from
 * two places — `RequestSchema` (new in v5) and `ResponseSchema`. Overriding the
 * single source keeps both free of it without a second large swizzle.
 *
 * The other exports pass straight through to the original implementation.
 */
export {
  ResponseExamples,
  ResponseExample,
  json2xml,
} from "@theme-original/ResponseExamples";

export const ExampleFromSchema = () => null;
