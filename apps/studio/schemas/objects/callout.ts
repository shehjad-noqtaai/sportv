import {defineType} from 'sanity'

export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    {
      name: 'tone',
      type: 'string',
      title: 'Tone',
      options: {list: ['info', 'tip', 'warning', 'quote']},
      initialValue: 'info',
    },
    {name: 'title', type: 'string', title: 'Title'},
    {name: 'body', type: 'text', title: 'Body', rows: 4},
  ],
})
