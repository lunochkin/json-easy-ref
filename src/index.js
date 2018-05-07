
const getByPathInternal = ({input, path, options}) => {
  if (path.length === 0) {
    return input
  }

  if (input == null) {
    return undefined
  }

  const [first, ...rest] = path

  if (first.indexOf('$') !== 0) {
    return getByPathInternal({input: input[first], path: rest, options})
  }

  if (!Array.isArray(input)) {
    return undefined
  }

  const id = first.substr(1)
  for (let one of input) {
    if (one[options.idToken] === id) {
      return getByPathInternal({input: one, path: rest, options})
    }
  }

  return undefined
}

const parse = ({input, json, context, parentContext, options}) => {
  if (!input) {
    return input
  }

  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return jrefInternal({input, json, context, parentContext, options})
  }

  let result = {...input}
  const ref = result[options.refToken]
  delete result[options.refToken]

  const id = result[options.idToken]

  if (id) {
    parentContext = context
    context = result
  }

  if (!ref) {
    return jrefInternal({input: result, json, context, parentContext, options})
  }
  let refPath = ref.substr(2).split('/')

  let value
  if (refPath[0] === options.thisToken) {
    value = getByPathInternal({input: context, path: refPath.slice(1), options})
  } else if (refPath[0] === options.parentToken) {
    value = getByPathInternal({input: parentContext, path: refPath.slice(1), options})
  } else {
    value = getByPathInternal({input: json, path: refPath, options})
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    result = {
      ...value,
      ...result
    }
  } else {
    result = value
  }

  return jrefInternal({input: result, context, parentContext, json, options})
}

const jrefInternal = ({input, json, context, parentContext, options}) => {
  if (typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(one => parse({input: one, json, context, parentContext, options}))
  }

  return Object.keys(input).reduce((agg, key) => {
    agg[key] = parse({input: input[key], json, context, parentContext, options})
    return agg
  }, {})
}

const defaultOptions = {
  idToken: '$id',
  refToken: '$ref',
  thisToken: '$this',
  parentToken: '$parent'
}

const jref = (json, options) => {
  options = {
    ...defaultOptions,
    ...options
  }

  return jrefInternal({input: json, json, context: json, parentContext: json, options})
}

const getByPath = (json, path, options) => {
  options = {
    ...defaultOptions,
    ...options
  }

  return getByPathInternal({input: json, path, options})
}

export {getByPath}

export default jref
