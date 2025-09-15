import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

const commitMessage = z.object({
  changes: z.string().describe("Description of the changes made"),
  type: z.enum(["feat", "fix", "docs", "style", "refactor", "test", "chore"]).describe("Type of commit"),
});

const markdownOutput = z.object({
  content: z.string().describe("The markdown content to write"),
  filename: z.string().describe("The filename for the markdown file"),
  directory: z.string().optional().describe("The directory to write the file to (defaults to current directory)"),
});

type FileChange = z.infer<typeof fileChange>;
type CommitMessage = z.infer<typeof commitMessage>;
type MarkdownOutput = z.infer<typeof markdownOutput>;

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

async function generateCommitMessage({ changes, type }: CommitMessage) {
  const timestamp = new Date().toISOString();
  const commitTypes = {
    feat: "✨ New feature",
    fix: "🐛 Bug fix", 
    docs: "📚 Documentation",
    style: "💄 Code style",
    refactor: "♻️ Code refactoring",
    test: "🧪 Testing",
    chore: "🔧 Maintenance"
  };
  
  const emoji = commitTypes[type] || "📝";
  const shortDescription = changes.length > 50 ? changes.substring(0, 47) + "..." : changes;
  
  return {
    message: `${emoji} ${type}: ${shortDescription}`,
    fullMessage: `${emoji} ${type}: ${changes}\n\nGenerated on: ${timestamp}`,
    type,
    changes
  };
}

async function writeMarkdownFile({ content, filename, directory = "." }: MarkdownOutput) {
  try {
    const targetDir = directory === "." ? process.cwd() : directory;
    
    // Ensure directory exists
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = join(targetDir, filename.endsWith('.md') ? filename : `${filename}.md`);
    writeFileSync(filePath, content, 'utf8');
    
    return {
      success: true,
      filePath,
      message: `Markdown file written successfully to ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to write markdown file'
    };
  }
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

export const generateCommitMessageTool = tool({
  description: "Generates a conventional commit message based on changes",
  inputSchema: commitMessage,
  execute: generateCommitMessage,
});

export const writeMarkdownFileTool = tool({
  description: "Writes content to a markdown file",
  inputSchema: markdownOutput,
  execute: writeMarkdownFile,
});
