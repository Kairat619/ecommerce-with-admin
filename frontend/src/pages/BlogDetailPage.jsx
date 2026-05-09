import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../lib/api';
import { SEO, ArticleSchema } from '../components/seo';
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await blogAPI.getBySlug(slug);
        setPost(response.data);
      } catch (err) {
        setError('Article not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 md:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-zinc-100 w-32" />
            <div className="h-10 bg-zinc-100 w-3/4" />
            <div className="h-4 bg-zinc-100 w-48" />
            <div className="aspect-[16/9] bg-zinc-100" />
            <div className="space-y-3">
              <div className="h-4 bg-zinc-100 w-full" />
              <div className="h-4 bg-zinc-100 w-full" />
              <div className="h-4 bg-zinc-100 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-zinc-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Editorial</Button>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Editorial', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <SEO
        title={`${post.title} | ShopNest Editorial`}
        description={post.excerpt || post.title}
        canonical={`/blog/${post.slug}`}
        ogImage={post.image_url}
        ogType="article"
      />
      <ArticleSchema
        title={post.title}
        description={post.excerpt || post.title}
        image={post.image_url}
        datePublished={post.published_at}
        authorName={post.author_name || 'ShopNest'}
      />

      <div className="min-h-screen bg-surface">
        <main className="pt-32 pb-20 max-w-3xl mx-auto px-4 md:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-label-sm text-outline">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/blog" className="hover:text-primary">Editorial</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-on-surface truncate">{post.title}</span>
          </nav>

          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Editorial
          </Link>

          <article>
            {/* Header */}
            <header className="mb-8">
              <h1 className="font-display-md text-on-surface tracking-tighter mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.published_at)}
                </span>
                {post.author_name && (
                  <span>By {post.author_name}</span>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {post.image_url && (
              <div className="aspect-[16/9] bg-zinc-100 overflow-hidden mb-10">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-zinc max-w-none font-body-md leading-relaxed text-on-surface-variant">
              {post.excerpt && (
                <p className="text-lg font-medium text-on-surface mb-6">{post.excerpt}</p>
              )}
              {post.content ? (
                post.content.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
                ))
              ) : (
                <p className="text-zinc-400 italic">No content available.</p>
              )}
            </div>
          </article>

          {/* Footer */}
          <div className="border-t border-zinc-200 mt-16 pt-8">
            <Link to="/blog">
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> More Articles</Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};
