# lmstudiojs-sidekick

#### Created with LM Studio scaffold: node-typescript

Welcome to your new project! This scaffold is a starting point for building an AI-enabled Node.js project with [LM Studio](https://lmstudio.ai/) SDK. To interact with LM Studio, you should start the LM Studio local server with the command:

```bash
lms server start
```

## Getting Started

### Development

The source code resides in the `src/` directory. For development purposes, you can run the project using:

```start
npm start
```

### Building for Production

To prepare your project for production, compile the TypeScript code to JavaScript using:

```bash
npm run build
```

- GET /v1/models returns open ai compatible data for ALL models, as well as if they're loaded
- POST /api/load loads the requested "model"
- POST /api/unload unloads the requested "model"
- POST /v1/completions open ai compatible completion endpoint, includes the load progress and stats for a generation (does not work with images) 
