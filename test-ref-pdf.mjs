import { generateReferenceDocumentPDF } from "./server/pdf/pdfReferenceDocument.ts";
import fs from "fs";

try {
  const buf = await generateReferenceDocumentPDF();
  console.log("Buffer size:", buf.length);
  fs.writeFileSync("/tmp/test-ref.pdf", buf);
  console.log("PDF written to /tmp/test-ref.pdf");
} catch (err) {
  console.error("Error:", err);
}
