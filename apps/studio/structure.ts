import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('SportVerse')
    .items([
      S.listItem()
        .title('By sport')
        .child(
          S.documentTypeList('sport')
            .title('Sports')
            .child((sportId) =>
              S.list()
                .title('Sport content')
                .items([
                  S.listItem()
                    .title('Players')
                    .child(
                      S.documentList()
                        .title('Players')
                        .filter('_type == "player" && references($sportId)')
                        .params({sportId}),
                    ),
                  S.listItem()
                    .title('Teams')
                    .child(
                      S.documentList()
                        .title('Teams')
                        .filter('_type == "team" && references($sportId)')
                        .params({sportId}),
                    ),
                  S.listItem()
                    .title('Tournaments')
                    .child(
                      S.documentList()
                        .title('Tournaments')
                        .filter('_type == "tournament" && references($sportId)')
                        .params({sportId}),
                    ),
                  S.listItem()
                    .title('Articles')
                    .child(
                      S.documentList()
                        .title('Articles')
                        .filter('_type == "article" && references($sportId)')
                        .params({sportId}),
                    ),
                  S.listItem()
                    .title('Products')
                    .child(
                      S.documentList()
                        .title('Products')
                        .filter('_type == "product" && $sportId in sports[]._ref')
                        .params({sportId}),
                    ),
                ]),
            ),
        ),
      S.divider(),
      S.listItem()
        .title('Cross-vertical')
        .child(
          S.list()
            .title('Cross-vertical')
            .items([
              S.listItem()
                .title('All sports')
                .child(S.documentTypeList('sport').title('Sports')),
              S.listItem()
                .title('Authors')
                .child(S.documentTypeList('author').title('Authors')),
              S.listItem()
                .title('Product categories')
                .child(S.documentTypeList('productCategory').title('Product categories')),
              S.listItem()
                .title('All players')
                .child(S.documentTypeList('player').title('Players')),
              S.listItem()
                .title('All teams')
                .child(S.documentTypeList('team').title('Teams')),
              S.listItem()
                .title('All tournaments')
                .child(S.documentTypeList('tournament').title('Tournaments')),
              S.listItem()
                .title('All articles')
                .child(S.documentTypeList('article').title('Articles')),
              S.listItem()
                .title('All products')
                .child(S.documentTypeList('product').title('Products')),
            ]),
        ),
    ])
