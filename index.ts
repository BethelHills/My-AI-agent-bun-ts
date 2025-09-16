import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";

import { SYSTEM_PROMPT } from "./prompts";
import { 
  getFileChangesInDirectoryTool, 
  generateCommitMessageTool, 
  writeMarkdownFileTool,
  analyzeCodeQualityTool,
  readFileTool
} from "./tools";

const codeReviewAgent = async (prompt: string) => {
  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    prompt,
    system: SYSTEM_PROMPT,
    tools: {
      getFileChangesInDirectoryTool: getFileChangesInDirectoryTool,
      generateCommitMessageTool: generateCommitMessageTool,
      writeMarkdownFileTool: writeMarkdownFileTool,
      analyzeCodeQualityTool: analyzeCodeQualityTool,
      readFileTool: readFileTool,
    },
    stopWhen: stepCountIs(10),
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Specify which directory the code review agent should review changes in your prompt
await codeReviewAgent(
  "Please read and review the refactored files: 'src/types/dashboard.types.ts', 'src/services/metricsService.ts', 'src/components/MetricsCard.tsx', and '.ai-rules.md'. Analyze the improvements made to type safety (removing 'any' types), performance (cleanup functions), and code quality (externalized CSS classes). Provide a final quality score and confirm the refactoring was successful.",
);
