"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlagIcon } from "@/components/ui/flag-icon";
import { Crown } from "lucide-react";

interface LanguageCategory {
  code: string;
  name: string;
  voices: any[];
}

interface LanguageSelectorProps {
  categories: LanguageCategory[];
  currentLanguage: string;
  onLanguageChange: (value: string) => void;
  placeholder?: string;
  isLoggedIn?: boolean;
  loginToUseLabel?: string;
  showPremiumIcon?: boolean;
}

export function LanguageSelector({
  categories,
  currentLanguage,
  onLanguageChange,
  placeholder = "Select language",
  isLoggedIn = false,
  loginToUseLabel = "Login to use",
  showPremiumIcon = true,
}: LanguageSelectorProps) {
  return (
    <Select value={currentLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((lang) => {
          // 检查该语言是否包含高级语音
          const hasPremiumVoices = lang.voices.some(voice => voice.isPremium);
          const isMultilingual = lang.code === 'multilingual';
          
          return (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className={isMultilingual ? "bg-primary/10 hover:bg-primary/20" : ""}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {isMultilingual ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-lg">🌍</span>
                    </div>
                  ) : (
                    <FlagIcon countryCode={lang.code} size={20} />
                  )}
                  <span className={isMultilingual ? "font-semibold" : ""}>{lang.name}</span>
                </div>
                {showPremiumIcon && (hasPremiumVoices || isMultilingual) && (
                  <div className="flex items-center gap-1 ml-2">
                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                    {!isMultilingual && !isLoggedIn && (
                      <span className="text-xs text-muted-foreground">
                        {loginToUseLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}