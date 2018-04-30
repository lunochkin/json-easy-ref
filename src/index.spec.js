/* eslint-env jest */
import jref from './index'

test('simple object', () => {
  const json = {
    a: {
      v: 1
    },
    b: {
      $ref: '#/a/v'
    }
  }

  const result = jref(json)

  expect(result.b).toBe(json.a.v)
})

test('complex object and immutability', () => {
  const json = {
    a: {
      v: {
        d: 1
      }
    },
    b: {
      v: {
        $ref: '#/a/v'
      }
    }
  }

  const result = jref(json)

  expect(result.b.v).toEqual(json.a.v)

  expect(result.b.v).not.toBe(json.a.v)
})

test('inheritance', () => {
  const json = {
    a: {
      v: {
        d: 1,
        f: 2
      }
    },
    b: {
      v: {
        $ref: '#/a/v',
        f: 3,
        g: 2
      }
    }
  }

  const result = jref(json)

  expect(result.b.v).toEqual({
    d: 1,
    f: 3,
    g: 2
  })
})

test('simple array', () => {
  const json = [
    {
      a: {
        v: 12
      }
    },
    {
      b: {
        $ref: '#/0/a'
      }
    }
  ]

  const result = jref(json)

  expect(result.b).toEqual(json.a)
})

test('complex array', () => {
  const json = [
    {
      a: {
        v: [
          {
            h: 100
          }
        ]
      }
    },
    {
      b: [
        {
          $ref: '#/0/a/v/0'
        }
      ]
    }
  ]

  const result = jref(json)

  expect(result[1].b[0]).toEqual(json[0].a.v[0])
})

test('array $id mechanic', () => {
  const json = {
    a: [
      {
        $id: 'key',
        v: {
          d: 1,
          f: 2
        }
      }
    ],
    b: {
      v: {
        $ref: '#/a/$key/v',
        d: 2,
        q: 3
      }
    }
  }

  const result = jref(json)

  expect(result.b.v).toEqual({
    f: 2,
    d: 2,
    q: 3
  })
})

test('custom idToken', () => {
  const json = [
    {
      cname: 'cn',
      v: {
        d: 1
      }
    },
    {
      v: {
        $ref: '#/$cn/v'
      }
    }
  ]

  const result = jref(json, {idToken: 'cname'})

  expect(result[1].v).toEqual(json[0].v)
})

test('custom refToken', () => {
  const json = [
    {
      $id: 'cn',
      v: {
        d: 1
      }
    },
    {
      v: {
        '@ref': '#/$cn/v'
      }
    }
  ]

  const result = jref(json, {refToken: '@ref'})

  expect(result[1].v).toEqual(json[0].v)
})
