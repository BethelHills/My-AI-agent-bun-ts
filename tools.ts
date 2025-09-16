import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
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

const codeQualityAnalysis = z.object({
  codeContent: z.string().describe("The code content to analyze"),
  language: z.string().optional().describe("Programming language (defaults to typescript)"),
});

const fileRead = z.object({
  filePath: z.string().describe("The path to the file to read"),
});

type FileChange = z.infer<typeof fileChange>;
type CommitMessage = z.infer<typeof commitMessage>;
type MarkdownOutput = z.infer<typeof markdownOutput>;
type CodeQualityAnalysis = z.infer<typeof codeQualityAnalysis>;
type FileRead = z.infer<typeof fileRead>;

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

async function analyzeCodeQuality({ codeContent, language = "typescript" }: CodeQualityAnalysis) {
  /**
   * Analyzes code quality and provides comprehensive scoring
   * @param codeContent - The code to analyze
   * @param language - Programming language (defaults to typescript)
   * @returns Object with quality scores, metrics, and suggestions
   */
  
  // Basic code quality analysis
  const lines = codeContent.split('\n');
  const totalLines = lines.length;
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
  const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length;
  
  // Calculate basic metrics
  const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;
  const emptyLineRatio = totalLines > 0 ? ((totalLines - nonEmptyLines) / totalLines) * 100 : 0;
  
  // Analyze code structure
  const hasImports = codeContent.includes('import ');
  const hasExports = codeContent.includes('export ');
  const hasFunctions = codeContent.includes('function ') || codeContent.includes('=>');
  const hasClasses = codeContent.includes('class ');
  const hasInterfaces = codeContent.includes('interface ');
  const hasTypes = codeContent.includes('type ');
  
  // Security checks (exclude analysis code itself)
  const isAnalysisCode = codeContent.includes('analyzeCodeQuality') || codeContent.includes('codeQualityAnalysis');
  const hasConsoleLog = codeContent.includes('console.log') && !isAnalysisCode;
  const hasEval = codeContent.includes('eval(') && !isAnalysisCode;
  const hasInnerHTML = codeContent.includes('.innerHTML') && !isAnalysisCode;
  
  // Calculate quality scores (1-10 scale)
  // Readability: Based on comment ratio, empty lines, and imports
  const readabilityScore = Math.min(10, Math.max(1, 
    10 - (emptyLineRatio / 10) + (commentRatio / 5) + (hasImports ? 1 : 0)
  ));
  
  // Maintainability: Based on code structure and modularity
  const maintainabilityScore = Math.min(10, Math.max(1,
    5 + (hasExports ? 1 : 0) + (hasFunctions ? 1 : 0) + (hasClasses ? 1 : 0) + 
    (hasInterfaces ? 1 : 0) + (hasTypes ? 1 : 0)
  ));
  
  // Security: Penalizes dangerous patterns
  const securityScore = Math.min(10, Math.max(1,
    10 - (hasEval ? 5 : 0) - (hasInnerHTML ? 3 : 0) - (hasConsoleLog ? 1 : 0)
  ));
  
  // Performance: Penalizes console.log and eval usage
  const performanceScore = Math.min(10, Math.max(1,
    8 - (hasConsoleLog ? 2 : 0) - (hasEval ? 5 : 0)
  ));
  
  const overallScore = (readabilityScore + maintainabilityScore + securityScore + performanceScore) / 4;
  
  // Generate suggestions
  const suggestions = [];
  if (commentRatio < 10) suggestions.push("Consider adding more comments for better documentation");
  if (emptyLineRatio > 30) suggestions.push("Reduce excessive empty lines for better readability");
  if (!hasExports) suggestions.push("Consider adding exports for better modularity");
  if (hasEval) suggestions.push("Remove eval() usage for security reasons");
  if (hasConsoleLog) suggestions.push("Remove console.log statements for production code");
  if (hasInnerHTML) suggestions.push("Use textContent instead of innerHTML for security");
  
  return {
    overallScore: Math.round(overallScore * 10) / 10,
    breakdown: {
      readability: Math.round(readabilityScore * 10) / 10,
      maintainability: Math.round(maintainabilityScore * 10) / 10,
      security: Math.round(securityScore * 10) / 10,
      performance: Math.round(performanceScore * 10) / 10
    },
    metrics: {
      totalLines,
      nonEmptyLines,
      commentLines,
      commentRatio: Math.round(commentRatio * 10) / 10,
      emptyLineRatio: Math.round(emptyLineRatio * 10) / 10
    },
    structure: {
      hasImports,
      hasExports,
      hasFunctions,
      hasClasses,
      hasInterfaces,
      hasTypes
    },
    security: {
      hasConsoleLog,
      hasEval,
      hasInnerHTML
    },
    suggestions,
    grade: overallScore >= 8 ? 'A' : overallScore >= 6 ? 'B' : overallScore >= 4 ? 'C' : 'D'
  };
}

async function readFile({ filePath }: FileRead) {
  try {
    const content = readFileSync(filePath, 'utf8');
    return {
      success: true,
      content,
      filePath,
      message: `Successfully read file: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Failed to read file: ${filePath}`
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

export const analyzeCodeQualityTool = tool({
  description: "Analyzes code quality and provides scoring with suggestions",
  inputSchema: codeQualityAnalysis,
  execute: analyzeCodeQuality,
});

export const readFileTool = tool({
  description: "Reads the content of a file",
  inputSchema: fileRead,
  execute: readFile,
});
