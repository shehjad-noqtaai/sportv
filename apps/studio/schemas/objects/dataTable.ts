import {defineType} from 'sanity'

export const dataTable = defineType({
  name: 'dataTable',
  title: 'Data table',
  type: 'object',
  fields: [
    {name: 'caption', type: 'string', title: 'Caption'},
    {name: 'csvOrJson', type: 'text', title: 'Table data (CSV or JSON)', rows: 6},
  ],
})
