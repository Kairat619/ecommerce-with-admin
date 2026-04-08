/**
 * Admin Users Page
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import { toast } from 'sonner';
import { Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialog, setEditDialog] = useState(null);
  const [editData, setEditData] = useState({ name: '', role: '', is_active: true });

  const [filters, setFilters] = useState({
    q: '',
    role: '',
    page: 1,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, page_size: 20 };
      if (filters.q) params.q = filters.q;
      if (filters.role && filters.role !== 'all') params.role = filters.role;

      const response = await adminAPI.listUsers(params);
      setUsers(response.data.items);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const openEditDialog = (user) => {
    setEditDialog(user);
    setEditData({
      name: user.name,
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleUpdate = async () => {
    if (!editDialog) return;
    try {
      await adminAPI.updateUser(editDialog.id, editData);
      toast.success('User updated');
      setEditDialog(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-users">
      <h1 className="text-2xl font-bold">{t('admin.users')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.role}
          onValueChange={(value) => setFilters({ ...filters, role: value, page: 1 })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
            <SelectItem value="admin">{t('admin.adminRole')}</SelectItem>
            <SelectItem value="customer">{t('admin.customerRole')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.userLabel')}</TableHead>
              <TableHead>{t('admin.emailLabel')}</TableHead>
              <TableHead>{t('admin.roleLabel')}</TableHead>
              <TableHead>{t('admin.providerLabel')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead>{t('admin.joinedLabel')}</TableHead>
              <TableHead className="w-[80px]">{t('admin.actions')}</TableHead>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('admin.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {user.auth_provider}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {filters.page} of {totalPages}</span>
          <Button
            variant="outline"
            size="icon"
            disabled={filters.page === totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.editUserTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('admin.nameLabelUser')}</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">{t('admin.roleLabel')}</Label>
              <Select
                value={editData.role}
                onValueChange={(value) => setEditData({ ...editData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">{t('admin.customerRole')}</SelectItem>
                  <SelectItem value="admin">{t('admin.adminRole')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">{t('admin.activeLabel')}</Label>
              <Switch
                id="is_active"
                checked={editData.is_active}
                onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>{t('admin.cancel')}</Button>
            <Button onClick={handleUpdate}>{t('admin.update')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
