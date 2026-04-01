import {defineType, defineField} from 'sanity'

export const productCategory = defineType({
  name: 'productCategory',
  title: 'Product Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'localizedString',
      title: 'Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'slug', type: 'slug', title: 'Slug', options: {source: 'name.en'}}),
    defineField({name: 'description', type: 'localizedString', title: 'Description'}),
    defineField({name: 'icon', type: 'image', title: 'Icon'}),
    defineField({
      name: 'parent',
      type: 'reference',
      to: [{type: 'productCategory'}],
      title: 'Parent Category',
    }),
  ],
  preview: {
    select: {title: 'name.en', parent: 'parent.name.en'},
    prepare: ({title, parent}) => ({
      title: parent ? `${parent} → ${title}` : title,
    }),
  },
})
