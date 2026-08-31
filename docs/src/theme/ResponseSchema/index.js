/**
 * Swizzled from docusaurus-theme-openapi-docs/theme/ResponseSchema (v5.2.0).
 *
 * Two changes against the upstream component:
 *
 *  1. The auto-generated "Example (auto)" tab is not rendered. Every operation
 *     in our spec ships hand-written examples, so the sampled-from-schema one
 *     was noise.
 *  2. Named `examples` no longer become one tab each. A status code with five
 *     documented causes produced a tab strip that had to be scrolled with
 *     arrows; they now collapse into a single "Example" tab with a dropdown to
 *     pick between them.
 *
 * Everything else tracks upstream: the mime tabs, the "No schema" branch, the
 * SchemaExpansion control in the summary, the translated strings, and the
 * single `example` case. Re-check this file when bumping the theme.
 */
import React, { useState } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import { translate } from "@docusaurus/Translate";
import CodeSamples from "@theme/CodeSamples";
import Details from "@theme/Details";
import Markdown from "@theme/Markdown";
import MimeTabs from "@theme/MimeTabs";
import Schema from "@theme/Schema";
import SchemaExpansion from "@theme/SchemaExpansion";
import SchemaTabs from "@theme/SchemaTabs";
import SkeletonLoader from "@theme/SkeletonLoader";
import TabItem from "@theme/TabItem";

function languageFor(mimeType) {
  if (mimeType.endsWith("json")) return "json";
  if (mimeType.endsWith("xml")) return "xml";
  return "shell";
}

function formatExample(value) {
  if (value === undefined || value === null) return "";
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
}

/**
 * Renders the named `examples` of a media type: a dropdown to choose one, then
 * that example's summary and body. With a single example the dropdown would be
 * a control with nothing to choose, so its name is shown as a caption instead.
 */
function ExamplePicker({ examples, mimeType }) {
  const names = Object.keys(examples);
  const [selected, setSelected] = useState(names[0]);
  const current = examples[selected] ?? examples[names[0]];

  return (
    <div className="openapi-example__picker">
      {names.length > 1 ? (
        <label className="openapi-example__picker-label">
          <span className="openapi-example__picker-caption">Example</span>
          <select
            className="openapi-picker__select openapi-example__picker-select"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="openapi-example__picker-caption">{names[0]}</div>
      )}

      {current?.summary && (
        <Markdown className="openapi-example__summary">{current.summary}</Markdown>
      )}

      <CodeSamples
        example={formatExample(current?.value)}
        language={languageFor(mimeType)}
      />
    </div>
  );
}

/** Renders the single unnamed `example` of a media type. */
function SingleExample({ example, mimeType }) {
  return (
    <>
      {example.summary && (
        <Markdown className="openapi-example__summary">{example.summary}</Markdown>
      )}
      <CodeSamples example={formatExample(example)} language={languageFor(mimeType)} />
    </>
  );
}

const ResponseSchemaComponent = ({ title, body, style }) => {
  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return null;
  }

  const mimeTypes = Object.keys(body.content);
  if (!mimeTypes.length) {
    return undefined;
  }

  return (
    <MimeTabs className="openapi-tabs__mime" schemaType="response">
      {mimeTypes.map((mimeType) => {
        const mediaTypeObject = body.content?.[mimeType];
        const responseExamples = mediaTypeObject?.examples;
        const responseExample = mediaTypeObject?.example;
        const firstBody = mediaTypeObject?.schema;

        if (
          !firstBody ||
          (firstBody.properties && Object.keys(firstBody.properties).length === 0)
        ) {
          return (
            <TabItem key={mimeType} label={mimeType} value={mimeType}>
              <div>
                {translate({ id: "theme.openapi.schema.noSchema", message: "No schema" })}
              </div>
            </TabItem>
          );
        }

        return (
          <TabItem key={mimeType} label={mimeType} value={mimeType}>
            <SchemaTabs className="openapi-tabs__schema">
              <TabItem key={title} label={title} value={title}>
                <Details
                  className="openapi-markdown__details response"
                  data-collapsed={false}
                  open={true}
                  style={style}
                  summary={
                    <summary className="openapi-markdown__details-summary--with-control">
                      <strong className="openapi-markdown__details-summary-response">
                        {title}
                        {body.required === true && (
                          <span className="openapi-schema__required">
                            {translate({
                              id: "theme.openapi.schemaItem.required",
                              message: "required",
                            })}
                          </span>
                        )}
                      </strong>
                      <SchemaExpansion />
                    </summary>
                  }
                >
                  <div style={{ textAlign: "left", marginLeft: "1rem" }}>
                    {body.description && (
                      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                        <Markdown>{body.description}</Markdown>
                      </div>
                    )}
                  </div>
                  <ul style={{ marginLeft: "1rem" }}>
                    <Schema schema={firstBody} schemaType="response" />
                  </ul>
                </Details>
              </TabItem>

              {responseExamples && (
                <TabItem key="Example" label="Example" value="Example">
                  <ExamplePicker examples={responseExamples} mimeType={mimeType} />
                </TabItem>
              )}

              {!responseExamples && responseExample && (
                <TabItem key="Example" label="Example" value="Example">
                  <SingleExample example={responseExample} mimeType={mimeType} />
                </TabItem>
              )}
            </SchemaTabs>
          </TabItem>
        );
      })}
    </MimeTabs>
  );
};

const ResponseSchema = (props) => {
  return (
    <BrowserOnly fallback={<SkeletonLoader size="md" />}>
      {() => <ResponseSchemaComponent {...props} />}
    </BrowserOnly>
  );
};

export default ResponseSchema;
