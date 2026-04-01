import {defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO & Open Graph',
  type: 'object',
  fields: [
    {name: 'metaTitle', type: 'localizedString', title: 'Meta Title'},
    {name: 'metaDescription', type: 'localizedString', title: 'Meta Description'},
    {
      name: 'ogImage',
      type: 'image',
      title: 'Open Graph Image',
      options: {hotspot: true},
    },
    {name: 'noIndex', type: 'boolean', title: 'No Index', initialValue: false},
    {name: 'canonicalUrl', type: 'url', title: 'Canonical URL'},
    {name: 'structuredData', title: 'JSON-LD Override', type: 'text'},
  ],
  options: {collapsible: true, collapsed: true},
})
