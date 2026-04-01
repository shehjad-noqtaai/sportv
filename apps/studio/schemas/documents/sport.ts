import {defineType, defineField} from 'sanity'

export const sport = defineType({
  name: 'sport',
  title: 'Sport',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'taxonomy', title: 'Taxonomy & Config'},
    {name: 'ai', title: 'AI & Personalization'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Sport Name',
      type: 'localizedString',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'name.en', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Sport Icon',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'localizedBlockContent',
      group: 'content',
    }),
    defineField({
      name: 'hasTeams',
      title: 'Team-based Sport?',
      type: 'boolean',
      group: 'taxonomy',
      initialValue: true,
    }),
    defineField({name: 'contentContext', type: 'contentContext', group: 'ai'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'name.en', media: 'icon'},
  },
})
