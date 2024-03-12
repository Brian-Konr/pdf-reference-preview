console.log("background.js loaded");

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    console.log("Intercepted URL: ", url);

    if (url.endsWith(".pdf")) {
      console.log("PDF URL intercepted: " + url);
      // Store the URL using the request ID as a key for uniqueness
      chrome.storage.local.set({ [details.requestId]: url });
    }
  },
  { urls: ["https://*.arxiv.org/*.pdf"] } // This pattern targets PDFs on arxiv.org
);
