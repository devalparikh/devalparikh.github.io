import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { Bookshelf, type ShelfItem } from "@/components/writing/Bookshelf";
import { elsewhere, elsewhereTitle, writing } from "@/content/writing";
import { interTight } from "@/lib/fonts";
import { formatPostDate, getShelfPosts, postInstant, SITE_ORIGIN } from "@/lib/writing-posts";

export const metadata: Metadata = {
  title: writing.title,
  description: writing.description,
  alternates: { canonical: `${SITE_ORIGIN}/writing/` },
};

export default function WritingPage() {
  const posts = getShelfPosts();
  // Issue numbers run oldest first, like a series; the shelf shows newest first.
  const chronological = [...posts].sort((a, b) => postInstant(a.date).getTime() - postInstant(b.date).getTime());
  const books: ShelfItem[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    words: post.words,
    year: post.year,
    issue: chronological.indexOf(post) + 1,
    dateTime: post.date,
    dateLabel: formatPostDate(post.date),
    categories: post.book.categories,
    cover: post.book.cover,
  }));

  return (
    <PageFrame wide>
      <div className={interTight.variable}>
        <div className="max-w-3xl">
          <PageHeader title={writing.title} description={writing.description} />
        </div>
        <Bookshelf books={books} filters={writing.filters} elsewhere={elsewhere} elsewhereTitle={elsewhereTitle} />
      </div>
    </PageFrame>
  );
}
