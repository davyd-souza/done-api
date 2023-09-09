import type { RequestData } from '@/server'
import type { ServerResponse } from 'node:http'

export async function json(req: RequestData, res: ServerResponse) {
  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString())
  } catch {
    req.body = null
  }

  res.setHeader('Content-Type', 'application/json')
}
