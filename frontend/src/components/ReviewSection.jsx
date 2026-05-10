import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { productsAPI, userReviewsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { StarRating } from './StarRating';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Pencil, Trash2, BadgeCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const ReviewSection = ({ productId, productSlug }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getReviews(productId, page);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.average_rating || 0);
      setReviewCount(res.data.review_count || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userReviewsAPI.getMyReviews(productSlug);
      if (res.data.reviews?.length > 0) {
        setMyReview(res.data.reviews[0]);
      } else {
        setMyReview(null);
      }
    } catch (err) {
      console.error('Failed to fetch my review:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyReview();
    }
  }, [isAuthenticated, productSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formComment.trim()) {
      toast.error(t('product.yourReview') + ' ' + t('cart.yourBagIsEmpty').toLowerCase());
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && myReview) {
        await userReviewsAPI.updateReview(myReview.id, { rating: formRating, comment: formComment });
      } else {
        await userReviewsAPI.createReview(productSlug, { rating: formRating, comment: formComment });
      }
      toast.success(t('product.reviewSubmitted'));
      setShowForm(false);
      setFormRating(5);
      setFormComment('');
      setIsEditing(false);
      fetchReviews();
      fetchMyReview();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('product.submitting'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    try {
      await userReviewsAPI.deleteReview(myReview.id);
      toast.success(t('product.deleteReview'));
      setMyReview(null);
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      toast.error(t('product.submitting'));
    }
  };

  const handleEdit = () => {
    if (myReview) {
      setFormRating(myReview.rating);
      setFormComment(myReview.comment || '');
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const openCreateForm = () => {
    setFormRating(5);
    setFormComment('');
    setIsEditing(false);
    setShowForm(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <section className="mt-16 border-t border-outline-variant pt-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="font-display-md text-primary mb-1">{t('product.reviews')}</h2>
          {reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <StarRating rating={averageRating} size="md" />
              <span className="font-label-lg text-on-surface-variant">
                {averageRating.toFixed(1)} ({t('product.reviewsCount', { count: reviewCount })})
              </span>
            </div>
          )}
        </div>
        {isAuthenticated && !myReview && !showForm && (
          <Button onClick={openCreateForm} className="bg-secondary text-white hover:bg-primary font-label-lg">
            {t('product.writeReview')}
          </Button>
        )}
        {isAuthenticated && myReview && !showForm && (
          <div className="flex items-center gap-2">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              {t('product.editReview')}
            </Button>
            <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-1" />
              {t('product.deleteReview')}
            </Button>
          </div>
        )}
        {!isAuthenticated && (
          <p className="font-body-sm text-on-surface-variant">{t('product.signInToSync')}</p>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant mb-10">
          <h3 className="font-label-lg text-primary mb-4">
            {isEditing ? t('product.editReview') : t('product.writeReview')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-label-lg text-label-lg text-primary mb-2">{t('product.yourRating')}</label>
              <StarRating rating={formRating} size="lg" interactive onChange={setFormRating} />
            </div>
            <div>
              <label className="block font-label-lg text-label-lg text-primary mb-2" htmlFor="review-comment">
                {t('product.yourReview')}
              </label>
              <textarea
                id="review-comment"
                value={formComment}
                onChange={(e) => setFormComment(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder={t('product.yourReview')}
              />
              <p className="text-right font-body-sm text-on-surface-variant mt-1">
                {t('product.characterCount', { count: formComment.length })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting} className="bg-secondary text-white hover:bg-primary font-label-lg">
                {submitting ? t('product.submitting') : (isEditing ? t('product.editReview') : t('product.submitReview'))}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t('admin.cancel')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-surface-container rounded-xl h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <p className="font-body-md">{t('admin.noReviewsYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-xl border border-outline-variant"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-label-lg text-primary overflow-hidden">
                    {review.user_picture ? (
                      <img src={review.user_picture} alt={review.user_name} className="w-full h-full object-cover" />
                    ) : (
                      (review.user_name || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-lg text-primary">{review.user_name}</span>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                          <BadgeCheck className="h-3 w-3" />
                          {t('product.verifiedPurchase')}
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <span className="font-body-sm text-on-surface-variant shrink-0">
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.comment && (
                <p className="font-body-md text-on-surface-variant leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-label-lg text-on-surface-variant">
            {t('products.page', { current: page, total: totalPages })}
          </span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
};
