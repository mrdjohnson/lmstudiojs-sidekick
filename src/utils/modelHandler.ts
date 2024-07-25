
import { LLMDescriptor, LLMLoadModelOpts, LMStudioClient } from '@lmstudio/sdk'
import _ from 'lodash'

//  NOTE: if you're using a different port or url, change it here (needs to be a web socket)
// NOTE: for docker this needs to be `host.docker.internal:1234` (whatever port)
const client = new LMStudioClient({ baseUrl: 'ws://127.0.0.1:1234' })

class ModelHandler {
    getLoaded = async () => {
        return await client.llm.listLoaded()
    }

    getDownloaded = async () => {
        return await client.system.listDownloadedModels()
    }

    // simplified version:
    // if a model with this path exists: use it
    // if a model with this path has been downloaded, load and use that
    findModel = async (
        modelPath: string,
        handleLoadProgress: LLMLoadModelOpts['onProgress'] = _.noop
    ) => {
        const loadedModels = await client.llm.listLoaded()

        const preLoadedModel: LLMDescriptor = _.find(loadedModels, { path: modelPath })

        if (preLoadedModel) {
            return await client.llm.get({ identifier: preLoadedModel.identifier })
        }

        let lastLoadPercent = 0

        console.log('loading model path:', modelPath)

        const loadedModel = await client.llm.load(modelPath, {
            // send the exact integer load percentage out of 100
            onProgress: progress => {
                const loadPercentage = Math.trunc(progress * 100)

                if (loadPercentage !== lastLoadPercent) {
                    handleLoadProgress(lastLoadPercent)
                }

                lastLoadPercent = loadPercentage
            }
        })

        handleLoadProgress(100)

        return loadedModel
    }

    unloadModel = async (modelPath: string) => {
        await client.llm.unload(modelPath)
    }
}

export default new ModelHandler()