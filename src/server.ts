import http, { type IncomingMessage } from 'node:http'
import { routes } from './routes'

import { json } from './middleware/json'
import { csv } from './middleware/csv'

import { extractQueryParams } from './util/extract-query-params'

export type RequestData = IncomingMessage & {
  body?:
    | { [key: string]: string | number | boolean }
    | [key: string, value: string][]
    | null
  params?: { [key: string]: string }
  query?: { [key: string]: string }
}

const server = http.createServer(async (req: RequestData, res) => {
  const {
    method,
    url,
    headers: { 'content-type': contentType },
  } = req

  switch (contentType?.split(';')[0]) {
    case 'multipart/form-data':
      await csv(req, res)
      break
    default:
      await json(req, res)
      break
  }

  const route = routes.find(
    (route) => route.method === method && url && route.path.test(url),
  )

  if (route) {
    const routeParams = req.url?.match(route.path)

    const { query, ...params } = routeParams?.groups ?? {}

    req.query = extractQueryParams(query)
    req.params = params

    return route.handler(req, res)
  }

  return res.writeHead(404).end()
})

server.listen(3333)
