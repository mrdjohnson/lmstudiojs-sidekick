# lmstudiojs-sidekick

#### Created with LM Studio scaffold: node-typescript

Welcome to your new project! This scaffold is a starting point for building an AI-enabled Node.js project with [LM Studio](https://lmstudio.ai/) SDK. To interact with LM Studio, you should start the LM Studio local server with the command:

```bash
lms server start
```

## Running the sidekick

### Terminal:

To prepare your project for production, compile the TypeScript code to JavaScript using:

```bash
npm run dev
```

 ### Docker:

 You'll need to change `127.0.0.1` to `host.docker.internal` otherwise the client will not be able to connect (This is a replacement for localhost)
 ```bash
 docker-compose up -d
 ```

- GET /v1/models returns open ai compatible data for ALL models, as well as if they're loaded
- POST /api/load loads the requested "model"
- POST /api/unload unloads the requested "model"
- POST /v1/completions open ai compatible completion endpoint, includes the load progress and stats for a generation (does not work with images) 
