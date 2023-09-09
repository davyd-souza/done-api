import { randomUUID } from 'crypto'
import { Database, type Task } from './database.js'

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
  {
    method: 'POST',
    path: '/tasks',
    handler: (req, res) => {
      const { title, description } =
        (req.body as { title: string; description: string }) ?? {}

      if (req.body === null || !title || !description) {
        return res.writeHead(400).end()
      }

      const task: Task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date().toString(),
        updated_at: new Date().toString(),
        completed_at: null,
      }

      database.insert('task', task)

      return res.writeHead(201).end()
    },
  },
]
