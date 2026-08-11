// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export const model = genAI.getGenerativeModel({
//   model: "gemini-3.6-flash",
// });

// type AIReviewComment = {
//   filePath: string;
//   lineNumber: number;
//   severity: "INFO" | "LOW" | "MEDIUM" | "HIGH";
//   comment: string;
//   suggestedFix: string | null;
// };

// export async function analyzeCodeWithAI(
//   files: {
//     filename: string;
//     changedLines: {
//       lineNumber: number;
//       content: string;
//     }[];
//   }[],
// ): Promise<AIReviewComment[]> {
//   const prompt = `
// You are a senior software engineer reviewing a GitHub Pull Request.

// Review ONLY the changed lines provided below.

// For every meaningful issue, return:

// - filePath
// - lineNumber
// - severity: INFO | LOW | MEDIUM | HIGH
// - comment
// - suggestedFix

// IMPORTANT:
// - lineNumber MUST be one of the line numbers provided.
// - NEVER invent a line number.
// - Only report issues on changed lines.
// - If there are no meaningful issues, return [].
// - Return ONLY valid JSON.

// Expected format:

// [
//   {
//     "filePath": "src/example.ts",
//     "lineNumber": 25,
//     "severity": "MEDIUM",
//     "comment": "Description of the issue.",
//     "suggestedFix": "Suggested fix."
//   }
// ]

// FILES:

// ${files
//   .map(
//     (file) => `
// FILE: ${file.filename}

// ${file.changedLines
//   .map((line) => `${line.lineNumber}: ${line.content}`)
//   .join("\n")}
// `,
//   )
//   .join("\n========================\n")}
// `;
//   const result = await model.generateContent(prompt);

//   const text = result.response.text();

//   try {
//     const clean = cleanJSON(text);
//     const parsed = JSON.parse(clean);
//     return parsed;
//   } catch (err) {
//     console.log("❌ JSON parse failed");
//     return [];
//   }
// }

// function cleanJSON(text: string) {
//   return text
//     .replace(/```json/g, "")
//     .replace(/```/g, "")
//     .trim();
// }

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

type AIReviewComment = {
  filePath: string;
  lineNumber: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH";
  comment: string;
  suggestedFix: string | null;
};

export async function analyzeCodeWithAI(
  files: {
    filename: string;
    changedLines: {
      lineNumber: number;
      content: string;
    }[];
  }[],
): Promise<AIReviewComment[]> {
  const prompt = `
You are a senior software engineer reviewing a GitHub Pull Request.

Review ONLY the changed lines provided below.

Look for meaningful issues such as:

- Bugs
- Incorrect logic
- Security vulnerabilities
- Performance problems
- Error handling problems
- Reliability problems
- Maintainability problems

Do NOT complain about formatting or personal coding style.

For every meaningful issue, return:

- filePath
- lineNumber
- severity: INFO | LOW | MEDIUM | HIGH
- comment
- suggestedFix

IMPORTANT RULES:

1. lineNumber MUST be one of the line numbers provided.
2. NEVER invent a line number.
3. Only report issues on changed lines.
4. filePath MUST exactly match one of the provided filenames.
5. Do not report the same issue multiple times.
6. If there are no meaningful issues, return [].
7. Return ONLY valid JSON.
8. Do NOT use markdown code fences.

Expected format:

[
  {
    "filePath": "src/example.ts",
    "lineNumber": 25,
    "severity": "MEDIUM",
    "comment": "Description of the issue.",
    "suggestedFix": "Suggested fix."
  }
]

FILES:

${files
  .map(
    (file) => `
FILE: ${file.filename}

${file.changedLines
  .map((line) => `${line.lineNumber}: ${line.content}`)
  .join("\n")}
`,
  )
  .join("\n========================\n")}
`;

  const result = await model.generateContent(prompt);

  const text = result.response.text();

  console.log("🤖 Raw Gemini response:");
  console.log(text);

  try {
    const clean = cleanJSON(text);

    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini response is not an array");
    }

    return parsed as AIReviewComment[];
  } catch (error) {
    console.error("❌ JSON parse failed:", error);

    return [];
  }
}

function cleanJSON(text: string): string {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}
