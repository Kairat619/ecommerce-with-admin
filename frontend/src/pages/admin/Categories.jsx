/**
 * Admin Categories Page
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminCategories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    sort_order: '0',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.listCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      sort_order: '0',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      sort_order: String(category.sort_order || 0),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        sort_order: parseInt(formData.sort_order),
      };

      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, data);
        toast.success('Category updated');
      } else {
        await adminAPI.createCategory(data);
        toast.success('Category created');
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminAPI.deleteCategory(deleteConfirm.id);
      toast.success('Category deleted');
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await adminAPI.updateCategory(category.id, { is_active: !category.is_active });
      toast.success(`Category ${category.is_active ? 'deactivated' : 'activated'}`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-categories">
      <div className="flex items-center justify-between">
<h1 className="text-2xl font-bold">{t('admin.categories')}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.addCategory')}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{t('admin.imageLabel')}</TableHead>
              <TableHead>{t('admin.categoryName')}</TableHead>
              <TableHead>{t('admin.categorySlug')}</TableHead>
              <TableHead>{t('admin.categoryOrder')}</TableHead>
              <TableHead>{t('admin.categoryStatus')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.categoryActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-12 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('admin.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => handleToggleActive(category)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteConfirm(category)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? t('admin.editCategory') : t('admin.addCategory')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('admin.nameRequired')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">{t('admin.descriptionLabelCategory')}</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="image_url">{t('admin.categoryImageUrl')}</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sort_order">{t('admin.categorySortOrder')}</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit">
                {editingCategory ? t('admin.update') : t('admin.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.deleteCategoryTitle')}</DialogTitle>
          </DialogHeader>
          <p>{t('admin.confirmDelete', { name: deleteConfirm?.name })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('admin.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('admin.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
