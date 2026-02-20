import { generateReferenceDocumentPDF } from "./server/pdf/pdfReferenceDocument.ts";
import { writeFileSync } from "fs";

const buf = await generateReferenceDocumentPDF();
writeFileSync("/tmp/pricing-bible.pdf", buf);
console.log(`Pricing Bible PDF generated: ${buf.length} bytes`);
