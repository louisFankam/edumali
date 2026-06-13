"use client"

import { jsPDF } from "jspdf"
import { reportStyles } from "./helpers"

const FORMATS: Record<string, { width: number; height: number; margin: number; contentWidth: number }> = {
  a4: { width: 210, height: 297, margin: 10, contentWidth: 190 },
  a5: { width: 148, height: 210, margin: 8, contentWidth: 132 },
}

export async function downloadHTMLAsPDF(
  html: string,
  filename: string,
  landscape = false,
  format: "a4" | "a5" = "a4",
): Promise<void> {
  const fmt = FORMATS[format]
  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>${reportStyles}</style>
</head>
<body>${html}</body>
</html>`

  const container = document.createElement("div")
  container.innerHTML = fullHtml
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = landscape ? `${fmt.height}mm` : `${fmt.width}mm`
  document.body.appendChild(container)

  await Promise.all(
    Array.from(container.querySelectorAll("img"))
      .filter((img) => !(img as HTMLImageElement).complete)
      .map(
        (img) =>
          new Promise<void>((resolve) => {
            ;(img as HTMLImageElement).onload = () => resolve()
            ;(img as HTMLImageElement).onerror = () => resolve()
          }),
      ),
  )

  await new Promise((resolve) => requestAnimationFrame(resolve))

  const doc = new jsPDF({
    orientation: landscape ? "l" : "p",
    unit: "mm",
    format,
  })

  try {
    await doc.html(container, {
      callback: (d) => {
        d.save(filename.replace(/\.html$/, ".pdf"))
        document.body.removeChild(container)
      },
      margin: fmt.margin,
      width: landscape ? fmt.height - fmt.margin * 2 : fmt.contentWidth,
      windowWidth: landscape ? 900 : format === "a5" ? 500 : 800,
      autoPaging: "text",
    })
  } catch {
    document.body.removeChild(container)
    throw new Error("Échec de la génération du PDF")
  }
}
