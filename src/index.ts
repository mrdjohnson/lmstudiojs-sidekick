import { LLMChatHistory, LLMChatResponseOpts, LLMCompletionOpts } from "@lmstudio/sdk"
import _ from 'lodash'
import cors from 'cors'
import express from "express"

import modelHandler from './utils/modelHandler'
import writeStreamMessageForRes from './utils/writeStreamMessageForRes'

const app = express()
const port = 1235

app.use(express.json())
app.use(cors())

app.get('/v1/models', async (req, res) => {
  const loadedModels = await modelHandler.getDownloaded()
  const allModels = await modelHandler.getDownloaded()

  const loadedPathsSet = new Set(_.map(loadedModels, 'path'))

  const data = allModels.map(model => ({
    id: model.path,
    object: "model",
    owned_by: model.path.split('/')[0],
    is_pre_loaded: loadedPathsSet.has(model.path),
    ...model
  }))

  res.json({
    data,
    object: 'list'
  })
})

type LoadUnloadBody = {
  model: string
}

app.post('/api/load', async function (req, res) {
  const writeStreamMessage = writeStreamMessageForRes(res)

  res.on('close', () => {
    console.log('client dropped me')
    res.end()
  })

  try {
    const { model: modelPath } = req.body as LoadUnloadBody

    // needed to start a stream
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    await modelHandler.findModel(modelPath, loadProgress => {
      writeStreamMessage({ loadProgress })
    })

  } finally {
    res.end()
  }
})

app.post('/api/unload', async function (req, res) {
  const { model: modelPath } = req.body as LoadUnloadBody

  await modelHandler.unloadModel(modelPath)

  res.sendStatus(200)
})

type RespondBody = LLMChatResponseOpts & {
  stream?: boolean
  model: string
  messages: LLMChatHistory
}

app.post('/v1/chat/completions', async function (req, res) {
  const writeStreamMessage = writeStreamMessageForRes(res)

  res.on('close', () => {
    console.log('client dropped me')
    res.end()
  })

  try {
    const { model: modelPath, stream = true, messages, ...options } = req.body as RespondBody

    if (!stream) {
      const model = await modelHandler.findModel(modelPath)
      const { content, stats } = await model.respond(messages, options)

      res.json({ data: content, stats })

      return
    }

    // needed to start a stream
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // util method to quickly write data stream objects
    const write = (message: string, data: object = {}, finishReason: string = null) => {
      writeStreamMessage({ choices: [{ delta: { content: message } }], ...data, finishReason })
    }

    const model = await modelHandler.findModel(modelPath, loadProgress => {
      write('', { loadProgress })
    })

    const prediction = model.respond(messages, options)

    for await (const message of prediction) {
      write(message)
    }

    const { stats } = await prediction

    write('', { stats }, stats.stopReason)

  } finally {
    res.end()
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
