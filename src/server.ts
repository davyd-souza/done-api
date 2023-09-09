import http, { type IncomingMessage } from 'node:http'

import { json } from './middleware/json'

export type RequestData = IncomingMessage & {
  body?: { [key: string]: string | number | boolean } | null
}

const server = http.createServer(async (req: RequestData, res) => {
  await json(req, res)

  return res.writeHead(200).end()
})

server.listen(3333)
