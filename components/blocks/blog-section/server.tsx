import { ArrowRight } from "lucide-react";
import { getPostsByLocale } from "@/models/post";
import Link from "next/link";

interface BlogSectionProps {
  locale: string;
  title?: string;
  description?: string;
  label?: string;
  readMoreText?: string;
}

export default async function BlogSection({ 
  locale,
  title,
  description,
  label,
  readMoreText = "Read More"
}: BlogSectionProps) {
  // 直接在服务器端获取数据
  const posts = await getPostsByLocale(locale, 1, 3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16">
      <div className="container flex flex-col items-center gap-8 lg:px-16">
        <div className="text-center">
          {label && (
            <p className="mb-6 text-xs font-medium uppercase tracking-wider">
              {label}
            </p>
          )}
          {title && (
            <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
              {description}
            </p>
          )}
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${locale}/posts/${post.slug}`}
              className="group"
            >
              <article className="h-full flex flex-col overflow-hidden rounded-xl border border-border transition-all hover:shadow-lg">
                {post.cover_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.cover_url}
                      alt={post.title || ""}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col p-6">
                  <h3 className="mb-3 text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-muted-foreground line-clamp-3 flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-muted-foreground">
                      {post.created_at && new Date(post.created_at).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    <span className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                      {readMoreText}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 查看更多文章按钮 */}
        <Link 
          href={`/${locale}/posts`}
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
        >
          {locale === 'zh' ? '查看所有文章' : 'View All Articles'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}