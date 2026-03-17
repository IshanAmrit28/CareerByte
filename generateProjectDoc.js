// generateProjectDoc.js
const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  PageBreak,
} = require("docx");

// Folders to include
const includePaths = [
  "frontend/src",
  "backend/controllers",
  "backend/models",
  "backend/routes",
  "backend/middleware",
  "backend/utils",
  "backend/scripts",
  "backend/app.js",
];

// Files/folders to ignore
const ignored = [
  "node_modules",
  ".git",
  ".env",
  ".env.example",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.js",
  "vercel.json",
  ".gitignore",
  "README.md",
  "frontend/public",
];

// Recursively get all files in folder excluding ignored
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    if (ignored.includes(file)) return;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

// Escape tabs to spaces for better DOCX formatting
function escapeText(text) {
  return text.replace(/\t/g, "    ");
}

// Split code into multiple TextRun objects to preserve line breaks
function createCodeParagraph(code) {
  const lines = code.split(/\r?\n/);
  return new Paragraph({
    children: lines.map(
      (line, index) =>
        new TextRun({
          text: line,
          font: "Courier New",
          break: index > 0 ? 1 : 0,
        }),
    ),
  });
}

async function generateDoc() {
  const doc = new Document({
    creator: "Ishan Srivastava",
    title: "CareerByte Project Code",
    description: "Generated DOCX of source code for submission",
    sections: [],
  });

  const allChildren = [];

  // Title page
  allChildren.push(
    new Paragraph({
      text: "CareerByte Project Code",
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: "Generated DOCX of source code for submission",
      spacing: { after: 400 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  for (const includePath of includePaths) {
    if (!fs.existsSync(includePath)) continue;

    const stat = fs.statSync(includePath);

    if (stat.isFile()) {
      const code = fs.readFileSync(includePath, "utf8");
      allChildren.push(
        new Paragraph({
          text: includePath,
          heading: HeadingLevel.HEADING_1,
        }),
        createCodeParagraph(escapeText(code)),
        new Paragraph({ children: [new PageBreak()] }),
      );
      continue;
    }

    const files = getFiles(includePath);
    files.forEach((file) => {
      const code = fs.readFileSync(file, "utf8");
      allChildren.push(
        new Paragraph({
          text: file,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
        createCodeParagraph(escapeText(code)),
        new Paragraph({ children: [new PageBreak()] }),
      );
    });
  }

  // Add one section with all content
  doc.addSection({ children: allChildren });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("CareerByte_Code_Submission.docx", buffer);
  console.log(
    "✅ DOCX generated successfully: CareerByte_Code_Submission.docx",
  );
}

generateDoc();
