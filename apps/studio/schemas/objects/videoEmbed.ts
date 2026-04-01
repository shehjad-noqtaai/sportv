import {defineType} from 'sanity'

export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video embed',
  type: 'object',
  fields: [
    {name: 'url', type: 'url', title: 'Video URL'},
    {name: 'title', type: 'string', title: 'Title'},
  ],
})
