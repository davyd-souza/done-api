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
      const { search } = req.query as { search: string }

      const searchQuery = search
        ? {
            title: search,
            description: search,
          }
        : null

      const tasks = database.select('task', searchQuery)

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
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params as { id: string }

      if (id === undefined) {
        return res.writeHead(400).end()
      }

      try {
        database.delete('task', id)
      } catch {
        return res.writeHead(400).end()
      }

      return res.writeHead(204).end()
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params as { id: string }
      try {
        database.toggle('task', id)
      } catch {
        return res.writeHead(400).end(
          JSON.stringify({
            code: 'register_not_found',
            message: 'Register not found',
          }),
        )
      }

      return res.writeHead(204).end()
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/import'),
    handler: (req, res) => {
      const tasks = req.body

      if (Array.isArray(tasks)) {
        for (const [title, description] of tasks) {
          fetch('http://localhost:3333/tasks', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
          })
        }
      }

      return res.writeHead(201).end()
    },
  },
]
