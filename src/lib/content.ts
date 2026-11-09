import { SITE } from "@/consts"
import { getCollection, type CollectionEntry } from "astro:content"
import { isSubpost } from "@/lib/utils"

export const pageTitle = (title: string) => `${title} | ${SITE.title}`

export async function getPosts(): Promise<CollectionEntry<"archive">[]> {
  const posts = await getCollection(
    "archive",
    ({ data }: CollectionEntry<"archive">) => !data.draft,
  )
  return posts
    .filter((post: CollectionEntry<"archive">) => !isSubpost(post.id))
    .sort(
      (a: CollectionEntry<"archive">, b: CollectionEntry<"archive">) =>
        b.data.date.getTime() - a.data.date.getTime(),
    )
}

export async function getSubposts(): Promise<
  Map<string, CollectionEntry<"archive">[]>
> {
  const posts = await getCollection(
    "archive",
    ({ id, data }: CollectionEntry<"archive">) =>
      !data.draft && id.split("/").length === 2,
  )
  posts.sort(
    (a: CollectionEntry<"archive">, b: CollectionEntry<"archive">) =>
      (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
      a.data.date.getTime() - b.data.date.getTime(),
  )
  return Map.groupBy(posts, (post) => post.id.split("/")[0])
}

export async function getTags(): Promise<
  Map<string, CollectionEntry<"archive">[]>
> {
  const posts = await getPosts()
  const series = await getSubposts()
  const tags = new Map<string, CollectionEntry<"archive">[]>()
  for (const post of posts) {
    const chain = [post, ...(series.get(post.id) ?? [])]
    for (const tag of new Set(
      chain.flatMap((entry) => entry.data.tags ?? []),
    )) {
      const tagged = tags.get(tag)
      if (tagged) tagged.push(post)
      else tags.set(tag, [post])
    }
  }
  return new Map(
    [...tags].sort(
      ([a, postsA], [b, postsB]) =>
        postsB.length - postsA.length || a.localeCompare(b),
    ),
  )
}
