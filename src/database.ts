import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export type Task = {
  id: string
  title: string
  description: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

type DatabaseTable = {
  task: Task[]
}

type TableKeys = keyof DatabaseTable

export class Database {
  #database = {} as DatabaseTable

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then((data) => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table: TableKeys) {
    const data = this.#database[table] ?? []

    return data
  }

  insert(table: TableKeys, data: Task) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()
  }

  update(
    table: TableKeys,
    id: string,
    data: Omit<Task, 'id' | 'created_at' | 'completed_at'>,
  ) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      const { created_at: createdAt, completed_at: completedAt } =
        this.#database[table][rowIndex]

      this.#database[table][rowIndex] = {
        id,
        created_at: createdAt,
        completed_at: completedAt,
        ...data,
      }
      this.#persist()
    } else {
      throw new Error()
    }
  }

  delete(table: TableKeys, id: string) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}
