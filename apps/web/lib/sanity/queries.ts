/** Default locale for localized object fields (PRD field-level i18n). */
export const defaultLocale = 'en' as const

export const sportHubQuery = /* groq */ `
  *[_type == "sport" && slug.current == $sportSlug][0] {
    _id,
    "name": name[$locale],
    slug,
    heroImage {
      ...,
      "url": asset->url,
      "lqip": asset->metadata.lqip
    },
    "overview": overview[$locale],
    hasTeams,
    "featuredPlayers": *[_type == "player" && references(^._id)] | order(coalesce(contentContext.sentiment, "neutral") desc) [0...6] {
      _id,
      name,
      slug,
      "position": position[$locale],
      portrait { "url": asset->url, "lqip": asset->metadata.lqip },
      isActive,
      "teamName": currentTeam->name[$locale]
    },
    "upcomingTournaments": *[_type == "tournament" && references(^._id) && status == "upcoming"] | order(startDate asc) [0...4] {
      _id,
      "name": name[$locale],
      slug,
      edition,
      startDate,
      endDate,
      venue { name, city, country },
      coverImage { "url": asset->url }
    },
    "liveTournaments": *[_type == "tournament" && references(^._id) && status == "live"] {
      _id,
      "name": name[$locale],
      slug,
      "latestMatch": schedule | order(dateTime desc) [0] {
        title, result, dateTime
      }
    },
    "latestArticles": *[_type == "article" && references(^._id) && status == "published"] | order(publishedAt desc) [0...8] {
      _id,
      "title": title[$locale],
      slug,
      "excerpt": excerpt[$locale],
      articleType,
      publishedAt,
      heroImage { "url": asset->url, "lqip": asset->metadata.lqip },
      "authorName": author->name
    },
    "featuredProducts": *[_type == "product" && ^._id in sports[]._ref] [0...6] {
      _id,
      "name": name[$locale],
      slug,
      price,
      compareAtPrice,
      "image": images[0] { "url": asset->url, "lqip": asset->metadata.lqip },
      "categoryName": category->name[$locale]
    }
  }
`

export const playerBySlugQuery = /* groq */ `
  *[_type == "player" && slug.current == $playerSlug][0] {
    _id,
    name,
    nickname,
    slug,
    portrait { ..., "url": asset->url },
    nationality,
    dateOfBirth,
    "bio": bio[$locale],
    socialProfiles,
    isActive,
    "position": position[$locale],
    sport-> {
      _id,
      "name": name[$locale],
      slug,
      statFields
    },
    currentTeam-> {
      _id,
      "name": name[$locale],
      slug,
      logo { "url": asset->url }
    },
    pastTeams[]-> {
      _id,
      "name": name[$locale],
      slug,
      logo { "url": asset->url }
    },
    stats,
    careerTimeline[] {
      year,
      "title": title[$locale],
      description,
      team-> { "name": name[$locale], slug },
      tournament-> { "name": name[$locale], slug }
    } | order(year desc),
    endorsedProducts[]-> {
      _id,
      "name": name[$locale],
      slug,
      price,
      images[0] { "url": asset->url }
    },
    equipment[] {
      category,
      product-> {
        _id,
        "name": name[$locale],
        slug,
        price,
        images[0] { "url": asset->url }
      }
    },
    "relatedArticles": *[_type == "article" && references(^._id) && status == "published"] | order(publishedAt desc) [0...5] {
      _id,
      "title": title[$locale],
      slug,
      publishedAt,
      articleType,
      heroImage { "url": asset->url, "lqip": asset->metadata.lqip }
    },
    "tournaments": *[_type == "tournament" && references(^._id)] | order(startDate desc) [0...5] {
      _id,
      "name": name[$locale],
      slug,
      edition,
      status,
      startDate
    },
    contentContext,
    seo
  }
`

export const productBySlugQuery = /* groq */ `
  *[_type == "product" && slug.current == $productSlug][0] {
    _id,
    "name": name[$locale],
    slug,
    sku,
    externalId,
    "description": description[$locale],
    images[] { ..., "url": asset->url, "lqip": asset->metadata.lqip },
    price,
    compareAtPrice,
    variants,
    category-> { "name": name[$locale], slug },
    sports[]-> { _id, "name": name[$locale], slug },
    endorsedBy[]-> { _id, name, slug, portrait { "url": asset->url } },
    featuredInTournaments[]-> { _id, "name": name[$locale], slug, edition },
    contentContext,
    seo
  }
`

export const productListQuery = /* groq */ `
  *[_type == "product" && defined(slug.current)] | order(_updatedAt desc) [0...24] {
    _id,
    "name": name[$locale],
    slug,
    price,
    images[0] { "url": asset->url },
    "categorySlug": category->slug.current,
    "categoryName": category->name[$locale]
  }
`

export const allSportSlugsQuery = /* groq */ `
  *[_type == "sport" && defined(slug.current)].slug.current
`
