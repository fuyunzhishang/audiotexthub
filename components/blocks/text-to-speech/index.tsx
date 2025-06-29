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

// 添加静态图片引用
const femaleAvatar = "/imgs/female.png";
const maleAvatar = "/imgs/male.png";

// 定义语言分类接口
interface LanguageCategory {
  code: string;
  name: string;
  flag: string;
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

  // 按语言分类整理数据
  const [languageCategories, setLanguageCategories] = useState<LanguageCategory[]>([]);
  const [currentVoices, setCurrentVoices] = useState<VoiceActor[]>([]);

  const [speed, setSpeed] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(100); // 音量，默认1.0
  const [pitch, setPitch] = useState(0); // 音调，默认0



  // 初始化数据 - 从服务端API获取语音列表
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        // 直接调用本地API路由，不使用baseUrl
        const response = await fetch('/api/tts/voices?provider=all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        
        const data = await response.json();
        
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


        // 根据当前语言环境选择显示的语音名称
        const displayName = locale === 'zh' ? value.name :
          (value.voices[0]?.en_lang || value.name);

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
          flag: flag,
          voices: sortedVoices, // 使用排序后的语音列表
          // 由于 LanguageCategory 接口中没有定义 regionType，这里暂时移除该属性
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
      } catch (error) {
        console.error('获取语音列表失败:', error);
        // 可以在这里设置错误状态
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
      // 停止所有正在播放的音频
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

      // 自动播放新生成的语音
      playAudio(audioUrl);

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
    <div className="w-full max-w-7xl mx-auto">
      <div className="space-y-6">
            {/* 文本输入区域 */}
            <div className="relative">
              <Textarea
                placeholder={section.input_placeholder}
                value={text}
                onChange={handleTextChange}
                className="min-h-40 resize-none pr-24"
              />
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                <span>{text.length}/2000</span>
              </div>
            </div>

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
                    />
                  </Card>
                ))}
              </div>
            )}

            {/* 语言选择、设置和生成按钮 */}
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm font-medium">{section.select_language}:</span>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={section.select_language_placeholder} />
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
                        
                        {voice.provider && (
                          <Badge variant="outline" className="text-xs">
                            {voice.provider === 'microsoft-api' ? 'MS' : 
                             voice.provider === 'microsoft' ? 'MS' :
                             voice.provider === 'google' ? 'Google' :
                             voice.provider === 'google-genai' ? 'Gemini' : 
                             voice.provider}
                          </Badge>
                        )}
                        
                        {voice.isPremium && (
                          <Badge 
                            variant="default" 
                            className="text-xs font-semibold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-md"
                          >
                            🔥 高级
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 选中状态指示器 */}
                  {selectedVoice?.id && selectedVoice?.id === voice.id && (
                    <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none">
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        已选择
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
