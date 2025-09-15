import { google } from '@ai-sdk/google';
import { generateText, streamText, tool } from 'ai';
import { z } from 'zod';
import { SYSTEM_PROMPT } from './prompts.js';

// Initialize the AI agent
class AIAgent {
  private model: any;

  constructor() {
    // Initialize with Gemini (you'll need to set GOOGLE_GENERATIVE_AI_API_KEY)
    this.model = google('gemini-1.5-flash');
  }

  // Basic text generation
  async generateResponse(prompt: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.model,
        system: SYSTEM_PROMPT,
        prompt,
        maxTokens: 1000,
      });
      return text;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }

  // Streaming response for real-time interaction
  async *streamResponse(prompt: string) {
    try {
      const result = await streamText({
        model: this.model,
        system: SYSTEM_PROMPT,
        prompt,
        maxTokens: 1000,
      });

      for await (const delta of result.textStream) {
        yield delta;
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      yield 'Sorry, I encountered an error while processing your request.';
    }
  }

  // Tool calling capabilities
  async generateWithTools(prompt: string) {
    try {
      const { text, toolCalls } = await generateText({
        model: this.model,
        system: SYSTEM_PROMPT,
        prompt,
        tools: {
          getCurrentTime: tool({
            description: 'Get the current time',
            parameters: z.object({
              // Empty object but with explicit properties for Gemini compatibility
            }),
            execute: async () => {
              return { time: new Date().toISOString() };
            },
          }),
          calculate: tool({
            description: 'Perform basic mathematical calculations',
            parameters: z.object({
              expression: z.string().describe('Mathematical expression to evaluate'),
            }),
            execute: async ({ expression }) => {
              try {
                // Simple safe evaluation (in production, use a proper math parser)
                const result = Function(`"use strict"; return (${expression})`)();
                return { result: result.toString() };
              } catch (error) {
                return { error: 'Invalid mathematical expression' };
              }
            },
          }),
        },
        maxTokens: 1000,
      });

      return { text, toolCalls };
    } catch (error) {
      console.error('Error generating with tools:', error);
      return { text: 'Sorry, I encountered an error while processing your request.', toolCalls: [] };
    }
  }
}

// Create agent instance
const agent = new AIAgent();

// Example usage
async function main() {
  console.log('🤖 AI Agent is starting up...\n');

  // Check if API key is available
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('⚠️  Google Gemini API key not found!');
    console.log('Please set your GOOGLE_GENERATIVE_AI_API_KEY environment variable:');
    console.log('export GOOGLE_GENERATIVE_AI_API_KEY="your_api_key_here"');
    console.log('\n📚 The AI agent is ready to use once you add your API key!');
    console.log('\n🔧 Available features:');
    console.log('  • Basic text generation with Gemini');
    console.log('  • Streaming responses');
    console.log('  • Tool calling (time, calculations)');
    console.log('\n📖 See README.md for full setup instructions.');
    return;
  }

  // Example 1: Basic text generation
  console.log('📝 Basic Response:');
  const basicResponse = await agent.generateResponse(
    'Explain what an AI agent is in simple terms.'
  );
  console.log(basicResponse);
  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Streaming response
  console.log('🌊 Streaming Response:');
  console.log('What are the benefits of using AI agents? ');
  for await (const chunk of agent.streamResponse(
    'What are the benefits of using AI agents? List 3 key benefits.'
  )) {
    process.stdout.write(chunk);
  }
  console.log('\n\n' + '='.repeat(50) + '\n');

  // Example 3: Tool calling
  console.log('🔧 Tool Calling:');
  const toolResponse = await agent.generateWithTools(
    'What time is it right now? Also, calculate 15 * 23 + 7.'
  );
  console.log('Response:', toolResponse.text);
  if (toolResponse.toolCalls.length > 0) {
    console.log('Tools used:', toolResponse.toolCalls.map(tc => tc.toolName));
  }
}

// Run the agent
if (import.meta.main) {
  main().catch(console.error);
}

export { AIAgent };