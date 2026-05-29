"use client"

import Script from "next/script"

export function SwaggerDocs() {
  return (
    <>
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = window as any
          if (w.SwaggerUIBundle) {
            w.SwaggerUIBundle({
              url: "/api/docs",
              dom_id: "#swagger-ui",
              presets: [w.SwaggerUIBundle.presets.apis, w.SwaggerUIBundle.SwaggerUIStandalonePreset],
              layout: "BaseLayout",
            })
          }
        }}
      />
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <div id="swagger-ui" style={{ minHeight: "100vh" }} />
    </>
  )
}
