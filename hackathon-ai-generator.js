/**
 * HACKATHON: Real-Time AI Social Media Automation
 * Live content generation with company assets and real-time updates
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class HackathonAIGenerator {
    constructor() {
        this.geminiAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
        this.companyAssets = this.loadCompanyAssets();
        this.isRealTime = true;
    }

    /**
     * Load company assets and brand information
     */
    loadCompanyAssets() {
        const assetsDir = path.join(__dirname, 'company-assets');

        // Create assets directory if it doesn't exist
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
            console.log('📁 Created company-assets directory');
            console.log('💡 Add your company images and brand guide here!');
        }

        const assets = {
            brandGuide: {
                companyName: "Your Company", // Update this
                brandColors: ["#4285f4", "#34a853", "#ea4335", "#fbbc05"],
                tone: "professional yet approachable",
                targetAudience: "tech professionals and businesses",
                keyMessages: [
                    "Innovation through automation",
                    "Empowering teams with AI",
                    "Simplifying complex workflows"
                ]
            },
            images: [],
            logos: []
        };

        // Scan for company assets
        try {
            const files = fs.readdirSync(assetsDir);
            files.forEach(file => {
                const filePath = path.join(assetsDir, file);
                const ext = path.extname(file).toLowerCase();

                if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                    if (file.toLowerCase().includes('logo')) {
                        assets.logos.push(`/assets/${file}`);
                    } else {
                        assets.images.push(`/assets/${file}`);
                    }
                }
            });

            console.log(`📸 Found ${assets.images.length} company images`);
            console.log(`🏷️ Found ${assets.logos.length} company logos`);
        } catch (error) {
            console.log('📁 No assets found yet - add your company images to ./company-assets/');
        }

        return assets;
    }

    /**
     * REAL-TIME: Generate live social media content
     */
    async generateLiveContent(input) {
        const {
            topic,
            platform = 'twitter',
            urgency = 'normal', // breaking, urgent, normal
            useCompanyBrand = true,
            includeMetrics = true
        } = input;

        console.log(`🔴 LIVE: Generating real-time content for ${platform.toUpperCase()}`);
        console.time('⚡ Generation Time');

        try {
            const startTime = Date.now();

            // Step 1: Analyze topic for urgency and relevance
            const analysis = await this.analyzeTopicRelevance(topic, urgency);

            // Step 2: Generate optimized content with company branding
            const content = await this.generateBrandedContent(topic, platform, analysis);

            // Step 3: Select/generate appropriate visuals
            const visuals = await this.selectCompanyVisuals(topic, platform);

            // Step 4: Real-time optimization
            const optimized = await this.realTimeOptimization(content, platform, analysis);

            const endTime = Date.now();
            const generationTime = endTime - startTime;

            console.timeEnd('⚡ Generation Time');

            return {
                success: true,
                content: optimized,
                visuals: visuals,
                analytics: {
                    generationTimeMs: generationTime,
                    urgencyLevel: urgency,
                    relevanceScore: analysis.relevanceScore,
                    estimatedEngagement: analysis.estimatedEngagement,
                    timestamp: new Date().toISOString()
                },
                realTimeData: {
                    trending: analysis.trending,
                    optimalPostTime: this.getOptimalPostTime(platform),
                    competitorActivity: analysis.competitorInsights
                }
            };

        } catch (error) {
            console.error('❌ Live generation failed:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Analyze topic for real-time relevance and trending potential
     */
    async analyzeTopicRelevance(topic, urgency) {
        const model = this.geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const analysisPrompt = `Analyze this topic for social media posting: "${topic}"

Urgency level: ${urgency}

Provide analysis in JSON format:
{
    "relevanceScore": 1-10,
    "trending": ["hashtag1", "hashtag2", "hashtag3"],
    "estimatedEngagement": "low|medium|high",
    "competitorInsights": "brief analysis of what competitors might be doing",
    "urgencyJustification": "why this urgency level makes sense",
    "optimalTiming": "morning|afternoon|evening|anytime"
}

Focus on tech, automation, and business relevance.`;

        try {
            const result = await model.generateContent(analysisPrompt);
            const response = await result.response;
            const text = response.text().trim();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback if JSON parsing fails
            return {
                relevanceScore: 7,
                trending: ["#AI", "#Automation", "#Tech"],
                estimatedEngagement: "medium",
                competitorInsights: "Standard industry posting",
                urgencyJustification: "Regular business content",
                optimalTiming: "afternoon"
            };
        } catch (error) {
            console.log('Using fallback analysis');
            return {
                relevanceScore: 6,
                trending: ["#Innovation", "#Business"],
                estimatedEngagement: "medium",
                competitorInsights: "Limited data available",
                urgencyJustification: "Standard timing",
                optimalTiming: "anytime"
            };
        }
    }

    /**
     * Generate content with company branding
     */
    async generateBrandedContent(topic, platform, analysis) {
        const brand = this.companyAssets.brandGuide;

        const prompt = `Create a ${platform} post about: ${topic}

BRAND GUIDELINES:
- Company: ${brand.companyName}
- Tone: ${brand.tone}
- Target: ${brand.targetAudience}
- Key Messages: ${brand.keyMessages.join(', ')}

REAL-TIME CONTEXT:
- Urgency: ${analysis.urgencyJustification}
- Trending: ${analysis.trending.join(', ')}
- Optimal timing: ${analysis.optimalTiming}

PLATFORM SPECS:
${this.getPlatformSpecs(platform)}

Create engaging, on-brand content that feels authentic to our company voice.
Include relevant trending hashtags: ${analysis.trending.join(' ')}

Return ONLY the post content, no extra text.`;

        const model = this.geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Select appropriate company visuals or generate descriptions
     */
    async selectCompanyVisuals(topic, platform) {
        const visuals = {
            companyImages: this.companyAssets.images,
            logos: this.companyAssets.logos,
            recommended: null,
            aiGenerated: null
        };

        // If we have company images, select the most relevant one
        if (visuals.companyImages.length > 0) {
            visuals.recommended = visuals.companyImages[0]; // Smart selection logic can be added here
        }

        // Generate AI image as backup/alternative
        try {
            const imagePrompt = await this.createBrandedImagePrompt(topic, platform);
            visuals.aiGenerated = await this.generateAIImage(imagePrompt);
        } catch (error) {
            console.log('AI image generation skipped');
        }

        return visuals;
    }

    /**
     * Create branded image prompt using company style
     */
    async createBrandedImagePrompt(topic, platform) {
        const brand = this.companyAssets.brandGuide;

        return `Professional ${platform} image for ${brand.companyName} about: ${topic}
        
Style: ${brand.tone}, modern, clean
Colors: ${brand.brandColors.join(', ')}
Dimensions: ${this.getImageDimensions(platform)}
Elements: Subtle company branding, professional typography
Mood: Innovative, trustworthy, engaging`;
    }

    /**
     * Real-time content optimization
     */
    async realTimeOptimization(content, platform, analysis) {
        // Add real-time elements
        const optimizations = {
            original: content,
            withMetrics: this.addMetrics(content, analysis),
            withTrending: this.addTrendingElements(content, analysis),
            withCTA: this.addCallToAction(content, platform),
            final: content
        };

        // Apply optimizations based on urgency and platform
        optimizations.final = optimizations.withTrending;

        if (platform === 'twitter') {
            optimizations.final = this.ensureTwitterLimit(optimizations.final);
        }

        return optimizations;
    }

    /**
     * Get platform specifications
     */
    getPlatformSpecs(platform) {
        const specs = {
            twitter: "Max 280 characters, hashtags count toward limit, visual content performs well",
            linkedin: "Professional tone, longer form content OK (up to 1300 chars), industry insights valued",
            instagram: "Visual-first, story-driven captions, emoji-friendly, hashtag groups work well",
            facebook: "Community-focused, conversation starters, mixed content types perform well"
        };
        return specs[platform] || specs.twitter;
    }

    /**
     * Get optimal image dimensions
     */
    getImageDimensions(platform) {
        const dimensions = {
            twitter: "1200x675",
            linkedin: "1200x627",
            instagram: "1080x1080",
            facebook: "1200x630"
        };
        return dimensions[platform] || "1200x675";
    }

    /**
     * Generate AI image with branded prompt
     */
    async generateAIImage(prompt) {
        try {
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true`;

            return {
                url: imageUrl,
                prompt: prompt,
                service: 'pollinations'
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Add trending elements to content
     */
    addTrendingElements(content, analysis) {
        if (analysis.trending && analysis.trending.length > 0) {
            const trending = analysis.trending.slice(0, 3).join(' ');
            return `${content}\n\n${trending}`;
        }
        return content;
    }

    /**
     * Add call to action
     */
    addCallToAction(content, platform) {
        const ctas = {
            twitter: "\n\nWhat's your experience with this? 💭",
            linkedin: "\n\nWhat are your thoughts? Share your insights below! 👇",
            instagram: "\n\nDouble-tap if you agree! 💙 What's your take?",
            facebook: "\n\nLet's discuss in the comments! What do you think? 🤔"
        };

        return content + (ctas[platform] || ctas.twitter);
    }

    /**
     * Ensure Twitter character limit
     */
    ensureTwitterLimit(content) {
        if (content.length <= 280) return content;

        // Smart truncation logic
        const lines = content.split('\n');
        let result = lines[0];

        for (let i = 1; i < lines.length; i++) {
            if ((result + '\n' + lines[i]).length <= 280) {
                result += '\n' + lines[i];
            } else {
                break;
            }
        }

        return result;
    }

    /**
     * Get optimal posting time for platform
     */
    getOptimalPostTime(platform) {
        const now = new Date();
        const optimal = {
            twitter: "1-3 PM or 5-6 PM weekdays",
            linkedin: "7:45-8:30 AM, 12 PM, or 5-6 PM weekdays",
            instagram: "11 AM-2 PM or 5-7 PM",
            facebook: "1-4 PM or 6-9 PM"
        };

        return optimal[platform] || optimal.twitter;
    }

    /**
     * Add performance metrics
     */
    addMetrics(content, analysis) {
        return {
            content: content,
            predictedMetrics: {
                engagement: analysis.estimatedEngagement,
                reach: analysis.relevanceScore * 1000,
                clicks: Math.floor(analysis.relevanceScore * 50),
                shares: Math.floor(analysis.relevanceScore * 10)
            }
        };
    }

    /**
     * HACKATHON DEMO: Generate multi-platform campaign
     */
    async generateHackathonDemo(topic) {
        console.log('🎯 HACKATHON DEMO: Generating multi-platform campaign...');

        const platforms = ['twitter', 'linkedin', 'instagram'];
        const results = {};

        for (const platform of platforms) {
            console.log(`\n📱 Generating for ${platform.toUpperCase()}...`);
            results[platform] = await this.generateLiveContent({
                topic,
                platform,
                urgency: 'urgent',
                useCompanyBrand: true,
                includeMetrics: true
            });
        }

        return {
            campaign: results,
            summary: {
                totalPlatforms: platforms.length,
                avgGenerationTime: Object.values(results).reduce((acc, r) =>
                    acc + (r.analytics?.generationTimeMs || 0), 0) / platforms.length,
                totalEstimatedReach: Object.values(results).reduce((acc, r) =>
                    acc + (r.analytics?.relevanceScore * 1000 || 0), 0),
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Export for use in n8n or standalone
module.exports = HackathonAIGenerator;

// CLI interface for hackathon demo
if (require.main === module) {
    const generator = new HackathonAIGenerator();

    // Hackathon demo
    const demoTopic = "Our new AI automation platform just launched! 🚀";

    console.log('🎉 HACKATHON AI SOCIAL MEDIA GENERATOR');
    console.log('=====================================');

    generator.generateHackathonDemo(demoTopic).then(result => {
        console.log('\n🏆 HACKATHON DEMO RESULTS:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\n✨ Demo complete! Ready for presentation! 🎭');
    });
}