import { getEjsTemplate } from "~/utils/ejs.js"

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'slug') || 'index'
  // TODO: Other index handling
  // TODO: Sanitize path
  const key = `pages:${pathParam.replaceAll('/', ':')}.ejs`

  const data = pathParam === 'index' ? {
    tagline: 'It works! Nitro is amazing (also follow and subscribe)',
    mascots: [
    {
      name: 'Denise',
      birthYear: -2000,
      organization: 'My random org'
    },
    {
      name: 'Petra',
      birthYear: 1900,
      organization: 'Another org here'
    }
  ]
  } : {} 

  return getEjsTemplate(key, data)
})