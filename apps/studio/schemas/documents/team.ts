import {defineType, defineField} from 'sanity'

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'document',
  groups: [
    {name: 'info', title: 'Team Info', default: true},
    {name: 'roster', title: 'Roster'},
    {name: 'ai', title: 'AI & Personalization'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Team Name',
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
    defineField({name: 'logo', title: 'Logo', type: 'image', group: 'info'}),
    defineField({name: 'founded', title: 'Year Founded', type: 'number', group: 'info'}),
    defineField({
      name: 'homeVenue',
      title: 'Home Venue',
      type: 'object',
      group: 'info',
      fields: [
        {name: 'name', type: 'string', title: 'Venue Name'},
        {name: 'city', type: 'string', title: 'City'},
        {name: 'country', type: 'string', title: 'Country'},
        {name: 'coordinates', type: 'geopoint', title: 'Coordinates'},
      ],
    }),
    defineField({name: 'description', title: 'Team Description', type: 'localizedBlockContent', group: 'info'}),
    defineField({
      name: 'roster',
      title: 'Current Roster',
      type: 'array',
      group: 'roster',
      of: [
        {
          type: 'object',
          name: 'rosterEntry',
          fields: [
            {name: 'player', type: 'reference', to: [{type: 'player'}], title: 'Player'},
            {name: 'role', type: 'string', title: 'Role'},
            {name: 'jerseyNumber', type: 'number', title: 'Jersey #'},
            {name: 'joinDate', type: 'date', title: 'Joined'},
          ],
          preview: {
            select: {title: 'player.name', role: 'role', number: 'jerseyNumber'},
            prepare: ({title, role, number}) => ({
              title: `#${number || '?'} ${title}`,
              subtitle: role,
            }),
          },
        },
      ],
    }),
    defineField({name: 'contentContext', type: 'contentContext', group: 'ai'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'name.en', subtitle: 'sport.name.en', media: 'logo'},
  },
})
