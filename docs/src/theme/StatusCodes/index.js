/**
 * Swizzled from docusaurus-theme-openapi-docs/theme/StatusCodes (v5.2.0).
 *
 * Upstream renders one tab per status code via `ApiTabs`. Operations that
 * document six or seven responses overflowed into an arrow-scrolled strip, so
 * the codes are presented as a dropdown instead.
 *
 * The dropdown is deliberately plain, matching the response example picker in
 * src/theme/ResponseSchema: bare status codes, no colour coding.
 *
 * Kept deliberately:
 *  - the `Responses` heading and its anchor id, which the sidebar and deep
 *    links point at;
 *  - server-side rendering of *every* response panel, with the unselected ones
 *    carrying `hidden`. They are in the static HTML today, which is what puts
 *    the response descriptions into the local search index and makes them
 *    reachable with the browser's own find. Rendering only the selected panel
 *    would quietly drop them from both.
 */
import React, { useState } from "react";

import { translate } from "@docusaurus/Translate";
import Details from "@theme/Details";
import Heading from "@theme/Heading";
import Markdown from "@theme/Markdown";
import ResponseHeaders from "@theme/ResponseHeaders";
import ResponseSchema from "@theme/ResponseSchema";

const StatusCodes = ({ label = "Responses", id = "responses", responses }) => {
  const codes = responses ? Object.keys(responses) : [];
  const [selected, setSelected] = useState(codes[0]);

  if (!responses || codes.length === 0) return null;

  const active = codes.includes(selected) ? selected : codes[0];

  return (
    <div className="openapi-tabs__container">
      <div className="openapi-tabs__response-header-section">
        <Heading
          as="h2"
          id={id}
          className="openapi-tabs__heading openapi-tabs__response-header"
        >
          {label}
        </Heading>

        <div className="openapi-tabs__response-container">
          <select
            className="openapi-picker__select openapi-response__select"
            value={active}
            onChange={(event) => setSelected(event.target.value)}
            aria-label="Select a response status code"
          >
            {codes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="margin-top--md">
        {codes.map((code) => {
          const response = responses[code];
          const responseHeaders = response.headers;

          return (
            <div key={code} hidden={code !== active}>
              {response.description && (
                <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
                  <Markdown>{response.description}</Markdown>
                </div>
              )}

              {responseHeaders && (
                <Details
                  className="openapi-markdown__details"
                  data-collapsed={true}
                  open={false}
                  style={{ textAlign: "left", marginBottom: "1rem" }}
                  summary={
                    <summary>
                      <strong>
                        {translate({
                          id: "theme.openapi.statusCodes.responseHeaders",
                          message: "Response Headers",
                        })}
                      </strong>
                    </summary>
                  }
                >
                  <ResponseHeaders responseHeaders={responseHeaders} />
                </Details>
              )}

              <ResponseSchema
                title={translate({
                  id: "theme.openapi.statusCodes.schemaTitle",
                  message: "Schema",
                })}
                body={{ content: response.content }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusCodes;
