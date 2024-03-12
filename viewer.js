// Dynamically import PDF.js
import { getDocument, GlobalWorkerOptions } from "./lib/pdfjs/pdf.mjs";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content loaded");

  GlobalWorkerOptions.workerSrc = "./lib/pdfjs/pdf.worker.mjs";

  // Retrieve the stored PDF URL
  chrome.storage.local.get(["pdfUrl"], function (result) {
    const pdfUrl = result.pdfUrl || "https://arxiv.org/pdf/2304.14856.pdf";
    console.log("PDF URL: " + pdfUrl);

    if (pdfUrl) {
      const loadingTask = getDocument(pdfUrl);
      loadingTask.promise.then(
        function (pdf) {
          console.log("PDF loaded");

          // Get the first page
          let numPages = pdf.numPages;
          for (let i = 1; i <= numPages; i++) {
              pdf.getPage(i).then(function (page) {
                var scale = 1.5; // Scale the page to fit the viewer
                var viewport = page.getViewport({ scale: scale });

                // Prepare canvas using PDF page dimensions
                var canvas = document.createElement("canvas");
                canvas.style.display = "block"; // Ensures each canvas is on a new line
                canvas.style.margin = "auto"; // Centers the canvas horizontally
                var context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                  canvasContext: context,
                  viewport: viewport,
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                  // Append canvas to the container
                  document.getElementById("pdf-render").appendChild(canvas);
                });
              });
          }
        },
        function (reason) {
          console.error(reason);
        }
      );
    }
  });
});
