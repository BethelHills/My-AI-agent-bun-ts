# AI Agent

A powerful AI agent built with Vercel AI SDK and Google Gemini, featuring streaming responses, tool calling, and multiple AI capabilities.

## Features

- 🤖 **AI Agent Class**: Modular and extensible AI agent architecture
- 🌊 **Streaming Responses**: Real-time text generation for better user experience
- 🔧 **Tool Calling**: Built-in tools for calculations, time queries, and more
- 📦 **TypeScript**: Full TypeScript support with proper type definitions
- ⚡ **Bun Runtime**: Fast execution with Bun instead of Node.js
- 🧠 **Google Gemini**: Powered by Google's advanced Gemini 1.5 Flash model

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up Google Gemini API key:**
   ```bash
   export GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key_here"
   ```
   
   Or create a `.env` file:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your API key from: https://makersuite.google.com/app/apikey

3. **Run the agent:**
   ```bash
   bun run start
   ```

4. **Try the interactive demo:**
   ```bash
   bun run demo
   ```

## Usage

The AI agent includes three main capabilities:

### Basic Text Generation
```typescript
const response = await agent.generateResponse("Your prompt here");
```

### Streaming Responses
```typescript
for await (const chunk of agent.streamResponse("Your prompt here")) {
  process.stdout.write(chunk);
}
```

### Tool Calling
```typescript
const result = await agent.generateWithTools("What time is it? Calculate 2+2.");
```

## Built-in Tools

- **getCurrentTime**: Get the current timestamp
- **calculate**: Perform mathematical calculations

## Interactive Demo

The project includes an interactive demo script (`demo.ts`) that lets you:

- Chat with the AI agent in real-time
- Try streaming responses with `stream: your message`
- Test tool calling with `tools: your message`
- Type `quit` or `exit` to end the session

## Dependencies

- `ai`: Vercel AI SDK
- `@ai-sdk/google`: Google Gemini provider
- `zod`: Schema validation for tool parameters

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
