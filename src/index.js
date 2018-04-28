
const getByPath = (json, path, options) => {
  if (path.length === 0) {
    return json
  }

  if (json == null) {
    return undefined
  }

  const [first, ...rest] = path

  if (first.indexOf('$') !== 0) {
    return getByPath(json[first], rest, options)
  }

  if (!Array.isArray(json)) {
    return undefined
  }

  const id = first.substr(1)
  for (let [index, one] of json.entries()) {
    if (one[options.idToken] === id) {
      return getByPath(one, rest, options)
    }
  }

  return undefined
}

const parse = (input, json, options) => {
  if (!input) {
    return input
  }

  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return jrefInternal(input, json, options)
  }

  let {$ref, ...result} = input
  if (!$ref) {
    return jrefInternal(result, json, options)
  }
  const refPath = $ref.substr(2).split('/')

  const value = getByPath(json, refPath, options)

  if (typeof value === 'object' && !Array.isArray(value)) {
    result = {
      ...value,
      ...result
    }
  } else {
    result = value
  }

  return jrefInternal(result, json, options)
}

const jrefInternal = (input, json, options) => {
  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(one => parse(one, json, options))
  }

  return Object.keys(input).reduce((agg, key) => {
    agg[key] = parse(input[key], json, options)
    return agg
  }, {})
}

const jref = (json, options) => {
  options = {
    idToken: '$id',
    ...options
  }

  return jrefInternal(json, json, options)
}

export default jref
