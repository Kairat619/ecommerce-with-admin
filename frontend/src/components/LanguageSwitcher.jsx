/**
 * Language Switcher Component
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n, t } = useTranslation();
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  if (variant === 'admin') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            data-testid="admin-language-switcher"
          >
            <Globe className="mr-2 h-4 w-4" />
            <span className="mr-2">{currentLang.flag}</span>
            {currentLang.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="cursor-pointer"
              data-testid={`lang-${lang.code}`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
              {i18n.language === lang.code && (
                <Check className="ml-auto h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="language-switcher"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('common.language')}
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="cursor-pointer"
            data-testid={`lang-${lang.code}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
            {i18n.language === lang.code && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
