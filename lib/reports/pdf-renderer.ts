"use client"

import { jsPDF } from "jspdf"
import { reportStyles } from "./helpers"

export async function downloadHTMLAsPDF(
  html: string,
  filename: string,
  landscape = false,
): Promise<void> {
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
  container.style.width = landscape ? "297mm" : "210mm"
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
    format: "a4",
  })

  try {
    await doc.html(container, {
      callback: (d) => {
        d.save(filename.replace(/\.html$/, ".pdf"))
        document.body.removeChild(container)
      },
      margin: [10, 10, 10, 10],
      width: landscape ? 277 : 190,
      windowWidth: landscape ? 1200 : 800,
      autoPaging: "text",
    })
  } catch {
    document.body.removeChild(container)
    throw new Error("Échec de la génération du PDF")
  }
}
