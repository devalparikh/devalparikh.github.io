import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogArticleLayout } from "@blog/components/BlogArticleLayout";
import { PageFrame } from "@/components/chrome/PageFrame";
import { site } from "@/content/site";
import { formatPostDate, getPostMeta, postSlugs, postUrl, renderPost } from "@/lib/writing-posts";
import "@blog/components/blog/article-toc.css";
import "./article.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return postSlugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!postSlugs.includes(slug)) return {};
  const post = getPostMeta(slug);
  const url = postUrl(slug);
  return {
    title: post.title,
    description: post.summary,
    // One self-referencing canonical. These pages are the published home of
    // the posts; deval-blog points its copies here.
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
      images: post.image
        ? [{ url: post.image, alt: post.title }]
        : [{ url: "/img/og.webp", width: 1200, height: 706, alt: site.name }],
    },
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  if (!postSlugs.includes(slug)) notFound();
  const post = getPostMeta(slug);
  const content = await renderPost(slug);

  return (
    <PageFrame wide>
      <article className="blog-article writing-article min-w-0">
        <header className="blog-article-header min-w-0">
          <Link href="/writing" className="blog-article-back">
            Writing
          </Link>
          <time className="blog-article-date" dateTime={post.date}>
            {formatPostDate(post.date)}
          </time>
          <h1 className="blog-article-title">{post.title}</h1>
          <p className="blog-article-author">{post.author}</p>
          {post.image && !post.hideCoverImage && (
            <div className="blog-article-cover">
              {/* Static export: no image optimizer, so a plain lazy-decoded img. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt="" width={1200} height={675} className="aspect-video w-full object-cover" decoding="async" />
            </div>
          )}
        </header>

        <BlogArticleLayout>{content}</BlogArticleLayout>

        <footer className="writing-article-footer">
          <Link href="/writing">
            <span aria-hidden="true">←</span> Back to the shelf
          </Link>
        </footer>
      </article>
    </PageFrame>
  );
}
