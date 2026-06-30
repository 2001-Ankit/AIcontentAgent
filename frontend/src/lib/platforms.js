import { SiInstagram, SiTiktok, SiFacebook, SiYoutube, SiX } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';

export const PLATFORMS = [
  {
    id:        'instagram',
    name:      'Instagram',
    short:     'IG',
    Icon:      SiInstagram,
    color:     '#E1306C',
    bg:        'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)',
    optimalTime: '6:30 PM',
  },
  {
    id:        'tiktok',
    name:      'TikTok',
    short:     'TK',
    Icon:      SiTiktok,
    color:     '#ffffff',
    bg:        '#0F0F0F',
    optimalTime: '7:10 PM',
  },
  {
    id:        'facebook',
    name:      'Facebook',
    short:     'FB',
    Icon:      SiFacebook,
    color:     '#ffffff',
    bg:        '#1877F2',
    optimalTime: '5:00 PM',
  },
  {
    id:        'youtube',
    name:      'YouTube',
    short:     'YT',
    Icon:      SiYoutube,
    color:     '#ffffff',
    bg:        '#FF0000',
    optimalTime: '4:00 PM',
  },
  {
    id:        'x',
    name:      'X',
    short:     'X',
    Icon:      SiX,
    color:     '#ffffff',
    bg:        '#0F0F0F',
    optimalTime: '9:00 AM',
  },
  {
    id:        'linkedin',
    name:      'LinkedIn',
    short:     'in',
    Icon:      FaLinkedin,
    color:     '#ffffff',
    bg:        '#0A66C2',
    optimalTime: '8:00 AM',
  },
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map(p => [p.id, p]));
