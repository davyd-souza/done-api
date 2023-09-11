import type { RequestData } from '@/server'
import type { ServerResponse } from 'node:http'

import { parse } from 'csv-parse/sync'

export async function csv(req: RequestData, res: ServerResponse) {
  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  const data = Buffer.concat(buffers)

  const boundary = req.headers['content-type']?.split('boundary=')[1]

  if (boundary) {
    const csvStart = data.indexOf('text/csv') + 12
    const csvEnd = data.indexOf(boundary, csvStart) - 4

    const csvData = data.subarray(csvStart, csvEnd)

    try {
      req.body = parse(csvData, { delimiter: ',', from_line: 2 })
    } catch {
      req.body = null
    }
  }

  res.setHeader('Content-Type', 'application/json')
}
