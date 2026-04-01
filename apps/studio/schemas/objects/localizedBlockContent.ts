import {defineType} from 'sanity'

export const localizedBlockContent = defineType({
  name: 'localizedBlockContent',
  title: 'Localized Rich Text',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: 'English',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                name: 'internalLink',
                type: 'object',
                title: 'Internal Link',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    to: [
                      {type: 'player'},
                      {type: 'team'},
                      {type: 'tournament'},
                      {type: 'product'},
                    ],
                  },
                ],
              },
              {
                name: 'externalLink',
                type: 'object',
                title: 'External Link',
                fields: [
                  {name: 'url', type: 'url', title: 'URL'},
                  {name: 'newTab', type: 'boolean', title: 'Open in new tab'},
                ],
              },
            ],
          },
        },
        {type: 'image', options: {hotspot: true}},
        {type: 'videoEmbed'},
        {type: 'dataTable'},
        {type: 'callout'},
      ],
    },
  ],
})
