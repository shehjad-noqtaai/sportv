import {defineType} from 'sanity'

export const socialProfile = defineType({
  name: 'socialProfile',
  title: 'Social Profile',
  type: 'object',
  fields: [
    {
      name: 'platform',
      type: 'string',
      options: {
        list: ['twitter', 'instagram', 'youtube', 'twitch', 'tiktok', 'linkedin'],
      },
    },
    {name: 'url', type: 'url', title: 'Profile URL'},
    {name: 'handle', type: 'string', title: 'Handle / Username'},
  ],
  preview: {
    select: {platform: 'platform', handle: 'handle'},
    prepare: ({platform, handle}) => ({
      title: `${platform}: @${handle}`,
    }),
  },
})
