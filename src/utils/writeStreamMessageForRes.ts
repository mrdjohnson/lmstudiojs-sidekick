import { Response } from 'express'

const writeStreamMessageForRes = (res: Response) => (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
}

export default writeStreamMessageForRes