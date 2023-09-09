import http, { type IncomingMessage } from 'node:http'
import { routes } from './routes'

import { json } from './middleware/json'

export type RequestData = IncomingMessage & {
  body?: { [key: string]: string | number | boolean } | null
}

const server = http.createServer(async (req: RequestData, res) => {
  const { method, url } = req

  await json(req, res)

  const route = routes.find(
    (route) => route.method === method && route.path === url,
  )

  if (route) {
    return route.handler(req, res)
  }

  return res.writeHead(404).end()
})

server.listen(3333)
