import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ 
  size: "A4", 
  margin: 0,
  bufferPages: true 
});

const chunks = [];
doc.on("data", (chunk) => chunks.push(chunk));
doc.on("end", () => {
  const buffer = Buffer.concat(chunks);
  fs.writeFileSync("/home/ubuntu/test-output.pdf", buffer);
  console.log("PDF generated successfully! Size:", buffer.length);
});

// Simple test
doc.rect(0, 0, 595, 140).fill("#F82E52");
doc.fontSize(32).fillColor("#ffffff").text("kenlo.", 50, 45);
doc.fontSize(14).fillColor("#ffffff").text("ORÇAMENTO COMERCIAL", 50, 90);
doc.end();
