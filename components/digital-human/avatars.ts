import type { DigitalHuman } from '@/types/digital-human';

export const digitalHumanAvatars: DigitalHuman[] = [
  {
    id: 'professional-female-1',
    name: '专业主持人小美',
    nameEn: 'Professional Host Amy',
    gender: 'female',
    style: 'professional',
    description: '适合新闻播报、产品介绍、企业宣传等专业场景',
    preview: '/avatars/professional-female-1.jpg',
    voiceId: 'zh-CN-XiaoxiaoNeural',
    level: 'premium',
    tags: ['新闻', '播报', '专业']
  },
  {
    id: 'teacher-male-1',
    name: '知识讲师大明',
    nameEn: 'Teacher David',
    gender: 'male',
    style: 'education',
    description: '适合在线教育、知识科普、培训讲解等教育场景',
    preview: '/avatars/teacher-male-1.jpg',
    voiceId: 'zh-CN-YunxiNeural',
    level: 'free',
    tags: ['教育', '培训', '知识']
  },
  {
    id: 'service-female-1',
    name: '客服小雨',
    nameEn: 'Service Rain',
    gender: 'female',
    style: 'service',
    description: '适合客户服务、产品咨询、售后支持等服务场景',
    preview: '/avatars/service-female-1.jpg',
    voiceId: 'zh-CN-XiaoyiNeural',
    level: 'free',
    tags: ['客服', '咨询', '友好']
  },
  {
    id: 'sales-male-1',
    name: '销售专家小强',
    nameEn: 'Sales Expert John',
    gender: 'male',
    style: 'sales',
    description: '适合产品推广、营销介绍、商业演示等销售场景',
    preview: '/avatars/sales-male-1.jpg',
    voiceId: 'zh-CN-YunjianNeural',
    level: 'premium',
    tags: ['销售', '营销', '推广']
  },
  {
    id: 'entertainment-female-1',
    name: '娱乐主播小悦',
    nameEn: 'Entertainer Joy',
    gender: 'female',
    style: 'entertainment',
    description: '适合直播互动、娱乐节目、轻松对话等娱乐场景',
    preview: '/avatars/entertainment-female-1.jpg',
    voiceId: 'zh-CN-XiaochenNeural',
    level: 'professional',
    tags: ['直播', '娱乐', '活泼']
  },
  {
    id: 'professional-male-1',
    name: '商务精英大卫',
    nameEn: 'Business Elite David',
    gender: 'male',
    style: 'professional',
    description: '适合商务会议、企业培训、正式演讲等商务场景',
    preview: '/avatars/professional-male-1.jpg',
    voiceId: 'zh-CN-YunyangNeural',
    level: 'professional',
    tags: ['商务', '正式', '稳重']
  }
];

// 获取免费数字人
export const getFreeAvatars = () => {
  return digitalHumanAvatars.filter(avatar => avatar.level === 'free');
};

// 根据性别筛选
export const getAvatarsByGender = (gender: 'male' | 'female') => {
  return digitalHumanAvatars.filter(avatar => avatar.gender === gender);
};

// 根据风格筛选
export const getAvatarsByStyle = (style: DigitalHuman['style']) => {
  return digitalHumanAvatars.filter(avatar => avatar.style === style);
};

// 根据ID获取数字人
export const getAvatarById = (id: string) => {
  return digitalHumanAvatars.find(avatar => avatar.id === id);
};