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
  "Review the feature plan in 'feature-plan.md' and provide detailed feedback on the architecture, function signatures, security considerations, and performance considerations. Suggest improvements and identify potential issues. Also analyze the overall design quality and provide a quality score for the planning document.",
);
