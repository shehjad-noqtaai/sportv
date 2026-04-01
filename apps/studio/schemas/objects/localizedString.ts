import {defineType} from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    {name: 'en', type: 'string', title: 'English'},
    {name: 'es', type: 'string', title: 'Spanish'},
    {name: 'hi', type: 'string', title: 'Hindi'},
    {name: 'ja', type: 'string', title: 'Japanese'},
  ],
  options: {collapsible: true, collapsed: true},
})
