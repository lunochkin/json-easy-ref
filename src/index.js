
const getByPath = (json, path) => {
  if (path.length === 0) {
    return json
  }

  if (json == null) {
    return undefined
  }

  const [first, ...rest] = path

  return getByPath(json[first], rest)
}

const parse = (input, json) => {
  if (!input) {
    return input
  }

  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return jrefInternal(input, json)
  }

  let {$ref, ...result} = input
  if (!$ref) {
    return jrefInternal(result, json)
  }
  const refPath = $ref.substr(2).split('/')

  const value = getByPath(json, refPath)

  if (typeof value === 'object' && !Array.isArray(value)) {
    result = {
      ...value,
      ...result
    }
  } else {
    result = value
  }

  return jrefInternal(result, json)
}

const jrefInternal = (input, json) => {
  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(one => parse(one, json))
  }

  return Object.keys(input).reduce((agg, key) => {
    agg[key] = parse(input[key], json)
    return agg
  }, {})
}

const jref = json => jrefInternal(json, json)

export default jref
