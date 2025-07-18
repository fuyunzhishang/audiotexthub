"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { Mic, MicOff, Copy, Download, Loader2, HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations, useLocale } from "next-intl";
import { SpeechRecognitionSection } from "@/types/blocks/speech-recognition";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecognitionResult {
  id: string;
  text: string;
  duration: number;
  engineType: string;
  createdAt: Date;
}

const engineTypes = [
  { value: "16k_zh", label: "普通话", flag: "🇨🇳" },
  { value: "16k_zh_dialect", label: "中文方言", flag: "🇨🇳" },
  { value: "16k_en", label: "English", flag: "🇺🇸" },
  { value: "16k_ca", label: "粤语", flag: "🇭🇰" },
];

export default function SpeechRecognition({ section }: { section: SpeechRecognitionSection }) {
  if (section.disabled) {
    return null;
  }

  const locale = useLocale();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineType, setEngineType] = useState("16k_zh");
  const [latestResult, setLatestResult] = useState<RecognitionResult | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    console.log('=== Start Recording ===');
    console.log('Current state - isRecording:', isRecording, 'isProcessing:', isProcessing);
    
    if (isProcessing) {
      console.warn('Cannot start recording while processing');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks collected:', chunksRef.current.length);
        // 保持 MediaRecorder 的原始格式，不强制转换为 webm
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        processAudio(blob, mimeType);
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert(section.error_messages?.mic_permission || 'Failed to access microphone');
    }
  };

  const stopRecording = () => {
    console.log('=== Stop Recording ===');
    console.log('Current state - isRecording:', isRecording, 'mediaRecorder:', !!mediaRecorderRef.current);
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const processAudio = async (audioBlob: Blob, mimeType?: string) => {
    setIsProcessing(true);
    console.log('=== Processing Audio ===');
    console.log('Audio blob details:', {
      size: audioBlob.size,
      type: audioBlob.type,
      sizeInMB: (audioBlob.size / (1024 * 1024)).toFixed(2) + 'MB'
    });
    console.log('Engine type:', engineType);
    
    try {
      const formData = new FormData();
      // 根据实际的 MIME 类型确定文件扩展名
      let fileName = 'recording';
      const blobType = mimeType || audioBlob.type;
      
      if (blobType.includes('webm')) {
        fileName += '.webm';
      } else if (blobType.includes('mp4')) {
        fileName += '.mp4';
      } else if (blobType.includes('wav')) {
        fileName += '.wav';
      } else if (blobType.includes('mp3') || blobType.includes('mpeg')) {
        fileName += '.mp3';
      } else if (blobType.includes('ogg')) {
        fileName += '.ogg';
      } else {
        // 默认使用 webm 作为后备
        fileName += '.webm';
      }
      
      formData.append('audio', audioBlob, fileName);
      formData.append('engineType', engineType);

      console.log('Sending request to /api/speech-recognition...');
      const response = await fetch('/api/speech-recognition', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Recognition failed');
      }

      const data = await response.json();
      console.log('Recognition result:', data);
      
      const newResult: RecognitionResult = {
        id: Date.now().toString(),
        text: data.data.text,
        duration: data.data.duration,
        engineType: engineType,
        createdAt: new Date(),
      };

      setLatestResult(newResult);
      console.log('Recognition completed successfully');
    } catch (error) {
      console.error('Recognition failed:', error);
      alert(section.error_messages?.recognition_failed || 'Recognition failed, please try again');
    } finally {
      console.log('Setting isProcessing to false');
      setIsProcessing(false);
    }
  };

  const checkFileDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const videoExtensions = ['mp4', 'flv', '3gp'];
      
      // Use video element for video files, audio element for audio files
      const element = videoExtensions.includes(fileExtension || '') 
        ? document.createElement('video')
        : document.createElement('audio');
      
      element.preload = 'metadata';
      
      element.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(element.duration);
      };
      
      element.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load media file'));
      };
      
      element.src = url;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== File Upload ===');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Reset the input value to allow selecting the same file again
    e.target.value = '';

    // Support formats: wav、mp3、m4a、flv、mp4、wma、3gp、amr、aac、ogg-opus、flac
    const validTypes = [
      'audio/wav', 'audio/wave', 'audio/x-wav',
      'audio/mp3', 'audio/mpeg',
      'audio/mp4', 'audio/m4a', 'audio/x-m4a',
      'video/x-flv', 'video/flv',
      'video/mp4',
      'audio/x-ms-wma', 'audio/wma',
      'video/3gpp', 'audio/3gpp',
      'audio/amr',
      'audio/aac', 'audio/aacp',
      'audio/ogg', 'audio/opus',
      'audio/flac', 'audio/x-flac'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['wav', 'mp3', 'm4a', 'flv', 'mp4', 'wma', '3gp', 'amr', 'aac', 'ogg', 'opus', 'flac'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      alert(section.error_messages?.invalid_format || 'Invalid file format. Supported formats: wav, mp3, m4a, flv, mp4, wma, 3gp, amr, aac, ogg-opus, flac');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert(section.error_messages?.file_too_large || 'File size exceeds 100MB');
      return;
    }

    // Check duration (5 minutes = 300 seconds)
    try {
      console.log('Checking file duration...');
      const duration = await checkFileDuration(file);
      console.log('File duration:', duration, 'seconds');
      
      if (duration > 300) {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        alert(section.error_messages?.file_too_long || `文件时长超过5分钟限制。当前文件时长：${minutes}分${seconds}秒`);
        return;
      }
    } catch (error) {
      console.error('Failed to check file duration:', error);
      // Continue processing even if duration check fails
    }

    processAudio(file);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
      toast.success('复制成功');
    } catch (err) {
      console.error('Failed to copy text:', err);
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Text copied using execCommand');
        toast.success('复制成功');
      } catch (err) {
        console.error('Fallback copy failed:', err);
        toast.error('复制失败');
      }
      textArea.remove();
    }
  };

  const downloadText = (result: RecognitionResult) => {
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section.text_file_prefix}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up...');
      // Stop recording if in progress
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6">
              {/* Engine selector temporarily hidden */}
              {/* <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">{section.select_engine}:</span>
                  <Select value={engineType} onValueChange={setEngineType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={section.select_engine_placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {engineTypes.map((engine) => (
                        <SelectItem key={engine.value} value={engine.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{engine.flag}</span>
                            <span>{engine.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {engineType && (
                    <Badge variant="outline" className="ml-2">
                      {engineTypes.find(e => e.value === engineType)?.flag}
                      {engineTypes.find(e => e.value === engineType)?.label}
                    </Badge>
                  )}
                </div>
              </div> */}

              <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-4">
                  {/* Microphone button - 恢复录音功能 */}
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className="w-32 h-32 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <MicOff className="h-12 w-12" />
                    ) : (
                      <Mic className="h-12 w-12" />
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-base font-medium text-foreground">
                      {isRecording ? section.recording : section.click_to_record}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="text-xs">
                          <p className="mb-1">💡 {section.mic_permission_tip}</p>
                          <p>{section.mac_permission_guide}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{section.or}</span>
                  </div>
                </div>

                {/* File upload option */}
                <div className="text-center space-y-4">
                  <Button variant="outline" size="lg" asChild className="hover:border-primary">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".wav,.mp3,.m4a,.flv,.mp4,.wma,.3gp,.amr,.aac,.ogg,.opus,.flac,audio/*,video/mp4,video/x-flv,video/3gpp"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isProcessing || isRecording}
                      />
                      <Icon name="RiUploadCloud2Line" className="mr-2 h-5 w-5" />
                      {section.upload_audio}
                    </label>
                  </Button>
                  
                  {/* File format tip */}
                  <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
                    {section.fileFormatTip}
                  </p>
                </div>

                {isProcessing && (
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">{section.processing}</span>
                  </div>
                )}
              </div>

              {/* Latest result display - 优化显示效果 */}
              {latestResult && (
                <div className="mt-6">
                  <Card className="p-4 border-2 border-primary/20 bg-primary/5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{section.latest_result}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {engineTypes.find(e => e.value === latestResult.engineType)?.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(latestResult.text)}
                          className="hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadText(latestResult)}
                          className="hover:bg-primary/10"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          下载
                        </Button>
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{latestResult.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{section.duration}: {latestResult.duration}s</span>
                      <span>•</span>
                      <span>{latestResult.createdAt.toLocaleString()}</span>
                    </div>
                  </Card>
                </div>
              )}
      </Card>
    </div>
  );
}