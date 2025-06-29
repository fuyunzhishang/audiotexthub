"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, Download, ChevronDown, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// import { ttsList } from "./tts";
import { useTranslations, useLocale } from "next-intl";
import { TextToSpeechSection } from "@/types/blocks/text-to-speech";

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
}

// 定义语音生成结果接口
interface SpeechResult {
  id: string;
  text: string;
  voiceKey: string;
  voiceName: string;
  audioUrl: string;
  createdAt: Date;
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${baseUrl}/api/tts/voices?provider=microsoft`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data?.microsoft?.grouped) {
          throw new Error('Invalid API response format');
        }

        const groupedVoices = data.data.microsoft.grouped;

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

        // debugger

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

        categories.push({
          code: key,
          name: displayName,  // 使用根据语言环境选择的名称
          flag: flag,
          voices: value.voices,
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
    setSelectedVoice(voice === selectedVoice ? null : voice);
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

  // 生成语音函数
  const handleGenerateSpeech = async () => {
    if (!selectedVoice || !text.trim() || isGenerating) return;

    try {
      setIsGenerating(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'microsoft-api',
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
      console.log(data, 'data-----')

      // 创建新的结果记录
      const newResult: SpeechResult = {
        id: Date.now().toString(),
        text: text.length > 30 ? text.substring(0, 30) + '...' : text,
        voiceKey: selectedVoice.id,
        voiceName: selectedVoice.name,
        audioUrl: data.audioUrl || data.url, // 兼容不同的响应格式
        createdAt: new Date()
      };

      // 添加到结果列表
      setResults(prev => [newResult, ...prev]);

      // 自动播放新生成的语音
      playAudio(data.audioUrl || data.url);

    } catch (error) {
      console.error('生成语音失败:', error);
      alert('生成语音失败，请重试');
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
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧语音生成区域 */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Textarea
                placeholder={section.input_placeholder}
                value={text}
                onChange={handleTextChange}
                className="min-h-40 resize-none"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{section.character_count.replace('{count}', text.length.toString())}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
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
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentVoices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`p-3 hover:shadow-md transition-shadow cursor-pointer ${selectedVoice?.id === voice.id ? 'border-2 border-primary bg-primary/5 ring-1 ring-primary' : ''
                    }`}
                  onClick={() => handleSelectVoice(voice)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-full ring-1 ring-input">
                      <AvatarImage
                        src={voice.gender === 'Female' ? femaleAvatar : maleAvatar}
                        alt={voice.name}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{voice.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{voice.gender}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {getLevelLabel(voice.level || 1)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(voice.example_voice_url);
                      }}
                      className="size-8 flex-shrink-0"
                      style={{ marginTop: '-30px', marginRight: '21px' }}
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

            <div className="mt-6 flex justify-center">
              <Button
                className="w-full md:w-60"
                disabled={!selectedVoice || !text.trim() || isGenerating}
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

          {/* 右侧结果列表 */}
          <div className="col-span-1">
            <Card className="p-4">
              <h3 className="text-1xl font-bold mb-4">{section.history_title}</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{section.no_history}</p>
                ) : (
                  results.map((result) => (
                    <Card key={result.id} className="p-3">
                      <div className="mb-2">
                        <p className="text-sm font-medium truncate">{result.text}</p>
                        <p className="text-xs text-muted-foreground">{result.voiceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8"
                          onClick={() => playAudio(result.audioUrl)}
                        >
                          {currentAudio === result.audioUrl && isPlaying ? (
                            <><Pause className="h-3.5 w-3.5 mr-1" /> {section.pause}</>
                          ) : (
                            <><Play className="h-3.5 w-3.5 mr-1" /> {section.play}</>
                          )}
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = result.audioUrl;
                              a.download = `${section.voice_file_prefix}_${result.voiceName}_${new Date().getTime()}.mp3`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
