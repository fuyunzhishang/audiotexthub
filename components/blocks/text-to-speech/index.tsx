"use client";

import { useState, useEffect, useRef } from "react";
import { Section as SectionType } from "@/types/blocks/section";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, Download, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ttsList } from "./tts";

// 定义语言分类接口
interface LanguageCategory {
  code: string;
  name: string;
  flag: string;
  voices: VoiceActor[];
}

// 定义语音演员接口
interface VoiceActor {
  key: string;
  name: string;
  icon: string;
  sex: string;
  lang: string;
  en_lang: string;
  example_voice_url: string;
  level: number;
  type?: string;
}

// 定义等级列表
export const leveList = [
  { value: 1, label: '免费' },
  { value: 2, label: '高级' },
  { value: 3, label: '专业' },
];

export default function TextToSpeech({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [text, setText] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 按语言分类整理数据
  const [languageCategories, setLanguageCategories] = useState<LanguageCategory[]>([]);
  const [currentVoices, setCurrentVoices] = useState<VoiceActor[]>([]);
  
  // 初始化数据
  useEffect(() => {
    if (ttsList && ttsList.length > 0 && ttsList[0].microSoft) {
      const voices = ttsList[0].microSoft;
      
      // 按语言分组
      const langMap = new Map<string, {name: string, voices: VoiceActor[]}>();
      
      voices.forEach(voice => {
        // 提取语言代码，例如 zh-CN, en-US 等
        const langCode = voice.key.split('-').slice(0, 2).join('-');
        
        if (!langMap.has(langCode)) {
          // 直接使用tts.js中的lang字段作为显示名称
          langMap.set(langCode, {
            name: voice.lang,  // 这里直接使用voice.lang
            voices: []
          });
        }
        
        // 把当前语音添加到对应语言的voices数组中
        langMap.get(langCode)?.voices.push(voice);
      });
      
      // 转换为语言分类数组
      const categories: LanguageCategory[] = [];
      
      // Mapping for country names to flags
      const countryFlagMap: { [key: string]: string } = {
        "中国": "🇨🇳",
        "台湾": "🇹🇼",
        "香港特别行政区": "🇭🇰",
        "美国": "🇺🇸",
        "英国": "🇬🇧",
        "澳大利亚": "🇦🇺",
        "加拿大": "🇨🇦",
        "日本": "🇯🇵",
        "韩国": "🇰🇷",
        "泰国": "🇹🇭",
        "越南": "🇻🇳",
        "印度尼西亚": "🇮🇩",
        "马来西亚": "🇲🇾",
        "阿拉伯": "🇦🇪",
        "以色列": "🇮🇱",
        "土耳其": "🇹🇷",
        "伊朗": "🇮🇷",
        "法国": "🇫🇷",
        "德国": "🇩🇪",
        "西班牙": "🇪🇸",
        "墨西哥": "🇲🇽",
        "葡萄牙": "🇵🇹",
        "巴西": "🇧🇷",
        "意大利": "🇮🇹",
        "俄罗斯": "🇷🇺",
        "阿尔巴尼亚": "🇦🇱",
        "埃塞俄比亚": "🇪🇹",
        "阿塞拜疆": "🇦🇿",
        "印度": "🇮🇳",
        "爱尔兰": "🇮🇪",
        "爱沙尼亚": "🇪🇪",
        "保加利亚": "🇧🇬",
        "冰岛": "🇮🇸",
        "南非": "🇿🇦",
        "坦桑尼亚": "🇹🇿",
        "新加坡": "🇸🇬",
        "菲律宾": "🇵🇭",
        "新西兰": "🇳🇿",
        "尼日利亚": "🇳🇬",
        "肯尼亚": "🇰🇪",
        // Add more mappings as needed based on your tts.js data
      };
      
      
      // Mapping for language names to flags (fallback)
      const languageFlagMap: { [key: string]: string } = {
        "中文": "🇨🇳",
        "普通话": "🇨🇳", // 匹配普通话到中国
        "英语": "🇺🇸", // 默认英语匹配美国
        "日语": "🇯🇵",
        "韩语": "🇰🇷",
        "泰语": "🇹🇭",
        "越南语": "🇻🇳",
        "印尼语": "🇮🇩",
        "马来语": "🇲🇾",
        "阿拉伯语": "🇦🇪",
        "希伯来语": "🇮🇱",
        "土耳其语": "🇹🇷",
        "波斯语": "🇮🇷",
        "法语": "🇫🇷",
        "德语": "🇩🇪",
        "西班牙语": "🇪🇸",
        "葡萄牙语": "🇵🇹",
        "意大利语": "🇮🇹",
        "俄语": "🇷🇺",
        "阿尔巴尼亚语": "🇦🇱",
        "阿姆哈拉语": "🇪🇹",
        "阿塞拜疆语": "🇦🇿",
        "印地语": "🇮🇳",
        "爱尔兰语": "🇮🇪",
        "爱沙尼亚语": "🇪🇪",
        "保加利亚语": "🇧🇬",
        "冰岛语": "🇮🇸",
        "南非荷兰语": "🇿🇦", // 示例，可能需要根据实际语言名称调整
        "斯瓦希里语": "🇹🇿", // 示例
        "他加禄语": "🇵🇭", // 示例
        "毛利语": "🇳🇿", // 示例
        "豪萨语": "🇳🇬", // 示例
        // Add more language to flag mappings as needed
      };
      
      
      langMap.forEach((value, key) => {
        // Extract country name from the lang string, e.g., "爱沙尼亚语(爱沙尼亚)" -> "爱沙尼亚"
        let countryName = "";
        const match = value.name.match(/\((.*?)\)/);
        if (match && match[1]) {
          countryName = match[1];
        }
      
        // Extract language name from the lang string, e.g., "爱沙尼亚语(爱沙尼亚)" -> "爱沙尼亚语"
        let languageName = value.name;
        const langMatch = value.name.match(/^(.*?)\(/);
        if (langMatch && langMatch[1]) {
          languageName = langMatch[1];
        } else {
          // 如果没有括号，使用整个名称作为语言名称
          languageName = value.name;
        }
      
        // Get flag: first try country name, then language name, default to globe
        let flag = countryFlagMap[countryName] || languageFlagMap[languageName] || "🌐";
      
        // Determine region type (can keep existing logic or simplify)
        let regionType = "其他";
        if (key.includes("en")) {
          regionType = "英语";
        } else if (key.includes("zh")) {
          regionType = "中文";
        } else if (key.includes("ja") || key.includes("ko") || key.includes("th") || key.includes("vi") || key.includes("id") || key.includes("ms")) {
          regionType = "东南亚";
        } else if (key.includes("ar") || key.includes("he") || key.includes("iw") || key.includes("tr") || key.includes("fa")) {
          regionType = "中东";
        }
      
      
        categories.push({
          code: key,
          name: value.name,  // Use the full name from tts.js
          flag: flag,
          voices: value.voices,
          regionType: regionType
        });
      });
      
      // 按地区类型和语言名称排序
      categories.sort((a, b) => {
        // 定义地区优先级
        const regionOrder = {
          "英语": 1,
          "中文": 2,
          "东南亚": 3,
          "中东": 4,
          "其他": 5
        };
      
        // 先按地区类型排序
        const regionComparison = (regionOrder[a.regionType] || 5) - (regionOrder[b.regionType] || 5); // Handle potential missing regionType
      
        // 如果地区相同，则按语言名称排序
        if (regionComparison === 0) {
          return a.name.localeCompare(b.name);
        }
      
        return regionComparison;
      });
      
      setLanguageCategories(categories);
      
      // 设置默认语言
      if (categories.length > 0) {
        // 优先选择中文或英文作为默认语言
        const defaultLang = categories.find(cat => cat.code.includes("zh")) || 
                            categories.find(cat => cat.code.includes("en")) || 
                            categories[0];
        setCurrentLanguage(defaultLang.code);
        setCurrentVoices(defaultLang.voices);
      }
    }
  }, []);
  
  // 当语言改变时更新语音列表
  useEffect(() => {
    const category = languageCategories.find(cat => cat.code === currentLanguage);
    if (category) {
      setCurrentVoices(category.voices);
    }
  }, [currentLanguage, languageCategories]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 限制输入字符数为2000
    if (e.target.value.length <= 2000) {
      setText(e.target.value);
    }
  };

  const handleLanguageChange = (value: string) => {
    setCurrentLanguage(value);
    setCurrentAudio(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playAudio = (audioSrc: string) => {
    if (currentAudio === audioSrc && isPlaying) {
      // 暂停当前播放
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // 播放新的音频
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      setCurrentAudio(audioSrc);
      setIsPlaying(true);
      
      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.play();
      }
    }
  };

  // 获取等级标签
  const getLevelLabel = (level: number) => {
    const levelItem = leveList.find(item => item.value === level);
    return levelItem ? levelItem.label : '';
  };

  useEffect(() => {
    // 创建音频元素
    const audio = new Audio();
    audioRef.current = audio;
    
    // 监听音频播放结束事件
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => {
        setIsPlaying(false);
      });
    };
  }, []);

  return (
    <section id={section.name} className="py-16">
      <div className="container">
        <div className="flex flex-col items-center gap-4">
          {section.label && (
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
              {section.icon && (
                <Icon name={section.icon} className="h-6 w-auto border-primary" />
              )}
              {section.label}
            </div>
          )}
          <h2 className="text-center text-3xl font-semibold lg:text-4xl">
            {section.title}
          </h2>
          <p className="text-center text-muted-foreground lg:text-lg">
            {section.description}
          </p>
        </div>
        
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <Textarea 
              placeholder="在此输入文本，最多2000个字符..." 
              value={text} 
              onChange={handleTextChange}
              className="min-h-32 resize-none"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>字符数: {text.length}/2000</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">选择语言:</span>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  {languageCategories.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentLanguage && (
                <Badge variant="outline" className="ml-2">
                  {languageCategories.find(lang => lang.code === currentLanguage)?.flag} 
                  {languageCategories.find(lang => lang.code === currentLanguage)?.name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentVoices.map((voice) => (
              <Card key={voice.key} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-full ring-1 ring-input">
                    <AvatarImage 
                      src={voice.icon} 
                      alt={voice.name} 
                    />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{voice.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{voice.sex}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {getLevelLabel(voice.level)}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => playAudio(voice.example_voice_url)}
                    className="size-8 flex-shrink-0"
                  >
                    {currentAudio === voice.example_voice_url && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </section>
  );
}