import imageUrlBuilder from '@sanity/image-url'
import {client} from './client'

const builder = imageUrlBuilder(client)

export function urlForImage(source: Parameters<typeof builder.image>[0] | null | undefined) {
  if (!source) return null
  return builder.image(source)
}
