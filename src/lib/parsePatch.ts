// export type ChangedLine = {
//   lineNumber: number;
//   content: string;
// };

// export function parsePatch(patch: string): ChangedLine[] {
//   const lines = patch.split("\n");

//   const changedLines: ChangedLine[] = [];

//   let newLineNumber = 0;

//   for (const line of lines) {
//     // Example:
//     // @@ -66,6 +66,13 @@
//     const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

//     if (match) {
//       // Starting line number in the NEW file
//       newLineNumber = Number(match[1]);
//       continue;
//     }

//     // Ignore lines before the first hunk header
//     if (newLineNumber === 0) {
//       continue;
//     }

//     // Added line
//     if (line.startsWith("+") && !line.startsWith("+++")) {
//       changedLines.push({
//         lineNumber: newLineNumber,
//         content: line.substring(1),
//       });

//       newLineNumber++;
//       continue;
//     }

//     // Deleted line
//     if (line.startsWith("-") && !line.startsWith("---")) {
//       // Deleted lines don't exist in the new file,
//       // so don't increment newLineNumber.
//       continue;
//     }

//     // Context / unchanged line
//     newLineNumber++;
//   }

//   return changedLines;
// }

export type ChangedLine = {
  lineNumber: number;
  content: string;
};

export function parsePatch(patch: string): ChangedLine[] {
  const lines = patch.split("\n");

  const changedLines: ChangedLine[] = [];

  let newLineNumber: number | null = null;

  for (const line of lines) {
    // Example:
    // @@ -66,6 +66,13 @@
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

    if (hunkMatch) {
      newLineNumber = Number(hunkMatch[1]);
      continue;
    }

    // Ignore anything before the first hunk
    if (newLineNumber === null) {
      continue;
    }

    // Added line
    if (line.startsWith("+") && !line.startsWith("+++")) {
      changedLines.push({
        lineNumber: newLineNumber,
        content: line.slice(1),
      });

      newLineNumber++;
      continue;
    }

    // Deleted line
    if (line.startsWith("-") && !line.startsWith("---")) {
      // Deleted line belongs to old file.
      // Don't increment the new-file line number.
      continue;
    }

    // Context line
    newLineNumber++;
  }

  return changedLines;
}
