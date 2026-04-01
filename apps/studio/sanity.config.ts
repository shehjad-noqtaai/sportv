import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'
import {structure} from './structure'

export default defineConfig({
  name: 'sportverse',
  title: 'SportVerse Studio',
  projectId: 'xqsr0go8',
  dataset: 'production',
  plugins: [structureTool({structure})],
  schema: {
    types: schemaTypes,
  },
})
