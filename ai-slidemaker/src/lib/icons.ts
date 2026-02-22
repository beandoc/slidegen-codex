import React from 'react';
import {
    TrendingUp,
    BarChart3,
    ShieldCheck,
    Zap,
    Target,
    Users,
    Lightbulb,
    Settings,
    Activity,
    Globe,
    Rocket,
    Search,
    CheckCircle2,
    Box,
    Layers,
    Cpu
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
    'TrendingUp': TrendingUp,
    'BarChart3': BarChart3,
    'ShieldCheck': ShieldCheck,
    'Zap': Zap,
    'Target': Target,
    'Users': Users,
    'Lightbulb': Lightbulb,
    'Settings': Settings,
    'Activity': Activity,
    'Globe': Globe,
    'Rocket': Rocket,
    'Search': Search,
    'CheckCircle2': CheckCircle2,
    'Box': Box,
    'Layers': Layers,
    'Cpu': Cpu,
};

const keywordMap: Record<string, string> = {
    'revenue': 'TrendingUp',
    'growth': 'TrendingUp',
    'data': 'BarChart3',
    'chart': 'BarChart3',
    'statistics': 'BarChart3',
    'security': 'ShieldCheck',
    'safe': 'ShieldCheck',
    'fast': 'Zap',
    'performance': 'Zap',
    'energy': 'Zap',
    'goal': 'Target',
    'mission': 'Target',
    'team': 'Users',
    'users': 'Users',
    'social': 'Users',
    'idea': 'Lightbulb',
    'feature': 'Lightbulb',
    'config': 'Settings',
    'process': 'Activity',
    'health': 'Activity',
    'world': 'Globe',
    'global': 'Globe',
    'launch': 'Rocket',
    'startup': 'Rocket',
    'search': 'Search',
    'analyze': 'Search',
    'success': 'CheckCircle2',
    'done': 'CheckCircle2',
    'product': 'Box',
    'architecture': 'Layers',
    'ai': 'Cpu',
    'tech': 'Cpu',
};

export function getIconForText(text: string): string | null {
    const lowerText = text.toLowerCase();
    for (const [kw, icon] of Object.entries(keywordMap)) {
        if (lowerText.includes(kw)) {
            return icon;
        }
    }
    return null;
}

export function getLucideIcon(iconName: string) {
    return iconMap[iconName] || null;
}
