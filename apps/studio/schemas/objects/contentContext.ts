import {defineType} from 'sanity'

export const contentContext = defineType({
  name: 'contentContext',
  title: 'Content Context (AI & Personalization)',
  type: 'object',
  fields: [
    {
      name: 'aiSummary',
      title: 'AI-Generated Summary',
      type: 'text',
      rows: 3,
      readOnly: true,
    },
    {
      name: 'aiTags',
      title: 'AI-Generated Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      readOnly: true,
    },
    {
      name: 'embeddingVector',
      title: 'Embedding Vector ID',
      type: 'string',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'manualTags',
      title: 'Editorial Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    },
    {
      name: 'audiences',
      title: 'Target Audiences',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Casual Fan', value: 'casual'},
          {title: 'Hardcore Enthusiast', value: 'hardcore'},
          {title: 'Fantasy Player', value: 'fantasy'},
          {title: 'Collector', value: 'collector'},
          {title: 'Beginner', value: 'beginner'},
        ],
      },
    },
    {
      name: 'sentiment',
      title: 'Content Sentiment',
      type: 'string',
      options: {list: ['positive', 'neutral', 'negative', 'controversial']},
      readOnly: true,
    },
  ],
  options: {collapsible: true, collapsed: true},
})
