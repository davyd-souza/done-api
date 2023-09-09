import { randomUUID } from 'crypto'
import { Database, type Task } from './database.js'

import type { RequestData } from './server'
import type { IncomingMessage, ServerResponse } from 'http'

import { buildRoutePath } from '@/util/build-route-path.js'

type Route = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: RegExp
  handler: (
    req: RequestData,
    res: ServerResponse,
  ) => ServerResponse<IncomingMessage>
}

const database = new Database()

export const routes: Route[] = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const tasks = database.select('task')

      return res.end(JSON.stringify(tasks))
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
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
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params as {
        id: string
      }

      const { title, description } =
        (req.body as { title: string; description: string }) ?? {}

      if (req.body === null || !title || !description || !id) {
        return res.writeHead(400).end()
      }

      try {
        database.update('task', id, {
          title,
          description,
          updated_at: new Date().toString(),
        })
      } catch {
        return res.writeHead(400).end()
      }

      return res.writeHead(204).end()
    },
  },
]
