import {defineType, defineField} from 'sanity'

export const player = defineType({
  name: 'player',
  title: 'Player',
  type: 'document',
  groups: [
    {name: 'bio', title: 'Biography', default: true},
    {name: 'career', title: 'Career & Stats'},
    {name: 'connections', title: 'Relationships'},
    {name: 'commerce', title: 'Commerce'},
    {name: 'ai', title: 'AI & Personalization'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      group: 'bio',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'bio',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'nickname', title: 'Nickname / Gamertag', type: 'string', group: 'bio'}),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      group: 'bio',
      options: {hotspot: true},
    }),
    defineField({name: 'nationality', title: 'Nationality', type: 'string', group: 'bio'}),
    defineField({name: 'dateOfBirth', title: 'Date of Birth', type: 'date', group: 'bio'}),
    defineField({name: 'bio', title: 'Biography', type: 'localizedBlockContent', group: 'bio'}),
    defineField({
      name: 'socialProfiles',
      title: 'Social Profiles',
      type: 'array',
      of: [{type: 'socialProfile'}],
      group: 'bio',
    }),
    defineField({
      name: 'sport',
      title: 'Primary Sport',
      type: 'reference',
      to: [{type: 'sport'}],
      group: 'career',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Position / Role',
      type: 'localizedString',
      group: 'career',
    }),
    defineField({
      name: 'isActive',
      title: 'Currently Active',
      type: 'boolean',
      group: 'career',
      initialValue: true,
    }),
    defineField({
      name: 'careerTimeline',
      title: 'Career Timeline',
      type: 'array',
      group: 'career',
      of: [
        {
          type: 'object',
          name: 'careerEntry',
          fields: [
            {name: 'year', type: 'number', title: 'Year'},
            {name: 'title', type: 'localizedString', title: 'Title / Achievement'},
            {name: 'description', type: 'text', title: 'Description'},
            {name: 'team', type: 'reference', to: [{type: 'team'}], title: 'Associated Team'},
            {name: 'tournament', type: 'reference', to: [{type: 'tournament'}], title: 'Associated Tournament'},
          ],
          preview: {
            select: {year: 'year', title: 'title.en'},
            prepare: ({year, title}) => ({title: `${year} — ${title}`}),
          },
        },
      ],
      options: {sortable: true},
    }),
    defineField({
      name: 'stats',
      title: 'Player Statistics',
      type: 'array',
      group: 'career',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            {name: 'key', type: 'string', title: 'Stat Key'},
            {name: 'value', type: 'string', title: 'Value'},
          ],
        },
      ],
    }),
    defineField({
      name: 'currentTeam',
      title: 'Current Team',
      type: 'reference',
      to: [{type: 'team'}],
      group: 'connections',
    }),
    defineField({
      name: 'pastTeams',
      title: 'Past Teams',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'team'}]}],
      group: 'connections',
    }),
    defineField({
      name: 'endorsedProducts',
      title: 'Endorsed / Signature Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      group: 'commerce',
    }),
    defineField({
      name: 'equipment',
      title: 'Equipment Used',
      type: 'array',
      group: 'commerce',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'category', type: 'string', title: 'Category'},
            {name: 'product', type: 'reference', to: [{type: 'product'}], title: 'Product'},
          ],
        },
      ],
    }),
    defineField({name: 'contentContext', type: 'contentContext', group: 'ai'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'sport.name.en', media: 'portrait'},
  },
})
