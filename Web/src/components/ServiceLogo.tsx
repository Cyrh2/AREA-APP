
import React from 'react';
import { Github, MessageSquare, Mail, Youtube, Cloud, Clock, Music } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ServiceLogoProps {
    slug: string;
    className?: string;
    size?: number;
}

export const ServiceLogo: React.FC<ServiceLogoProps> = ({ slug, className = "", size = 24 }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const s = slug.toLowerCase();

    // Mapping slugs to CDN URLs (Simple Icons)
    // We adjust colors for visibility and aesthetic consistency
    const logoUrls: Record<string, string> = {
        github: isDark ? 'https://cdn.simpleicons.org/github/white' : 'https://cdn.simpleicons.org/github/black',
        discord: isDark ? 'https://cdn.simpleicons.org/discord/white' : 'https://cdn.simpleicons.org/discord/5865F2',
        google: 'https://cdn.simpleicons.org/google',
        gmail: 'https://cdn.simpleicons.org/gmail',
        youtube: 'https://cdn.simpleicons.org/youtube/FF0000',
        spotify: 'https://cdn.simpleicons.org/spotify/1DB954',
    };

    if (logoUrls[s]) {
        return (
            <img
                src={logoUrls[s]}
                alt={`${slug} logo`}
                className={className}
                style={{ width: size, height: size, objectFit: 'contain' }}
            />
        );
    }

    // Fallback to Lucide Icons if not in Simple Icons list
    const iconProps = {
        className: `${className} ${isDark ? 'text-white' : 'text-gray-900'}`,
        size
    };

    if (s.includes('github')) return <Github {...iconProps} />;
    if (s.includes('discord')) return <MessageSquare {...iconProps} />;
    if (s.includes('gmail') || s.includes('mail')) return <Mail {...iconProps} />;
    if (s.includes('youtube')) return <Youtube {...iconProps} />;
    if (s.includes('weather')) return <Cloud {...iconProps} />;
    if (s.includes('timer')) return <Clock {...iconProps} />;
    if (s.includes('spotify')) return <Music {...iconProps} />;

    return (
        <div
            className={`${className} ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
        >
            {slug.charAt(0).toUpperCase()}
        </div>
    );
};
