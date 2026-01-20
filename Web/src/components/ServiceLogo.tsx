
import React, { useState } from 'react';
import { Github, MessageSquare, Mail, Youtube, Cloud, Clock, Music, Box } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ServiceLogoProps {
    slug: string;
    className?: string;
    size?: number;
}

/**
 * Normalize service slug for Simple Icons CDN
 * Removes spaces, special characters, and converts to lowercase
 * Examples: "GitHub Enterprise" → "github", "MS Teams" → "msteams"
 */
const normalizeSlug = (slug: string): string => {
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
        .trim();
};

export const ServiceLogo: React.FC<ServiceLogoProps> = ({ slug, className = "", size = 24 }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [imageError, setImageError] = useState(false);

    const normalizedSlug = normalizeSlug(slug);
    const s = slug.toLowerCase();

    /**
     * Automatically generate Simple Icons CDN URL
     * For dark mode: use white color for better visibility
     * For light mode: use default brand colors (no color param)
     */
    const getAutoIconUrl = (normalized: string): string => {
        if (isDark) {
            return `https://cdn.simpleicons.org/${normalized}/white`;
        }
        // For light mode, let Simple Icons use default brand color
        return `https://cdn.simpleicons.org/${normalized}`;
    };

    // Try to load from Simple Icons CDN first (if not already failed)
    if (!imageError && normalizedSlug) {
        return (
            <img
                src={getAutoIconUrl(normalizedSlug)}
                alt={`${slug} logo`}
                className={className}
                style={{ width: size, height: size, objectFit: 'contain' }}
                onError={() => setImageError(true)} // Fallback to Lucide icons on error
            />
        );
    }

    // Fallback to Lucide Icons based on keyword matching
    const iconProps = {
        className: `${className} ${isDark ? 'text-white' : 'text-gray-900'}`,
        size
    };

    if (s.includes('github')) return <Github {...iconProps} />;
    if (s.includes('discord')) return <MessageSquare {...iconProps} />;
    if (s.includes('gmail') || s.includes('mail')) return <Mail {...iconProps} />;
    if (s.includes('youtube')) return <Youtube {...iconProps} />;
    if (s.includes('weather')) return <Cloud {...iconProps} />;
    if (s.includes('timer') || s.includes('clock') || s.includes('cron')) return <Clock {...iconProps} />;
    if (s.includes('spotify') || s.includes('music')) return <Music {...iconProps} />;

    // Final fallback: Generic box icon or first letter
    return (
        <div
            className={`${className} ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
        >
            {slug.charAt(0).toUpperCase()}
        </div>
    );
};
