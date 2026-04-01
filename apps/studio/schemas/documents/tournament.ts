import {defineType, defineField} from 'sanity'

export const tournament = defineType({
  name: 'tournament',
  title: 'Tournament',
  type: 'document',
  groups: [
    {name: 'info', title: 'Info', default: true},
    {name: 'schedule', title: 'Schedule & Results'},
    {name: 'commerce', title: 'Commerce & Sponsors'},
    {name: 'ai', title: 'AI & Personalization'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tournament Name',
      type: 'localizedString',
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: {source: 'name.en', maxLength: 96},
    }),
    defineField({
      name: 'sport',
      title: 'Sport',
      type: 'reference',
      to: [{type: 'sport'}],
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'edition', title: 'Edition / Year', type: 'string', group: 'info'}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'info',
      options: {
        list: [
          {title: 'Upcoming', value: 'upcoming'},
          {title: 'Live', value: 'live'},
          {title: 'Completed', value: 'completed'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),
    defineField({name: 'startDate', title: 'Start Date', type: 'datetime', group: 'info'}),
    defineField({name: 'endDate', title: 'End Date', type: 'datetime', group: 'info'}),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'object',
      group: 'info',
      fields: [
        {name: 'name', type: 'string', title: 'Venue Name'},
        {name: 'city', type: 'string', title: 'City'},
        {name: 'country', type: 'string', title: 'Country'},
        {name: 'coordinates', type: 'geopoint', title: 'Coordinates'},
      ],
    }),
    defineField({name: 'description', title: 'Description', type: 'localizedBlockContent', group: 'info'}),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'info',
      options: {hotspot: true},
    }),
    defineField({
      name: 'participants',
      title: 'Participating Teams / Players',
      type: 'array',
      group: 'schedule',
      of: [{type: 'reference', to: [{type: 'team'}, {type: 'player'}]}],
    }),
    defineField({
      name: 'schedule',
      title: 'Match Schedule',
      type: 'array',
      group: 'schedule',
      of: [
        {
          type: 'object',
          name: 'match',
          fields: [
            {name: 'title', type: 'string', title: 'Match Title'},
            {name: 'dateTime', type: 'datetime', title: 'Date & Time'},
            {name: 'stage', type: 'string', title: 'Stage'},
            {
              name: 'participants',
              type: 'array',
              of: [{type: 'reference', to: [{type: 'team'}, {type: 'player'}]}],
              title: 'Participants',
            },
            {name: 'result', type: 'string', title: 'Result'},
            {name: 'winner', type: 'reference', to: [{type: 'team'}, {type: 'player'}], title: 'Winner'},
          ],
          preview: {
            select: {title: 'title', stage: 'stage', date: 'dateTime'},
            prepare: ({title, stage, date}) => ({
              title,
              subtitle: `${stage} — ${date ? new Date(date as string).toLocaleDateString() : 'TBD'}`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'winner',
      title: 'Tournament Winner',
      type: 'reference',
      to: [{type: 'team'}, {type: 'player'}],
      group: 'schedule',
    }),
    defineField({
      name: 'officialProducts',
      title: 'Official Merchandise',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      group: 'commerce',
    }),
    defineField({
      name: 'sponsors',
      title: 'Sponsors',
      type: 'array',
      group: 'commerce',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'Sponsor Name'},
            {name: 'logo', type: 'image', title: 'Logo'},
            {name: 'url', type: 'url', title: 'Website'},
            {
              name: 'tier',
              type: 'string',
              options: {list: ['title', 'gold', 'silver', 'bronze']},
            },
          ],
        },
      ],
    }),
    defineField({name: 'contentContext', type: 'contentContext', group: 'ai'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {title: 'Start Date (Newest)', name: 'startDateDesc', by: [{field: 'startDate', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'name.en', subtitle: 'edition', status: 'status', media: 'coverImage'},
    prepare: ({title, subtitle, status, media}) => ({
      title,
      subtitle: `${subtitle} [${status}]`,
      media,
    }),
  },
})
