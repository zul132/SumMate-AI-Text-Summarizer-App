// Creating references to each interactive HTML element
const textArea = document.getElementById("text_to_summarize");
const submitButton = document.getElementById("submit-button");
const summarizedTextArea = document.getElementById("summary");

submitButton.disabled = true;

textArea.addEventListener("input", verifyTextLength);
submitButton.addEventListener("click", submitData);

function verifyTextLength(e) {
  // The e.target property gives us the HTML element that triggered the event, which in this case is the textarea. We save this to a variable called 'textarea'
  const textarea = e.target;

  // Verify the TextArea value.
  if (textarea.value.length > 200 && textarea.value.length < 100000) {
    // Enable the button when text area has value.
    submitButton.disabled = false;
  } else {
    // Disable the button when text area is empty.
    submitButton.disabled = true;
  }
}

function submitData(e) {

  // This is used to add animation to the submit button
  submitButton.classList.add("submit-button--loading");

  const text_to_summarize = textArea.value;

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "text_to_summarize": text_to_summarize
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  // Send the text to the server using fetch API

  // Note - here we can omit the “baseUrl” we needed in Postman and just use a relative path to “/summarize” because we will be calling the API from our Replit!  
  fetch('/summarize', requestOptions)
    .then(response => response.text()) // Response will be summarized text
    .then(summary => {
      // Do something with the summary response from the back end API!

      // Update the output text area with new summary
      summarizedTextArea.value = summary;

      // Stop the spinning loading animation
      submitButton.classList.remove("submit-button--loading");
    })
    .catch(error => {
      console.log(error.message);
    });
}

/* Add a functionality to upload documents in .txt, .pdf, and .docx format. Extract text from the doc and put it in the input text area. */
document.getElementById("file-input").addEventListener("change", async function(event) {
  const file = event.target.files[0];

  if (!file) {
    alert("Please upload a valid file.");
    return;
  }

  // Handle file type
  const fileType = file.name.split('.').pop().toLowerCase();

  if (fileType === "txt") {
    // Read text files
    const reader = new FileReader();
    reader.onload = function(e) {
      textArea.value = e.target.result;
    };
    reader.readAsText(file);
  } else if (fileType === "pdf") {
    // Use pdf-lib for PDFs
    const pdfLib = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const text = pages.map(page => page.getTextContent()).join("\n");
    textArea.value = text;
  } else if (fileType === "docx") {
    // Use mammoth.js for Word documents
    const mammoth = await import('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js');
    const arrayBuffer = await file.arrayBuffer();
    mammoth.extractRawText({ arrayBuffer: arrayBuffer })
      .then(result => {
        textArea.value = result.value;
      })
      .catch(err => alert("Error reading Word document: " + err.message));
  } else {
    alert("Unsupported file type. Please upload a .txt, .pdf, or .docx file.");
  }
});
