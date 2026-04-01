import {defineType, defineField} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {name: 'info', title: 'Product Info', default: true},
    {name: 'pricing', title: 'Pricing & Variants'},
    {name: 'relations', title: 'Contextual Links'},
    {name: 'ai', title: 'AI & Personalization'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'localizedString',
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: {source: 'name.en', maxLength: 200},
    }),
    defineField({name: 'sku', title: 'SKU', type: 'string', group: 'info'}),
    defineField({
      name: 'externalId',
      title: 'External Commerce ID',
      type: 'string',
      group: 'info',
    }),
    defineField({name: 'description', title: 'Description', type: 'localizedBlockContent', group: 'info'}),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      group: 'info',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', type: 'string', title: 'Alt Text'}]}],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'productCategory'}],
      group: 'info',
    }),
    defineField({
      name: 'price',
      title: 'Base Price',
      type: 'object',
      group: 'pricing',
      fields: [
        {name: 'amount', type: 'number', title: 'Amount'},
        {
          name: 'currency',
          type: 'string',
          title: 'Currency',
          options: {list: ['USD', 'EUR', 'GBP', 'INR', 'JPY']},
          initialValue: 'USD',
        },
      ],
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare-at Price',
      type: 'number',
      group: 'pricing',
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      group: 'pricing',
      of: [
        {
          type: 'object',
          name: 'productVariant',
          fields: [
            {name: 'name', type: 'string', title: 'Variant Name'},
            {name: 'sku', type: 'string', title: 'Variant SKU'},
            {name: 'price', type: 'number', title: 'Price Override'},
            {name: 'inStock', type: 'boolean', title: 'In Stock', initialValue: true},
            {
              name: 'attributes',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'key', type: 'string', title: 'Attribute'},
                    {name: 'value', type: 'string', title: 'Value'},
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'sports',
      title: 'Related Sports',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'sport'}]}],
      group: 'relations',
    }),
    defineField({
      name: 'endorsedBy',
      title: 'Endorsed By Players',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'player'}]}],
      group: 'relations',
    }),
    defineField({
      name: 'featuredInTournaments',
      title: 'Featured In Tournaments',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tournament'}]}],
      group: 'relations',
    }),
    defineField({name: 'contentContext', type: 'contentContext', group: 'ai'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'name.en', price: 'price.amount', currency: 'price.currency', media: 'images.0'},
    prepare: ({title, price, currency, media}) => ({
      title,
      subtitle: price ? `${currency} ${price}` : 'No price set',
      media,
    }),
  },
})
