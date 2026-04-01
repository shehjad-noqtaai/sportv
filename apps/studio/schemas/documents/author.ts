import {defineType, defineField} from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', title: 'Name', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', type: 'slug', title: 'Slug', options: {source: 'name'}}),
    defineField({name: 'avatar', type: 'image', title: 'Avatar', options: {hotspot: true}}),
    defineField({name: 'bio', type: 'text', title: 'Bio'}),
    defineField({name: 'role', type: 'string', title: 'Role'}),
    defineField({
      name: 'socialProfiles',
      title: 'Social Profiles',
      type: 'array',
      of: [{type: 'socialProfile'}],
    }),
  ],
})
