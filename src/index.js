
const getByPath = ({input, path, options}) => {
  if (path.length === 0) {
    return input
  }

  if (input == null) {
    return undefined
  }

  const [first, ...rest] = path

  if (first.indexOf('$') !== 0) {
    return getByPath({input: input[first], path: rest, options})
  }

  if (!Array.isArray(input)) {
    return undefined
  }

  const id = first.substr(1)
  for (let one of input) {
    if (one[options.idToken] === id) {
      return getByPath({input: one, path: rest, options})
    }
  }

  return undefined
}

const parse = ({input, json, context, options}) => {
  if (!input) {
    return input
  }

  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return jrefInternal({input, json, context, options})
  }

  let result = {...input}
  const ref = result[options.refToken]
  delete result[options.refToken]

  const id = result[options.idToken]

  if (id) {
    context = result
  }

  if (!ref) {
    return jrefInternal({input: result, json, context, options})
  }
  let refPath = ref.substr(2).split('/')

  let value
  if (refPath[0] === options.thisToken) {
    value = getByPath({input: context, path: refPath.slice(1), options})
  } else {
    value = getByPath({input: json, path: refPath, options})
  }


  if (typeof value === 'object' && !Array.isArray(value)) {
    result = {
      ...value,
      ...result
    }
  } else {
    result = value
  }

  return jrefInternal({input: result, context, json, options})
}

const jrefInternal = ({input, json, context, options}) => {
  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(one => parse({input: one, json, context, options}))
  }

  return Object.keys(input).reduce((agg, key) => {
    agg[key] = parse({input: input[key], json, context, options})
    return agg
  }, {})
}

const jref = (json, options) => {
  options = {
    idToken: '$id',
    refToken: '$ref',
    thisToken: '$this',
    ...options
  }

  return jrefInternal({input: json, json, context: json, options})
}

export default jref
