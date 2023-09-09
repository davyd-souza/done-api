import http, { type IncomingMessage } from 'node:http'
import { routes } from './routes'

import { json } from './middleware/json'

export type RequestData = IncomingMessage & {
  body?: { [key: string]: string | number | boolean } | null
  params?: { [key: string]: string | number | boolean }
}

const server = http.createServer(async (req: RequestData, res) => {
  const { method, url } = req

  await json(req, res)

  const route = routes.find(
    (route) => route.method === method && url && route.path.test(url),
  )

  if (route) {
    const routeParams = req.url?.match(route.path)

    req.params = routeParams?.groups

    return route.handler(req, res)
  }

  return res.writeHead(404).end()
})

server.listen(3333)
