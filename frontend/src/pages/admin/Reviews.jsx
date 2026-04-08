/**
 * Admin Reviews Page
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import { toast } from 'sonner';
import { Star, Edit, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminReviews = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const params = { page: filters.page, page_size: 20 };
        if (filters.status && filters.status !== 'all') {
          params.status = filters.status;
        }
        const response = await adminAPI.listReviews(params);
        setReviews(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [filters]);

  const handleStatusUpdate = async (reviewId, isApproved) => {
    try {
      await adminAPI.updateReviewStatus(reviewId, isApproved);
      toast.success(isApproved ? 'Review approved' : 'Review rejected');
      setFilters({ ...filters, page: 1 });
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminAPI.deleteReview(reviewId);
      toast.success('Review deleted');
      setFilters({ ...filters, page: 1 });
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    setFilters({ ...filters, status, page: 1 });
    setSearchParams({ status, page: '1' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.reviewsManagement')}</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('admin.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allReviews')}</SelectItem>
            <SelectItem value="pending">{t('admin.pendingReview')}</SelectItem>
            <SelectItem value="approved">{t('admin.approvedReview')}</SelectItem>
            <SelectItem value="rejected">{t('admin.rejectedReview')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.productLabel')}</TableHead>
              <TableHead>{t('admin.userLabelAdmin')}</TableHead>
              <TableHead>{t('admin.ratingLabel')}</TableHead>
              <TableHead>{t('admin.commentLabel')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead>{t('admin.date')}</TableHead>
              <TableHead className="w-[150px]">{t('admin.reviewActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-12 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('admin.noReviewsYet')}
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <Link 
                      to={`/products/${review.product_slug}`} 
                      className="font-medium hover:underline"
                      target="_blank"
                    >
                      {review.product_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.user_name}</p>
                      <p className="text-sm text-muted-foreground">{review.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-4 w-4", 
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                          )} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-muted-foreground">
                      {review.comment || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.is_approved ? "default" : "secondary"} className={cn(
                      review.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      {review.is_approved ? t('admin.approvedReview') : t('admin.pendingReview')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!review.is_approved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(review.id, true)}
                          title={t('admin.approve')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {review.is_approved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          onClick={() => handleStatusUpdate(review.id, false)}
                          title={t('admin.reject')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(review.id)}
                        title={t('admin.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('products.page', { current: filters.page, total: totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={filters.page === 1}
              onClick={() => {
                const newPage = filters.page - 1;
                setFilters({ ...filters, page: newPage });
                setSearchParams({ status: filter, page: String(newPage) });
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={filters.page >= totalPages}
              onClick={() => {
                const newPage = filters.page + 1;
                setFilters({ ...filters, page: newPage });
                setSearchParams({ status: filter, page: String(newPage) });
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};