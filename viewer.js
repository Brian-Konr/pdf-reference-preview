import {
  getDocument,
  GlobalWorkerOptions,
  renderTextLayer,
} from "./lib/pdfjs/pdf.mjs";

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");

document.getElementById("pdf-render").appendChild(canvas);

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function (page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
    }).then(function () {
      // Returns a promise, on resolving it will return text contents of the page
      return page.getTextContent();
    }).then(function (textContent) {
      var textLayerDiv = document.createElement("div");
      textLayerDiv.className = "textLayer";
      textLayerDiv.style.position = "absolute"; // Add this line
      textLayerDiv.style.left = `${canvas.offsetLeft}px`;
      textLayerDiv.style.top = `${canvas.offsetTop}px`;
      textLayerDiv.style.height = `${canvas.offsetHeight}px`;
      textLayerDiv.style.width = `${canvas.offsetWidth}px`;
      document.getElementById("pdf-render").appendChild(textLayerDiv);

      renderTextLayer({
        textContent: textContent,
        container: textLayerDiv,
        viewport: viewport,
        textDivs: [],
      });
    });
  });

  document.getElementById("page-num").textContent = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

document.addEventListener("DOMContentLoaded", () => {
  GlobalWorkerOptions.workerSrc = "./lib/pdfjs/pdf.worker.mjs";

  chrome.storage.local.get(["lastRequestId"], function (result) {
    const lastRequestId = result.lastRequestId;
    chrome.storage.local.get([lastRequestId], function (result) {
        const pdfUrl = result[+lastRequestId];
        console.log("PDF URL: ", pdfUrl);
        getDocument(pdfUrl).promise.then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById("page-count").textContent = pdfDoc.numPages;
            renderPage(pageNum);
        });
    });
  });

    // Attach event listeners to buttons
    document.getElementById("prev").addEventListener("click", onPrevPage);
    document.getElementById("next").addEventListener("click", onNextPage);
  
});
