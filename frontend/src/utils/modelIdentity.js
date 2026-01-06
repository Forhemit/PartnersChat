import { Bot, Sparkles, Zap, Brain, Globe } from 'lucide-react';

export const getModelIdentity = (modelId) => {
    const lowerId = modelId.toLowerCase();

    if (lowerId.includes('openai') || lowerId.includes('gpt')) {
        return {
            name: 'OpenAI',
            color: '#10a37f', // OpenAI Green
            bgTint: 'rgba(16, 163, 127, 0.1)',
            icon: Zap
        };
    }

    if (lowerId.includes('anthropic') || lowerId.includes('claude')) {
        return {
            name: 'Anthropic',
            color: '#da7756', // Claude beige/orange
            bgTint: 'rgba(218, 119, 86, 0.1)',
            icon: Brain
        };
    }

    if (lowerId.includes('google') || lowerId.includes('gemini')) {
        return {
            name: 'Google',
            color: '#4285f4', // Google Blue
            bgTint: 'rgba(66, 133, 244, 0.1)',
            icon: Sparkles
        };
    }

    if (lowerId.includes('deepseek')) {
        return {
            name: 'DeepSeek',
            color: '#4e46dc', // DeepSeek Blue/Purple
            bgTint: 'rgba(78, 70, 220, 0.1)',
            icon: Globe
        };
    }

    if (lowerId.includes('x-ai') || lowerId.includes('grok')) {
        return {
            name: 'xAI',
            color: '#000000', // Grok Black (handle dark mode carefully)
            darkColor: '#ffffff',
            bgTint: 'rgba(128, 128, 128, 0.1)',
            icon: Bot
        };
    }

    // Default
    return {
        name: 'Model',
        color: '#6b7280', // Gray
        bgTint: 'rgba(107, 114, 128, 0.1)',
        icon: Bot
    };
};
