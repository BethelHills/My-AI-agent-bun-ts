import { AIAgent } from './index.js';
import { createInterface } from 'readline';

// Create agent instance
const agent = new AIAgent();

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Interactive demo function
async function interactiveDemo() {
  console.log('🤖 Welcome to the AI Agent Interactive Demo!\n');
  
  // Check if API key is available
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('⚠️  Google Gemini API key not found!');
    console.log('Please set your GOOGLE_GENERATIVE_AI_API_KEY environment variable:');
    console.log('export GOOGLE_GENERATIVE_AI_API_KEY="your_api_key_here"');
    console.log('\n📖 See README.md for full setup instructions.');
    rl.close();
    return;
  }

  console.log('Available commands:');
  console.log('  • Type your message for basic AI response');
  console.log('  • Type "stream:" followed by your message for streaming response');
  console.log('  • Type "tools:" followed by your message for tool calling');
  console.log('  • Type "quit" or "exit" to end the demo\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye! Thanks for trying the AI Agent!');
        rl.close();
        return;
      }

      try {
        if (input.startsWith('stream:')) {
          const prompt = input.slice(7).trim();
          console.log('AI (streaming): ');
          for await (const chunk of agent.streamResponse(prompt)) {
            process.stdout.write(chunk);
          }
          console.log('\n');
        } else if (input.startsWith('tools:')) {
          const prompt = input.slice(6).trim();
          console.log('AI (with tools): ');
          const result = await agent.generateWithTools(prompt);
          console.log(result.text);
          if (result.toolCalls.length > 0) {
            console.log(`\n🔧 Tools used: ${result.toolCalls.map(tc => tc.toolName).join(', ')}`);
          }
          console.log();
        } else {
          console.log('AI: ', await agent.generateResponse(input));
          console.log();
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
        console.log();
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Run the interactive demo
if (import.meta.main) {
  interactiveDemo().catch(console.error);
}
