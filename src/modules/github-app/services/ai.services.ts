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
  files: { filename: string; patch: string }[],
): Promise<AIReviewComment[]> {
  const prompt = `
You are an expert senior software engineer performing a GitHub Pull Request code review.

Review the following GitHub diff.

Your job is to identify ONLY meaningful issues.

Focus on:

1. Bugs
2. Security vulnerabilities
3. Performance problems
4. Incorrect logic
5. Error handling problems
6. Maintainability issues

Do NOT complain about formatting or personal coding style.

For every issue, return:

- filePath: exact file path
- lineNumber: line number of the NEW/added line where the issue occurs
- severity: one of INFO, LOW, MEDIUM, HIGH
- comment: concise explanation of the problem
- suggestedFix: practical fix, or null if no fix is necessary

IMPORTANT:
- Only comment on lines that were actually added or modified.
- Do not invent files.
- Do not invent line numbers.
- If there are no meaningful issues, return an empty array.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in \`\`\`.

Expected format:

[
  {
    "filePath": "src/example.ts",
    "lineNumber": 15,
    "severity": "HIGH",
    "comment": "Description of the issue.",
    "suggestedFix": "Suggested fix."
  }
]

Here are the files:

${files
  .map((file) => `FILE: ${file.filename}\nDIFF:\n${file.patch}`)
  .join("\n\n====================\n\n")}
`;
  const result = await model.generateContent(prompt);

  const text = result.response.text();

  try {
    const clean = cleanJSON(text);
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.log("❌ JSON parse failed");
    return [];
  }
}

function cleanJSON(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}
