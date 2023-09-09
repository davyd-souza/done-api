import { Database } from './database.js'

import type { RequestData } from './server'
import type { IncomingMessage, ServerResponse } from 'http'

type Route = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  handler: (
    req: RequestData,
    res: ServerResponse,
  ) => ServerResponse<IncomingMessage>
}

const database = new Database()

export const routes: Route[] = [
  {
    method: 'GET',
    path: '/tasks',
    handler: (req, res) => {
      const tasks = database.select('task')

      return res.end(JSON.stringify(tasks))
    },
  },
]
