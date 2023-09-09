export function extractQueryParams(query: string) {
  if (query) {
    return query
      .slice(1)
      .split('&')
      .reduce((queryParams: { [key: string]: string }, param) => {
        const [key, value] = param.split('=')

        queryParams[key] = value

        return queryParams
      }, {})
  }

  return {}
}
