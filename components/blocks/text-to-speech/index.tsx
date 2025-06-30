"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, Download, ChevronDown, Loader2, Crown, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
// import { ttsList } from "./tts";
import { useTranslations, useLocale } from "next-intl";
import { TextToSpeechSection } from "@/types/blocks/text-to-speech";
import { useAppContext } from "@/contexts/app";
import { useSession } from "next-auth/react";
import AudioPlayer from "./AudioPlayer";
import { FlagIcon } from "@/components/ui/flag-icon";

// 添加静态图片引用
const femaleAvatar = "/imgs/female.png";
const maleAvatar = "/imgs/male.png";

// 定义语言分类接口
interface LanguageCategory {
  code: string;
  name: string;
  voices: VoiceActor[];
}

// 定义语音演员接口
interface VoiceActor {
  id: string; // 改为id
  name: string;
  icon: string;
  gender: string; // 改为gender
  lang: string;
  en_lang: string;
  example_voice_url: string;
  level?: number;
  type?: string;
  provider?: string; // 添加供应商标识
  isPremium?: boolean; // 添加高级标识
}

// 定义语音生成结果接口
interface SpeechResult {
  id: string;
  text: string;
  voiceKey: string;
  voiceName: string;
  audioUrl: string;
  createdAt: Date;
  provider?: string;
}

// 定义等级列表
const leveList = [
  { value: 1, label: 'free' },
  { value: 2, label: 'premium' },
  { value: 3, label: 'professional' },
];



export default function TextToSpeech({ section }: { section: TextToSpeechSection }) {
  if (section.disabled) {
    return null;
  }

  // 获取当前语言环境
  const locale = useLocale();
  
  // 获取用户登录状态
  const { data: session } = useSession();
  const { user, setShowSignModal } = useAppContext();
  const isLoggedIn = !!(session && user);

  const [text, setText] = useState("");
  // 将初始语言设置为美式英语
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 添加新状态
  const [selectedVoice, setSelectedVoice] = useState<VoiceActor | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<SpeechResult[]>([]);
  const [latestResultId, setLatestResultId] = useState<string | null>(null); // 跟踪最新生成的结果

  // 按语言分类整理数据
  const [languageCategories, setLanguageCategories] = useState<LanguageCategory[]>([]);
  const [currentVoices, setCurrentVoices] = useState<VoiceActor[]>([]);

  const [speed, setSpeed] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(100); // 音量，默认1.0
  const [pitch, setPitch] = useState(0); // 音调，默认0
  
  // 使用限制状态
  const [usageLimit, setUsageLimit] = useState<{
    allowed: boolean;
    remaining: number;
    used: number;
    limit: number;
  } | null>(null);
  
  // 处理语音数据的函数
  const processVoicesData = (data: any) => {
    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    // 合并所有供应商的语音数据 - 现在API已经处理了isPremium标记
    const allGroupedVoices: { [key: string]: VoiceActor[] } = {};
    
    // 处理所有提供商的语音数据
    const providers = ['microsoft', 'microsoft-api', 'google', 'google-genai'];
    
    providers.forEach(provider => {
      if (data.data && data.data[provider] && data.data[provider].grouped) {
        Object.entries(data.data[provider].grouped).forEach(([langCode, voices]: [string, any]) => {
          if (voices && voices.length > 0) {
            // 为每个语音生成唯一的id并处理数据
            const processedVoices = voices.map((voice: any, index: number) => ({
              ...voice,
              id: voice.id || voice.key || `${provider}-${langCode}-${index}`, // 优先使用key作为id
              provider: voice.provider || provider, // 确保有provider字段
              type: voice.type || voice.provider || provider, // 确保有type字段，优先使用原始type，否则使用provider
              isPremium: voice.isPremium !== undefined ? voice.isPremium : false // 确保有isPremium字段
            }));
            allGroupedVoices[langCode] = (allGroupedVoices[langCode] || []).concat(processedVoices);
          }
        });
      }
    });

    const groupedVoices = allGroupedVoices;

    // 直接使用API返回的分组数据
    const langMap = new Map<string, { name: string, voices: VoiceActor[] }>();

    Object.entries(groupedVoices).forEach(([langCode, voices]: [string, any]) => {
      if (voices && voices.length > 0) {
        langMap.set(langCode, {
          name: voices[0].lang, // 使用第一个语音的lang作为语言名称
          voices: voices
        });
      }
    });

    // 转换为语言分类数组
    const categories: LanguageCategory[] = [];

    langMap.forEach((value, key) => {
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

      // 根据当前语言环境选择显示的语音名称
      let displayName = locale === 'zh' ? value.name :
        (value.voices[0]?.en_lang || value.name);
      
      // 特殊处理"多语言支持"选项
      if (value.name === '多语言支持' || key === 'multilingual' || key === 'all') {
        displayName = locale === 'zh' ? '多语言支持' : 'Multi-language Support';
      }

      // 对语音进行排序：普通语音在前，高级语音在后
      const sortedVoices = value.voices.sort((a, b) => {
        // 首先按是否为高级语音排序（普通语音在前）
        if (a.isPremium !== b.isPremium) {
          return a.isPremium ? 1 : -1;
        }
        // 然后按名字排序
        return a.name.localeCompare(b.name);
      });

      categories.push({
        code: key,
        name: displayName,  // 使用根据语言环境选择的名称
        voices: sortedVoices, // 使用排序后的语音列表
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
      //@ts-ignore
      const regionComparison = (regionOrder[a.regionType] || 5) - (regionOrder[b.regionType] || 5); // Handle potential missing regionType

      // 如果地区相同，则按语言名称排序
      if (regionComparison === 0) {
        return a.name.localeCompare(b.name);
      }

      return regionComparison;
    });

    // 添加"多语言支持"选项到第一个位置
    const multilingualOption: LanguageCategory = {
      code: 'multilingual',
      name: locale === 'zh' ? '多语言支持' : 'Multi-language Support',
      voices: [] // 稍后会填充谷歌的多语言语音
    };
    
    // 只收集谷歌的语音（google-genai）到多语言选项中
    categories.forEach(category => {
      const googleVoices = category.voices.filter(voice => 
        voice.provider === 'google-genai' || voice.provider === 'google'
      );
      multilingualOption.voices.push(...googleVoices);
    });
    
    // 对多语言选项中的语音进行排序
    multilingualOption.voices.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    
    // 将多语言选项插入到第一个位置
    categories.unshift(multilingualOption);
    
    setLanguageCategories(categories);

    // 设置默认语言
    if (categories.length > 0) {
      // 优先选择美式英语 (en-US) 作为默认语言
      const defaultLang = categories.find(cat => cat.code === "en-US") ||
        categories.find(cat => cat.code.includes("zh")) ||
        categories.find(cat => cat.code.includes("en")) ||
        categories[0];
      setCurrentLanguage(defaultLang.code);
      setCurrentVoices(defaultLang.voices);
    }
  };



  // 初始化数据 - 从服务端API获取语音列表
  useEffect(() => {
    const fetchVoices = async () => {
      const cacheKey = 'tts_voices_cache';
      let cachedData: string | null = null;
      let cacheTimestamp: string | null = null;
      
      try {
        // 检查本地缓存
        cachedData = localStorage.getItem(cacheKey);
        cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // 检查缓存是否存在且未过期（24小时）
        if (cachedData && cacheTimestamp) {
          const now = Date.now();
          const cacheTime = parseInt(cacheTimestamp);
          const twentyFourHours = 24 * 60 * 60 * 1000; // 24小时的毫秒数
          
          if (now - cacheTime < twentyFourHours) {
            console.log('使用缓存的语音列表数据');
            const data = JSON.parse(cachedData);
            processVoicesData(data);
            return;
          }
        }
        
        // 缓存不存在或已过期，从服务器获取
        console.log('从服务器获取语音列表数据');
        const response = await fetch('/api/tts/voices?provider=all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        
        const data = await response.json();
        
        // 保存到本地缓存
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        
        // 处理语音数据
        processVoicesData(data);
      } catch (error) {
        console.error('获取语音列表失败:', error);
        // 如果从服务器获取失败，尝试使用缓存数据
        if (cachedData) {
          console.log('服务器请求失败，使用过期的缓存数据');
          try {
            const data = JSON.parse(cachedData);
            processVoicesData(data);
          } catch (cacheError) {
            console.error('缓存数据解析失败:', cacheError);
          }
        }
      }
    };

    fetchVoices();
  }, []);

  // 当语言改变时更新语音列表和重置选中的角色
  useEffect(() => {
    const category = languageCategories.find(cat => cat.code === currentLanguage);
    if (category) {
      setCurrentVoices(category.voices);
      setSelectedVoice(null); // 重置选中的角色
    }
  }, [currentLanguage, languageCategories]);

  // 清除最新结果标记，避免重复自动播放
  useEffect(() => {
    if (latestResultId) {
      const timer = setTimeout(() => {
        setLatestResultId(null);
      }, 1000); // 1秒后清除标记
      return () => clearTimeout(timer);
    }
  }, [latestResultId]);
  
  // 获取使用限制信息
  useEffect(() => {
    const fetchUsageLimit = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch('/api/tts/usage-limit');
          if (response.ok) {
            const data = await response.json();
            setUsageLimit(data.usage);
          }
        } catch (error) {
          console.error('Failed to fetch usage limit:', error);
        }
      }
    };
    
    fetchUsageLimit();
    // 每次生成后也更新使用限制
  }, [isLoggedIn, results]);

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

  // 添加选择角色的处理函数
  const handleSelectVoice = (voice: VoiceActor) => {
    // 允许选择任何语音（包括高级语音），但在生成时进行验证
    setSelectedVoice(voice === selectedVoice ? null : voice);
  };

  // 处理语音URL，为谷歌语音的相对路径添加baseURL
  const getFullAudioUrl = (audioUrl: string, provider?: string) => {
    // 如果是完整URL（包含http或https），直接返回
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }
    
    // 如果是谷歌相关的provider且是相对路径，添加baseURL
    if ((provider === 'google' || provider === 'google-genai') && audioUrl.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      return `${baseUrl}${audioUrl}`;
    }
    
    // 其他情况直接返回原URL
    return audioUrl;
  };

  const playAudio = (audioSrc: string) => {
    if (currentAudio === audioSrc && isPlaying) {
      // 暂停当前播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // 重置播放位置
      }
      setIsPlaying(false);
      setCurrentAudio(null);
    } else {
      // 停止所有正在播放的音频（包括AudioPlayer中的音频）
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // 停止页面上所有其他音频元素
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      setCurrentAudio(audioSrc);
      setIsPlaying(true);

      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.play().catch(error => {
          console.error('音频播放失败:', error);
          setIsPlaying(false);
          setCurrentAudio(null);
        });
      }
    }
  };

  // 生成语音函数
  const handleGenerateSpeech = async () => {
    if (!selectedVoice || !text.trim() || isGenerating) return;

    // 双重验证：如果选中的是高级语音但用户未登录，则拒绝生成
    if (selectedVoice.isPremium && !isLoggedIn) {
      setShowSignModal(true);
      return;
    }

    try {
      setIsGenerating(true);

      // 调用本地API包装接口
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedVoice.type || 'microsoft-api', // 使用type字段作为provider
          text: text,
          voiceId: selectedVoice.id,
          speed: speed / 100 + 1, // 转换速度范围从-100~100到0.5~2
          pitch: pitch / 100 + 1, // 转换音调范围从-100~100到0.5~2  
          volume: volume / 100, // 转换音量范围从0~100到0~1
          format: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error('生成语音失败');
      }

      const data = await response.json();
      console.log('TTS Response data:', data);

      // 从响应数据中提取音频URL
      // 处理嵌套的数据结构：data.data.url 或直接的 data.url
      let audioUrl = '';
      
      // 如果响应有嵌套的data对象
      if (data.data && typeof data.data === 'object') {
        audioUrl = data.data.url || data.data.audioUrl || data.data.audio_url || data.data.fileUrl || data.data.file_url;
      }
      
      // 如果嵌套结构中没找到，尝试顶层
      if (!audioUrl) {
        audioUrl = data.audioUrl || data.url || data.audio_url || data.fileUrl || data.file_url;
      }
      
      if (!audioUrl) {
        console.error('No audio URL found in response:', data);
        throw new Error('服务器未返回音频文件地址');
      }

      // 创建新的结果记录
      const newResult: SpeechResult = {
        id: Date.now().toString(),
        text: text.length > 30 ? text.substring(0, 30) + '...' : text,
        voiceKey: selectedVoice.id,
        voiceName: selectedVoice.name,
        audioUrl: audioUrl,
        createdAt: new Date(),
        provider: selectedVoice.type || selectedVoice.provider // 使用type或provider
      };

      // 添加到结果列表
      setResults(prev => [newResult, ...prev]);
      setLatestResultId(newResult.id); // 标记为最新结果

    } catch (error) {
      console.error('生成语音失败:', error);
      toast.error('生成语音失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 删除结果记录
  const handleDeleteResult = (id: string) => {
    setResults(prev => prev.filter(item => item.id !== id));
  };

  // 获取等级标签
  const getLevelLabel = (level: number) => {
    const levelItem = leveList.find(item => item.value === level);
    return levelItem ? levelItem.label : '';
  };

  useEffect(() => {
    // 创建音频元素（只用于试听功能）
    const audio = new Audio();
    audioRef.current = audio;

    // 监听音频播放结束事件
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => {
        setIsPlaying(false);
      });
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="space-y-6">
            {/* 文本输入区域 */}
            <div className="relative">
              <Textarea
                placeholder={currentLanguage === 'multilingual' ? section.multilingual_input_placeholder : section.input_placeholder}
                value={text}
                onChange={handleTextChange}
                className="min-h-40 resize-none pr-24"
              />
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                <span>{text.length}/2000</span>
              </div>
            </div>
            
            {/* 显示高级语音使用限制提示 */}
            {selectedVoice?.isPremium && isLoggedIn && usageLimit && (
              <div className="text-sm text-muted-foreground">
                <span className="text-yellow-600">
                  {locale === 'zh' 
                    ? `高级语音每日限额：${usageLimit.used}/${usageLimit.limit} 次已使用` 
                    : `Premium voice daily limit: ${usageLimit.used}/${usageLimit.limit} uses`}
                </span>
              </div>
            )}

            {/* 生成结果显示在输入框下方 - 只显示一行 */}
            {results.length > 0 && (
              <div className="">
                {results.slice(0, 1).map((result) => (
                  <Card key={result.id} className="p-4">
                    <AudioPlayer 
                      audioUrl={result.audioUrl}
                      voiceName={result.voiceName}
                      voiceFilePrefix={section.voice_file_prefix}
                      playLabel={section.play}
                      pauseLabel={section.pause}
                      provider={result.provider}
                      autoPlay={result.id === latestResultId} // 只有最新的结果才自动播放
                      onPlayingChange={(isPlaying) => {
                        // 当AudioPlayer开始播放时，停止其他所有音频
                        if (isPlaying && audioRef.current) {
                          audioRef.current.pause();
                          setIsPlaying(false);
                          setCurrentAudio(null);
                        }
                      }}
                    />
                  </Card>
                ))}
              </div>
            )}

            {/* 语言选择、设置和生成按钮 */}
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm font-medium">{section.select_language}:</span>
                <span 
                  className="text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  onClick={() => handleLanguageChange('multilingual')}
                >
                  {locale === 'zh' ? '🎉 新增30个多语言角色' : '🎉 30 new multilingual voices'}
                </span>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={section.select_language_placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {languageCategories.map((lang) => {
                      // 检查该语言是否包含高级语音（谷歌语音）
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
                            {(hasPremiumVoices || isMultilingual) && (
                              <div className="flex items-center gap-1 ml-2">
                                <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                {!isMultilingual && (
                                  <span className="text-xs text-muted-foreground">
                                    {isLoggedIn ? '' : section.login_to_use}
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
                {/* {currentLanguage && (
                  <Badge variant="outline" className="ml-2 flex items-center gap-1">
                    <FlagIcon countryCode={currentLanguage} size={16} />
                    {languageCategories.find(lang => lang.code === currentLanguage)?.name}
                  </Badge>
                )} */}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{section.voice_settings.title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>{section.voice_settings.speed}: {speed}%</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={speed}
                            onChange={(e) => setSpeed(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>{section.voice_settings.volume}: {volume}%</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>{section.voice_settings.pitch}: {pitch}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={pitch}
                            onChange={(e) => setPitch(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* 生成按钮移到这里 */}
                <div className="ml-auto">
                  <Button
                    disabled={
                      !selectedVoice || 
                      !text.trim() || 
                      isGenerating
                    }
                    onClick={handleGenerateSpeech}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {section.generating}
                      </>
                    ) : (
                      section.generate_voice
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 语音角色选择 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentVoices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`relative p-4 transition-all duration-200 cursor-pointer group ${
                    selectedVoice?.id === voice.id 
                      ? 'border-2 border-primary bg-primary/5 shadow-lg' 
                      : voice.isPremium
                        ? 'hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-100/25 ring-1 ring-yellow-200/30'
                        : 'hover:border-primary/50 hover:shadow-lg'
                  }`}
                  onClick={() => handleSelectVoice(voice)}
                >
                  {/* 高级语音标识 - 只显示高级会员图标 */}
                  {voice.isPremium && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-yellow-300/50">
                        <Crown className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <Avatar className="size-12 rounded-full ring-2 ring-input group-hover:ring-primary/50 transition-all">
                        <AvatarImage
                          src={voice.gender === 'Female' ? femaleAvatar : maleAvatar}
                          alt={voice.name}
                        />
                      </Avatar>
                      
                      {/* 播放按钮 - 试听不需要登录验证 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 试听功能对所有用户开放，不需要登录验证
                          const fullUrl = getFullAudioUrl(voice.example_voice_url, voice.provider);
                          playAudio(fullUrl);
                        }}
                        className="absolute -bottom-1 -right-1 size-7 rounded-full bg-background border shadow-sm hover:shadow-md transition-all"
                        title="试听语音"
                      >
                        {(() => {
                          const fullUrl = getFullAudioUrl(voice.example_voice_url, voice.provider);
                          return currentAudio === fullUrl && isPlaying ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          );
                        })()}
                      </Button>
                    </div>
                    
                    <div className="text-center space-y-1 w-full">
                      <p className="font-medium text-sm truncate" title={voice.name}>
                        {voice.name}
                      </p>
                      
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {voice.gender}
                        </Badge>
                        
                        {voice.isPremium && (
                          <Badge 
                            variant="default" 
                            className="text-xs font-semibold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-md"
                          >
                            🔥 {section.voice_premium}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 选中状态指示器 */}
                  {selectedVoice?.id && selectedVoice?.id === voice.id && (
                    <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none">
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {section.voice_selected}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 移除了原来的生成按钮和底部结果区域 */}
      </div>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
