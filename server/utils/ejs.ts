import { compile } from "ejs";

const EJS_STORAGE_KEY = 'assets:server:views'

export const getEjsTemplate = defineCachedFunction(async (templateKey: string, data: Record<string,any>) => {
  const template = await getEjsTemplateFn(templateKey)
  return template(data)
}, {
  name: 'ejs-template',
  maxAge: 60*60*24,
  swr: true,
})

const resolveIncludes = defineCachedFunction(async () => await resolveIncludesUncached(), {
  name: 'ejs-includes',
  maxAge: 60*60*24,
  swr: true,
})

export async function getEjsTemplateFn(key: string) {
  const includesLookup = await resolveIncludes()
  const view = await getEjsView(key)
  return compile(view, {
    includer: (originalPath) => {
      const pathToCheck = `${originalPath.replace('../', '').replaceAll('/', ':')}.ejs`
      const includeContent = includesLookup[pathToCheck]
      if(!includeContent) {
        throw createError({
          status: 500,
          message: `Could not find include ${originalPath}`
        })
      }
      return {
        template: includeContent
      }
    }
  })
}

async function resolveIncludesUncached() {
  const keys = await getEjsKeys()
  const includeKeys = keys.filter((k) => k.startsWith('partials:'))

  const resolvedEntries = await Promise.all(includeKeys.map(async (includeKey) => {
    const includeContent = await getEjsView(includeKey)
    return [includeKey, includeContent]
  }))

  return Object.fromEntries(resolvedEntries)
}

async function getEjsView(key: string) {
  const ejsViewStorage = useStorage(EJS_STORAGE_KEY)
  return await ejsViewStorage.getItem<string>(key).then((item) => Buffer.from(item).toString())
}

async function getEjsKeys() {
  const ejsViewStorage = useStorage(EJS_STORAGE_KEY)
  const keys = await ejsViewStorage.getKeys()
  return keys
}
