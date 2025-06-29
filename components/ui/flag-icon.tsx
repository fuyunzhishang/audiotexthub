'use client';

import React, { useState } from 'react';

interface FlagIconProps {
  countryCode: string;
  className?: string;
  size?: number;
}

// 语言代码到国家代码的映射
const languageToCountryMap: { [key: string]: string } = {
  // 中文
  'zh-CN': 'cn',
  'zh-TW': 'tw',
  'zh-HK': 'hk',
  // 英语
  'en-US': 'us',
  'en-GB': 'gb',
  'en-AU': 'au',
  'en-CA': 'ca',
  'en-NZ': 'nz',
  'en-IE': 'ie',
  'en-ZA': 'za',
  'en-IN': 'in',
  'en-SG': 'sg',
  'en-PH': 'ph',
  'en-NG': 'ng',
  'en-KE': 'ke',
  // 其他语言
  'ja-JP': 'jp',
  'ko-KR': 'kr',
  'th-TH': 'th',
  'vi-VN': 'vn',
  'id-ID': 'id',
  'ms-MY': 'my',
  'ar-AE': 'ae',
  'ar-SA': 'sa',
  'ar-EG': 'eg',
  'he-IL': 'il',
  'tr-TR': 'tr',
  'fa-IR': 'ir',
  'fr-FR': 'fr',
  'fr-CA': 'ca',
  'de-DE': 'de',
  'de-AT': 'at',
  'de-CH': 'ch',
  'es-ES': 'es',
  'es-MX': 'mx',
  'es-AR': 'ar',
  'pt-PT': 'pt',
  'pt-BR': 'br',
  'it-IT': 'it',
  'ru-RU': 'ru',
  'pl-PL': 'pl',
  'nl-NL': 'nl',
  'sv-SE': 'se',
  'no-NO': 'no',
  'da-DK': 'dk',
  'fi-FI': 'fi',
  'is-IS': 'is',
  'cs-CZ': 'cz',
  'sk-SK': 'sk',
  'hu-HU': 'hu',
  'ro-RO': 'ro',
  'bg-BG': 'bg',
  'hr-HR': 'hr',
  'sl-SI': 'si',
  'et-EE': 'ee',
  'lv-LV': 'lv',
  'lt-LT': 'lt',
  'uk-UA': 'ua',
  'el-GR': 'gr',
  'sq-AL': 'al',
  'am-ET': 'et',
  'az-AZ': 'az',
  'bn-BD': 'bd',
  'bn-IN': 'in',
  'hi-IN': 'in',
  'ta-IN': 'in',
  'te-IN': 'in',
  'mr-IN': 'in',
  'gu-IN': 'in',
  'kn-IN': 'in',
  'ml-IN': 'in',
  'sw-KE': 'ke',
  'sw-TZ': 'tz',
  'af-ZA': 'za',
  'cy-GB': 'gb',
  'eu-ES': 'es',
  'ca-ES': 'es',
  'gl-ES': 'es',
};

export function FlagIcon({ countryCode, className = '', size = 24 }: FlagIconProps) {
  const [hasError, setHasError] = useState(false);
  
  // 从语言代码获取国家代码
  const getCountryCode = (code: string): string => {
    // 如果已经是2位国家代码，直接返回
    if (code.length === 2) {
      return code.toLowerCase();
    }
    
    // 从映射中查找
    const mappedCode = languageToCountryMap[code];
    if (mappedCode) {
      return mappedCode;
    }
    
    // 尝试从语言代码中提取国家代码 (例如 en-US -> us)
    const parts = code.split('-');
    if (parts.length > 1) {
      return parts[1].toLowerCase();
    }
    
    // 默认返回通用的世界图标
    return 'un'; // 联合国旗帜作为默认
  };

  const countryCodeLower = hasError ? 'un' : getCountryCode(countryCode);
  
  // 使用flagcdn.com的服务
  const flagUrl = `https://flagcdn.com/w${size}/${countryCodeLower}.png`;
  const flagUrl2x = `https://flagcdn.com/w${size * 2}/${countryCodeLower}.png`;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={flagUrl}
        srcSet={`${flagUrl} 1x, ${flagUrl2x} 2x`}
        alt={`${countryCode} flag`}
        width={size}
        height={size * 0.75} // 国旗通常是4:3的比例
        className="object-contain rounded-sm"
        loading="lazy"
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}