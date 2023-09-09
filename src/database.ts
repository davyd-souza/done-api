import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export type Task = {
  id: string
  title: string
  description: string
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

  select(table: TableKeys, search: Pick<Task, 'title' | 'description'> | null) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter((row) =>
        Object.entries(search).some(([key, value]) =>
          // @ts-expect-error ts(7053)
          row[key].toLowerCase().includes(value.toLowerCase()),
        ),
      )
    }

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
    } else {
      throw new Error()
    }
  }

  toggle(table: TableKeys, id: string) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      const { completed_at: completedAt } = this.#database[table][rowIndex]
      if (completedAt) {
        this.#database[table][rowIndex].completed_at = null
      } else {
        this.#database[table][rowIndex].completed_at = new Date().toString()
      }

      this.#persist()
    } else {
      throw new Error('Register not found.')
    }
  }
}
