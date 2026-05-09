import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '../lib/api';
import { SEO } from '../components/seo';
import { ChevronRight, Search, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = { page, page_size: 12 };
        if (search) params.q = search;
        const response = await blogAPI.list(params);
        setPosts(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    const params = new URLSearchParams();
    if (searchInput) params.set('q', searchInput);
    setSearchParams(params);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <>
      <SEO
        title="Editorial | ShopNest"
        description="Discover stories, style guides, and curated editorial content from ShopNest."
      />
      <div className="min-h-screen bg-surface">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pb-20 bg-black text-white">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-2xl">
              <span className="font-label-lg tracking-[0.2em] text-zinc-400 uppercase">ShopNest Editorial</span>
              <h1 className="font-display-md mt-4 mb-6">Stories & Style</h1>
              <p className="font-body-lg text-zinc-400">Curated editorial content on fashion, design, and modern living.</p>
            </div>
            <form onSubmit={handleSearch} className="mt-8 max-w-md flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search articles..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200">Search</Button>
            </form>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] bg-zinc-100 mb-4" />
                  <div className="h-4 bg-zinc-100 w-24 mb-2" />
                  <div className="h-6 bg-zinc-100 w-3/4 mb-2" />
                  <div className="h-4 bg-zinc-100 w-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-zinc-500">No articles found.</p>
              {search && (
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSearchInput(''); setSearchParams({}); }}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[16/10] bg-zinc-100 overflow-hidden mb-4">
                      <img
                        src={post.image_url || '/placeholder.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.published_at)}
                    </div>
                    <h2 className="font-serif text-xl font-bold text-zinc-900 group-hover:text-secondary transition-colors mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-zinc-500 text-sm line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-secondary">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-16">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <span className="text-sm text-zinc-500 px-4">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};
