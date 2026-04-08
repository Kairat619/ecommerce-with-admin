/**
 * Admin Settings Page
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export const AdminSettings = () => {
  const { t } = useTranslation();
  const { user, checkAuth } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [siteSettings, setSiteSettings] = useState({
    logo_url: '',
    hero_slides: [],
  });
  
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [siteSettingsError, setSiteSettingsError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
    fetchSiteSettings();
  }, [user]);

  const fetchSiteSettings = async () => {
    try {
      const response = await adminAPI.getSiteSettings();
      setSiteSettings({
        logo_url: response.data.logo_url || '',
        hero_slides: response.data.hero_slides || [],
      });
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const { authAPI } = await import('../../lib/api');
      await authAPI.updateMe({
        name: profileData.name,
        email: profileData.email,
      });
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      setProfileError(message);
      toast.error(message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      const msg = 'New passwords do not match';
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    if (passwordData.new_password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    setPasswordLoading(true);

    try {
      const { authAPI } = await import('../../lib/api');
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSiteSettingsSubmit = async (e) => {
    e.preventDefault();
    setSiteSettingsError('');
    setSiteSettingsLoading(true);

    try {
      const heroSlides = siteSettings.hero_slides.filter(slide => slide.image_url.trim() !== '');
      await adminAPI.updateSiteSettings({
        logo_url: siteSettings.logo_url,
        hero_slides: heroSlides,
      });
      toast.success('Site settings updated successfully');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update site settings';
      setSiteSettingsError(message);
      toast.error(message);
    } finally {
      setSiteSettingsLoading(false);
    }
  };

  const addHeroSlide = () => {
    setSiteSettings({
      ...siteSettings,
      hero_slides: [
        ...siteSettings.hero_slides,
        { image_url: '', title: '', subtitle: '', link: '' }
      ]
    });
  };

  const updateHeroSlide = (index, field, value) => {
    const newSlides = [...siteSettings.hero_slides];
    newSlides[index][field] = value;
    setSiteSettings({
      ...siteSettings,
      hero_slides: newSlides
    });
  };

  const removeHeroSlide = (index) => {
    const newSlides = siteSettings.hero_slides.filter((_, i) => i !== index);
    setSiteSettings({
      ...siteSettings,
      hero_slides: newSlides
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.settings')}</h1>
        <p className="text-muted-foreground">{t('admin.settings')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.profileInfo')}</CardTitle>
          <CardDescription>{t('admin.updateAccountDetails')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {profileError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">{t('admin.nameLabelUser')}</Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('admin.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" disabled={profileLoading}>
              {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.changePasswordTitle')}</CardTitle>
          <CardDescription>{t('admin.updatePassword')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {passwordError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="current_password">{t('admin.currentPassword')}</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password">{t('admin.newPassword')}</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('admin.confirmNewPassword')}</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.changePasswordTitle')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.siteSettingsTitle')}</CardTitle>
          <CardDescription>{t('admin.updateSiteLogo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSiteSettingsSubmit} className="space-y-4">
            {siteSettingsError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {siteSettingsError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">{t('admin.logoUrl')}</Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://example.com/logo.png"
                value={siteSettings.logo_url}
                onChange={(e) => setSiteSettings({ ...siteSettings, logo_url: e.target.value })}
              />
              {siteSettings.logo_url && (
                <div className="mt-2">
                  <img 
                    src={siteSettings.logo_url} 
                    alt="Logo preview" 
                    className="h-12 max-w-[200px] object-contain border rounded-md p-2 bg-white"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('admin.heroSlides')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addHeroSlide}>
                  <Plus className="h-4 w-4 mr-1" /> {t('admin.addProduct')}
                </Button>
              </div>
              
              {siteSettings.hero_slides.length === 0 ? (
                <div className="text-sm text-muted-foreground border rounded-md p-8 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {t('admin.noResults')}
                </div>
              ) : (
                <div className="space-y-4">
                  {siteSettings.hero_slides.map((slide, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Slide {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeroSlide(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`slide_image_${index}`}>{t('admin.slideImageUrl')}</Label>
                        <Input
                          id={`slide_image_${index}`}
                          type="url"
                          placeholder="https://example.com/slide.jpg"
                          value={slide.image_url}
                          onChange={(e) => updateHeroSlide(index, 'image_url', e.target.value)}
                        />
                        {slide.image_url && (
                          <div className="mt-2">
                            <img 
                              src={slide.image_url} 
                              alt={`Slide ${index + 1} preview`}
                              className="h-24 object-cover rounded-md"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`slide_title_${index}`}>{t('admin.slideTitle')}</Label>
                          <Input
                            id={`slide_title_${index}`}
                            type="text"
                            placeholder="Slide title"
                            value={slide.title}
                            onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`slide_subtitle_${index}`}>{t('admin.slideSubtitle')}</Label>
                          <Input
                            id={`slide_subtitle_${index}`}
                            type="text"
                            placeholder="Slide subtitle"
                            value={slide.subtitle}
                            onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`slide_link_${index}`}>{t('admin.slideLinkUrl')}</Label>
                        <Input
                          id={`slide_link_${index}`}
                          type="url"
                          placeholder="https://example.com/promo"
                          value={slide.link}
                          onChange={(e) => updateHeroSlide(index, 'link', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button type="submit" disabled={siteSettingsLoading}>
              {siteSettingsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
