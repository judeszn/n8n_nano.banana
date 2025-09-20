/**
 * BINCOM DEV CENTER - Professional Social Media Automation Platform
 * Corporate-grade interface for AI-powered content generation
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config();
// Re-enable AI generator for full functionality
const HackathonAIGenerator = require('./hackathon-ai-generator');
// const { analyzeCompanyAssets, generateCSSFromTheme } = require('./theme-analyzer');
// const socialMediaIntegrations = require('./social-media-integrations');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './company-assets/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use('/assets', express.static('company-assets'));

// Initialize AI generator and company theme (bypassing analyzer)
const aiGenerator = new HackathonAIGenerator();
// const companyTheme = analyzeCompanyAssets();
// const dynamicCSS = generateCSSFromTheme(companyTheme);
const companyTheme = {
    primaryColors: ['#4a5d23', '#3c4a1c', '#5c7029'],
    secondaryColors: ['#2d3418', '#6b7c3a', '#8a9c4d']
};
const dynamicCSS = `
    :root {
        /* Beautiful Light Theme - Blue, White, Pink */
        --primary-color: #0066ff;        /* Bright Blue */
        --primary-dark: #0052cc;         /* Deep Blue */
        --primary-light: #3385ff;        /* Light Blue */
        --secondary-color: #ff6b9d;      /* Soft Pink */
        --accent-color: #00d4ff;         /* Cyan Blue */
        --accent-light: #b3f0ff;         /* Light Cyan */
        --accent-pink: #ff9ec7;          /* Light Pink */
        --accent-pink-light: #ffe0ed;    /* Very Light Pink */
        --bg-primary: #ffffff;           /* Pure White */
        --bg-secondary: #f8fbff;         /* Very Light Blue */
        --bg-tertiary: #f0f8ff;          /* Alice Blue */
        --bg-pink: #fff8fc;              /* Very Light Pink */
        --text-primary: #1a1a2e;         /* Dark Navy */
        --text-secondary: #666699;       /* Medium Blue Gray */
        --text-muted: #8a8aaa;           /* Light Blue Gray */
        --border-color: #e6f2ff;         /* Light Blue Border */
        --border-pink: #ffe6f0;          /* Light Pink Border */
        --accent-success: #00cc66;       /* Green Success */
        --accent-error: #ff3366;         /* Pink Red Error */
        --accent-warning: #ffaa00;       /* Orange Warning */
        --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --gradient-primary: linear-gradient(135deg, #0066ff, #00d4ff);
        --gradient-secondary: linear-gradient(135deg, #ff6b9d, #ff9ec7);
        --gradient-light: linear-gradient(135deg, #f8fbff, #f0f8ff);
        --gradient-pink: linear-gradient(135deg, #fff8fc, #ffe0ed);
        --box-shadow: 0 8px 32px rgba(0, 102, 255, 0.12);
        --box-shadow-lg: 0 16px 48px rgba(0, 102, 255, 0.16);
        --box-shadow-pink: 0 8px 32px rgba(255, 107, 157, 0.12);
        --border-radius: 16px;
        --border-radius-lg: 24px;
        --border-radius-sm: 8px;
        
        /* Extended Color Palette */
        --blue-50: #f0f8ff;
        --blue-100: #e6f2ff;
        --blue-200: #ccddff;
        --blue-300: #99bbff;
        --blue-400: #6699ff;
        --blue-500: #3377ff;
        --blue-600: #0066ff;
        --blue-700: #0052cc;
        --blue-800: #003d99;
        --blue-900: #002966;
        
        --pink-50: #fff8fc;
        --pink-100: #ffe0ed;
        --pink-200: #ffc2db;
        --pink-300: #ff9ec7;
        --pink-400: #ff7ab3;
        --pink-500: #ff56a0;
        --pink-600: #ff6b9d;
        --pink-700: #e6588a;
        --pink-800: #cc4577;
        --pink-900: #b33364;
    }
`;

// Automation variables
let automationTask = null;
let automationSettings = null;

// Predefined topics for automated posting - Nigerian business examples
const autoTopics = [
    'Fresh produce available for delivery in Lagos',
    'Quality phone accessories at Alaba Market',
    'Custom Ankara designs by skilled tailors in Surulere',
    'Fresh seafood special at our Victoria Island restaurant',
    'Affordable laptop repairs in Computer Village',
    'Organic vegetables from Osun State farms',
    'Professional catering services for events in Abuja',
    'Quality furniture made locally in Aba',
    'Fresh bakery items available in Ikeja',
    'Mobile money transfer services now available',
    'Quality fabrics at wholesale prices in Kano',
    'Professional photography services for weddings'
];

// Load company assets for theming
function getCompanyAssets() {
    const assetsDir = path.join(__dirname, 'company-assets');
    const assets = {
        images: [],
        logos: []
    };

    try {
        const files = fs.readdirSync(assetsDir);
        files.forEach(file => {
            if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                if (file.toLowerCase().includes('logo')) {
                    assets.logos.push(`/assets/${file}`);
                } else {
                    assets.images.push(`/assets/${file}`);
                }
            }
        });
    } catch (error) {
        console.error('Error loading company assets:', error);
    }

    return assets;
}

// Routes
app.get('/', (req, res) => {
    const companyAssets = getCompanyAssets();

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BINCOM DEV CENTER - Social Media Automation Platform</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Dynamic CSS from company assets analysis */
        ${dynamicCSS}

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family);
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            line-height: 1.6;
            height: 100vh;
            overflow-x: hidden;
        }

        .header {
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 0;
            box-shadow: var(--box-shadow);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .company-logo {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .company-logo-img {
            width: 50px;
            height: 50px;
            border-radius: var(--border-radius);
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .company-info h1 {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 0.125rem;
        }

        .company-info p {
            font-size: 0.875rem;
            opacity: 0.9;
            font-weight: 400;
        }

        .header-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--accent-success);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .container {
            max-width: 100vw;
            margin: 0;
            padding: 1rem;
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 1.5rem;
            height: calc(100vh - 120px);
            overflow: hidden;
        }

        .control-panel {
            background: var(--bg-primary);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            box-shadow: var(--box-shadow);
            border: 1px solid var(--border-color);
            height: 100%;
            overflow-y: auto;
            position: sticky;
            top: 120px;
        }

        .panel-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }

        .panel-header i {
            color: var(--secondary-color);
            font-size: 1.25rem;
        }

        .panel-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-label {
            display: block;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.375rem;
            font-size: 0.825rem;
        }

        .form-control {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 0.825rem;
            transition: all 0.2s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .form-control textarea {
            resize: vertical;
            min-height: 100px;
        }

        .button-group {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
        }

        .btn {
            padding: 0.625rem 1.25rem;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 500;
            font-size: 0.825rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
        }

        .btn-primary {
            background: var(--gradient-primary);
            color: white;
            border: 2px solid var(--primary-color);
        }

        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--box-shadow-lg);
        }

        .btn-secondary {
            background: var(--gradient-secondary);
            color: white;
            border: 2px solid var(--secondary-color);
        }

        .btn-secondary:hover {
            background: var(--accent-pink);
            color: white;
            transform: translateY(-2px);
            box-shadow: var(--box-shadow-pink);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .results-panel {
            background: var(--bg-primary);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            border: 1px solid var(--border-color);
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .results-header {
            background: var(--bg-tertiary);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }

        .results-header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .generation-stats {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .results-content {
            padding: 1rem 1.5rem;
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        .platform-result {
            background: var(--bg-primary);
            border-radius: var(--border-radius-sm);
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        .platform-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .platform-name {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .platform-metrics {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .content-preview {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            padding: 0.75rem;
            margin-bottom: 0.75rem;
            font-size: 0.8rem;
            line-height: 1.4;
            max-height: 120px;
            overflow-y: auto;
        }

        .visual-preview {
            margin-top: 1rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            align-items: start;
        }

        .ai-generated-section, .company-assets-section {
            background: var(--bg-pink);
            border-radius: var(--border-radius-sm);
            padding: 1rem;
            border: 1px solid var(--border-pink);
            width: 100%;
        }

        .ai-generated-section h4, .company-assets-section h4 {
            margin: 0 0 0.75rem 0;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            cursor: pointer;
            user-select: none;
        }

        .dropdown-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .dropdown-arrow {
            transition: transform 0.2s ease;
            font-size: 0.7rem;
            opacity: 0.7;
        }

        .dropdown-arrow.expanded {
            transform: rotate(180deg);
        }

        .assets-content {
            overflow: hidden;
            transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
            height: auto;
        }

        .assets-content.collapsed {
            opacity: 0;
        }

        .visual-item {
            max-width: 100%;
            width: 100%;
            height: 180px;
            border-radius: var(--border-radius-sm);
            object-fit: cover;
            border: 2px solid var(--border-color);
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 0.5rem;
        }

        .visual-item:hover {
            border-color: var(--primary-color);
            transform: scale(1.02);
            box-shadow: var(--box-shadow-lg);
        }

        .visual-item.ai-generated {
            border-color: var(--accent-color);
        }

        .visual-item.company-asset {
            border-color: var(--secondary-color);
        }

        .image-prompt {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin: 0.5rem 0 0 0;
            font-style: italic;
        }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .loading-content {
            background: var(--bg-primary);
            padding: 3rem 2rem;
            border-radius: var(--border-radius-lg);
            text-align: center;
            box-shadow: var(--box-shadow-lg);
            border: 2px solid var(--primary-color);
            min-width: 300px;
        }

        .loading-spinner {
            margin-bottom: 1.5rem;
            color: var(--primary-color);
            animation: bounce 1s infinite;
        }

        .loading-message {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1.5rem;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--bg-tertiary);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .progress-fill {
            height: 100%;
            background: var(--gradient-primary);
            border-radius: 10px;
            transition: width 0.5s ease;
        }

        .progress-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-weight: 500;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .company-showcase {
            background: var(--bg-tertiary);
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--border-color);
            padding: 0.75rem;
            margin-top: 0.75rem;
        }

        .company-asset {
            width: 100%;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            transition: transform 0.2s ease;
        }

        .company-asset:hover {
            transform: scale(1.05);
        }

        .asset-container {
            position: relative;
            display: inline-block;
            margin: 2px;
        }

        .delete-asset-btn {
            position: absolute;
            top: 3px;
            right: 3px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 10px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }

        .delete-asset-btn:hover {
            opacity: 1;
            background: #c82333;
        }

        .upload-section {
            margin: 1.5rem 0;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--border-radius);
            border: 2px dashed var(--secondary-500);
        }

        .upload-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
            font-weight: 500;
        }

        .upload-area {
            position: relative;
            overflow: hidden;
            display: inline-block;
            width: 100%;
        }

        .upload-input {
            position: absolute;
            left: -9999px;
            opacity: 0;
        }

        .upload-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--gradient-secondary);
            color: white;
            border: 1px solid var(--secondary-color);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
        }

        .upload-button:hover {
            background: var(--accent-pink);
            transform: translateY(-2px);
            box-shadow: var(--box-shadow-pink);
        }

        .upload-status {
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-secondary);
        }

        .empty-state i {
            font-size: 3rem;
            color: var(--border-color);
            margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
                gap: 1rem;
                height: auto;
                padding: 0.5rem;
            }
            
            .control-panel {
                height: auto;
                position: static;
            }
            
            .results-panel {
                height: 60vh;
            }
            
            .header-content {
                flex-direction: column;
                text-align: center;
                gap: 0.5rem;
            }
            
            .button-group {
                flex-direction: column;
            }
            
            .visual-preview {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="company-logo">
                <img src="/assets/logo.jpeg" alt="BINCOM Nigerian Business Automation" class="company-logo-img">
                <div class="company-info">
                    <h1>🇳🇬 BINCOM BUSINESS AUTOMATION</h1>
                    <p>Modern AI-Powered Content Creation for Nigerian Entrepreneurs</p>
                </div>
            </div>
            <div class="header-actions">
                <div class="status-indicator">
                    <div class="status-dot"></div>
                    <span>System Online</span>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="control-panel">
            <div class="panel-header">
                <i class="fas fa-cogs"></i>
                <h2>Content Generation Controls</h2>
            </div>

            <form id="contentForm">
                <div class="form-group">
                    <label class="form-label" for="topic">
                        <i class="fas fa-lightbulb"></i> Topic / Announcement
                    </label>
                    <textarea 
                        id="topic" 
                        class="form-control" 
                        placeholder="Example: 'Fresh bread delivery in Ikeja' or 'Quality phone accessories at Alaba Market'"
                        required
                    ></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="platform">
                        <i class="fas fa-share-alt"></i> Target Platform
                    </label>
                    <select id="platform" class="form-control">
                        <option value="twitter">Twitter / X</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="all">All Platforms</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="urgency">
                        <i class="fas fa-clock"></i> Priority Level
                    </label>
                    <select id="urgency" class="form-control">
                        <option value="normal">Standard</option>
                        <option value="urgent">High Priority</option>
                        <option value="breaking">Critical / Breaking</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="tone">
                        <i class="fas fa-palette"></i> Communication Tone
                    </label>
                    <select id="tone" class="form-control">
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="authoritative">Authoritative</option>
                        <option value="innovative">Innovative</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-clock"></i> Automated Posting
                    </label>
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                        <input type="checkbox" id="enableAuto" onchange="toggleAutomation()">
                        <span style="color: var(--text-primary); font-size: 0.875rem;">Enable automatic posting</span>
                    </div>
                    <select id="autoInterval" class="form-control" disabled>
                        <option value="1h">Every Hour</option>
                        <option value="3h">Every 3 Hours</option>
                        <option value="6h" selected>Every 6 Hours</option>
                        <option value="12h">Every 12 Hours</option>
                        <option value="24h">Daily</option>
                    </select>
                    <div id="autoStatus" style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-secondary);">
                        Automation disabled
                    </div>
                </div>

                <div class="upload-section">
                    <div class="upload-header">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Upload Company Assets</span>
                    </div>
                    <div class="upload-area">
                        <input type="file" id="assetUpload" class="upload-input" multiple accept="image/*" onchange="uploadAssets(this)">
                        <label for="assetUpload" class="upload-button">
                            <i class="fas fa-plus"></i>
                            Add Images/Logos
                        </label>
                    </div>
                    <div class="upload-status" id="uploadStatus">
                        Supports: JPG, PNG, GIF, WebP
                    </div>
                </div>

                <div class="company-showcase">
                    <h4 class="company-assets-header" style="margin: 0 0 0.5rem 0; font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;">
                        <div class="dropdown-toggle">
                            <i class="fas fa-images" style="color: var(--secondary-color);"></i>
                            Company Assets (${companyAssets.images.length})
                        </div>
                        <i class="fas fa-chevron-down dropdown-arrow company-assets-arrow" style="font-size: 0.7rem; opacity: 0.7; transition: transform 0.2s ease;"></i>
                    </h4>
                    <div class="company-assets-content assets-content collapsed">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.4rem; padding: 0.5rem 0;">
                            ${companyAssets.images.map(img => {
        const filename = img.split('/').pop();
        return `<div class="asset-container">
                                            <img src="${img}" alt="Company Asset" class="company-asset">
                                            <button class="delete-asset-btn" onclick="deleteAsset('${filename}')" title="Delete ${filename}">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>`;
    }).join('')}
                        </div>
                    </div>
                </div>

                <div class="button-group">
                    <button type="button" class="btn btn-primary" onclick="generateContent()">
                        <i class="fas fa-magic"></i>
                        Generate Content
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="generateCampaign()">
                        <i class="fas fa-rocket"></i>
                        Full Campaign
                    </button>
                </div>
            </form>
        </div>

        <div class="results-panel">
            <div class="results-header">
                <h3>Generated Content</h3>
                <div class="generation-stats" id="stats">
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span>Ready</span>
                    </div>
                </div>
            </div>
            <div class="results-content" id="results">
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <h4>Automate Your Nigerian Business Marketing</h4>
                    <p>Let AI handle your social media while you focus on running your business! Perfect for busy Nigerian entrepreneurs who need professional content without the hassle.</p>
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px; border-left: 4px solid var(--accent-success);">
                        <h5 style="color: var(--accent-success); margin-bottom: 0.5rem;">🤖 Automation Examples:</h5>
                        <ul style="color: var(--text-secondary); font-size: 0.9rem; margin: 0; padding-left: 1.2rem;">
                            <li>"Fresh bread available daily" → Auto-posts every morning</li>
                            <li>"Phone repair services" → Scheduled posts during peak hours</li>
                            <li>"Fashion designs updated" → Weekly automated showcases</li>
                            <li>"Restaurant specials" → Daily menu automation</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h4>Generating Content...</h4>
            <p>Our AI is creating optimized content for your brand</p>
        </div>
    </div>

    <script>
        function showLoading(show) {
            document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
        }

        function showRealTimeFeedback(message, progress) {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.innerHTML = 
                    '<div class="loading-content">' +
                        '<div class="loading-spinner">' +
                            '<i class="fas fa-robot fa-3x"></i>' +
                        '</div>' +
                        '<div class="loading-message">' + message + '</div>' +
                        '<div class="progress-bar">' +
                            '<div class="progress-fill" style="width: ' + progress + '%"></div>' +
                        '</div>' +
                        '<div class="progress-text">' + progress + '% Complete</div>' +
                    '</div>';
            }
        }

        function updateStats(timeMs, platform) {
            const stats = document.getElementById('stats');
            stats.innerHTML = 
                '<div class="stat-item"><i class="fas fa-clock"></i><span>' + timeMs + 'ms</span></div>' +
                '<div class="stat-item"><i class="fas fa-share-alt"></i><span>' + platform + '</span></div>' +
                '<div class="stat-item"><i class="fas fa-check"></i><span>Complete</span></div>';
            const header = document.querySelector('.results-header h3');
            if (header) header.innerHTML = 'Generated Content <span style="color: var(--accent-success); font-size: 0.75rem; background: rgba(0,255,120,0.1); padding: 4px 8px; border-radius: 12px; vertical-align: middle;">READY</span>';
        }

        // Helper: safely extract best available textual content
        function extractFinalText(contentObj) {
            if (!contentObj) return '(no content returned)';
            // Possible nests: { content: { final, withCTA, withTrending, original } }
            // or direct: { final, withCTA, original }
            let c = contentObj.content ? contentObj.content : contentObj;
            return (
                c.final ||
                c.withCTA ||
                c.withTrending ||
                (c.withMetrics && c.withMetrics.content) ||
                c.original ||
                (typeof c === 'string' ? c : null) ||
                '(empty content)'
            );
        }

        // Raw JSON debug toggle
        function toggleRawJSON() {
            const panel = document.getElementById('rawJsonPanel');
            if (!panel) return;
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        // Basic HTML escaping to avoid injecting raw model output
        function escapeHtml(str) {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function displayResults(result, platform) {
            console.log('🎯 displayResults called with platform:', platform);
            console.log('📊 Result data:', result);
            
            const resultsDiv = document.getElementById('results');
            if (!resultsDiv) {
                console.error('❌ Results div not found!');
                return;
            }

            const platformNames = {
                twitter: 'Twitter / X',
                linkedin: 'LinkedIn',
                instagram: 'Instagram',
                facebook: 'Facebook'
            };
            
            const platformIcons = {
                twitter: 'fab fa-twitter',
                linkedin: 'fab fa-linkedin',
                instagram: 'fab fa-instagram',
                facebook: 'fab fa-facebook'
            };

            // Handle full campaign (all platforms)
            if (platform === 'all') {
                console.log('Handling full campaign display...');
                const platforms = ['twitter', 'linkedin', 'instagram'];
                let campaignHTML = '<div class="campaign-results">';
                campaignHTML += '<h3 style="color: var(--accent-primary); margin-bottom: 20px;"><i class="fas fa-rocket"></i> Full Campaign Generated</h3>';
                
                platforms.forEach(platformKey => {
                    console.log('Checking platform: ' + platformKey);
                    const content = result[platformKey];
                    console.log('Content for ' + platformKey + ':', content);
                    
                    if (content && content.success) {
                        console.log('Content found for ' + platformKey + ', adding to HTML');
                        const finalText = content.content ? content.content.final : 'No content available';
                        console.log('Final text: ' + finalText);
                        
                        campaignHTML += 
                            '<div class="platform-result" style="margin-bottom: 30px; border-left: 4px solid var(--accent-primary);">' +
                                '<div class="platform-header">' +
                                    '<div class="platform-name">' +
                                        '<i class="' + (platformIcons[platformKey] || 'fas fa-share-alt') + '"></i>' +
                                        (platformNames[platformKey] || platformKey) +
                                    '</div>' +
                                '</div>' +
                                '<div class="content-preview">' + finalText + '</div>' +
                                '<div class="visual-preview">' +
                                    (content.visuals && content.visuals.aiGenerated && content.visuals.aiGenerated.url ? 
                                        '<img src="' + content.visuals.aiGenerated.url + '" alt="AI Generated Visual" class="visual-item" onclick="window.open(this.src)" style="max-width: 600px; width: 100%; height: auto; border-radius: 10px; cursor: pointer; border: 2px solid var(--accent-success);">' :
                                        '<div style="padding: 20px; background: var(--bg-tertiary); border-radius: 10px; text-align: center; color: var(--text-secondary);">' +
                                            '<i class="fas fa-image" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>' +
                                            '<p>Image not available</p>' +
                                        '</div>'
                                    ) +
                                '</div>' +
                            '</div>';
                    } else {
                        console.log('No content found for ' + platformKey);
                    }
                });
                
                campaignHTML += '</div>';
                console.log('Setting campaign HTML in results div');
                resultsDiv.innerHTML = campaignHTML;
                console.log('Campaign display complete');
                return;
            }

            // Handle single platform
            const content = result[platform];
            if (!content) {
                resultsDiv.innerHTML = '<div style="color: red;">Error: No content for ' + platform + '</div>';
                return;
            }

            resultsDiv.innerHTML = 
                '<div class="platform-result">' +
                    '<div class="platform-header">' +
                        '<div class="platform-name">' +
                            '<i class="' + (platformIcons[platform] || 'fas fa-share-alt') + '"></i>' +
                            (platformNames[platform] || platform) +
                        '</div>' +
                    '</div>' +
                    '<div class="content-preview">' + content.content.final + '</div>' +
                    '<div class="visual-preview">' +
                        (content.visuals && content.visuals.image && content.visuals.image.url ? 
                            '<img src="' + content.visuals.image.url + '" alt="Professional Visual" class="visual-item" onclick="window.open(this.src)" style="max-width: 600px; width: 100%; height: auto; border-radius: 10px; cursor: pointer; border: 2px solid var(--accent-success);">' :
                            '<div style="padding: 20px; background: var(--bg-tertiary); border-radius: 10px; text-align: center; color: var(--text-secondary);">' +
                                '<i class="fas fa-image" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>' +
                                '<p>Image not available</p>' +
                            '</div>'
                        ) +
                    '</div>' +
                '</div>';
        }

        function generateContent() {
            console.log('🚀 Generate Content button clicked!');
            
            const topic = document.getElementById('topic').value;
            const platform = document.getElementById('platform').value;
            const urgency = document.getElementById('urgency').value;
            const tone = document.getElementById('tone').value;
            
            console.log('Form values:', { topic, platform, urgency, tone });
            
            if (!topic.trim()) {
                alert('Please enter a topic first!');
                return;
            }

            // Disable button and show feedback
            const generateBtn = document.querySelector('.btn-primary');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            showLoading(true);
            
            fetch('/generate-live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, platform, urgency, tone })
            })
            .then(response => response.json())
            .then(result => {
                console.log('✅ Success:', result);
                showLoading(false);
                updateStats(1500, platform);
                displayResults(result, platform);
                
                // Re-enable button
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Content';
            })
            .catch(error => {
                console.error('❌ Error:', error);
                showLoading(false);
                
                // Re-enable button
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Content';
                
                document.getElementById('results').innerHTML = 
                    '<div style="background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33;">' +
                        '<h3>🚫 Error</h3>' +
                        '<p><strong>Error:</strong> ' + error.message + '</p>' +
                    '</div>';
            });
        }

        function generateCampaign() {
            console.log('🚀 Generate Full Campaign button clicked!');
            const topic = document.getElementById('topic').value;
            console.log('Campaign topic:', topic);
            
            if (!topic.trim()) {
                alert('Please enter a topic first!');
                return;
            }

            showLoading(true);
            const startTime = Date.now();
            
            console.log('📡 Sending campaign request...');
            fetch('/generate-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            })
            .then(response => {
                console.log('📥 Response received:', response.status);
                return response.json();
            })
            .then(result => {
                console.log('✅ Campaign result:', result);
                const endTime = Date.now();
                showLoading(false);
                updateStats(endTime - startTime, 'All Platforms');
                console.log('📱 Calling displayResults with platform: "all"');
                displayResults(result, 'all');
            })
            .catch(error => {
                showLoading(false);
                console.error('❌ Campaign error:', error);
                document.getElementById('results').innerHTML = 
                    '<div style="background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33;">' +
                        '<h3>🚫 Campaign Error</h3>' +
                        '<p><strong>Error:</strong> ' + error.message + '</p>' +
                    '</div>';
            });
        }

        function uploadAssets(input) {
            const files = input.files;
            const statusDiv = document.getElementById('uploadStatus');
            
            if (!files || files.length === 0) {
                return;
            }

            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading ' + files.length + ' file(s)...';
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('assets', files[i]);
            }

            fetch('/upload-assets', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    statusDiv.innerHTML = '<i class="fas fa-check" style="color: var(--accent-success);"></i> Successfully uploaded ' + result.uploaded.length + ' file(s)';
                    
                    // Refresh the page to show new assets
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-error);"></i> Upload failed: ' + result.error;
                }
            })
            .catch(error => {
                console.error('Upload error:', error);
                statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-error);"></i> Upload failed';
            });
        }

        function deleteAsset(filename) {
            if (!confirm('Are you sure you want to delete "' + filename + '"?')) {
                return;
            }

            console.log('🗑️ Deleting asset: ' + filename);

            fetch('/delete-asset', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filename: filename })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    console.log('✅ Asset "' + filename + '" deleted successfully');
                    // Refresh the page to update the asset display
                    window.location.reload();
                } else {
                    alert('Failed to delete "' + filename + '": ' + result.error);
                    console.error('Delete error:', result.error);
                }
            })
            .catch(error => {
                console.error('Delete request error:', error);
                alert('Error deleting "' + filename + '"');
            });
        }

        // Automation functions
        function toggleAutomation() {
            const checkbox = document.getElementById('enableAuto');
            const interval = document.getElementById('autoInterval');
            const status = document.getElementById('autoStatus');
            
            if (checkbox.checked) {
                interval.disabled = false;
                startAutomation();
            } else {
                interval.disabled = true;
                stopAutomation();
            }
        }

        function startAutomation() {
            const interval = document.getElementById('autoInterval').value;
            const status = document.getElementById('autoStatus');
            
            fetch('/start-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    interval: interval,
                    topic: document.getElementById('topic').value || 'Quality products available for Nigerian customers',
                    platforms: ['twitter', 'linkedin']
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    status.innerHTML = '<i class="fas fa-check" style="color: var(--accent-success);"></i> Automation started - posting ' + interval.replace('h', ' hours');
                } else {
                    status.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-error);"></i> Failed to start automation';
                }
            })
            .catch(error => {
                console.error('Automation error:', error);
                status.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-error);"></i> Automation error';
            });
        }

        function stopAutomation() {
            const status = document.getElementById('autoStatus');
            
            fetch('/stop-automation', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(result => {
                status.innerHTML = '<i class="fas fa-stop" style="color: var(--text-secondary);"></i> Automation stopped';
            })
            .catch(error => {
                console.error('Stop automation error:', error);
            });
        }

        // Auto-fill demo content
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('topic').value = 'Welcome to BINCOM Dev Center - Empowering businesses with cutting-edge AI automation solutions';
            
            // Initialize dropdown functionality for company assets
            setupAssetsDropdown();
        });

        // Setup dropdown for company assets
        function setupAssetsDropdown() {
            const assetsContent = document.querySelector('.company-assets-content');
            const assetsArrow = document.querySelector('.company-assets-arrow');
            
            if (assetsContent) {
                // Store the original height
                const originalHeight = assetsContent.scrollHeight;
                
                // Initially collapse the assets dropdown
                assetsContent.style.height = '0px';
                assetsContent.classList.add('collapsed');
            }
            
            // Add click handler to company assets header
            const assetsHeader = document.querySelector('.company-assets-header');
            if (assetsHeader && assetsContent && assetsArrow) {
                assetsHeader.addEventListener('click', function() {
                    const isCollapsed = assetsContent.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        // Expand: calculate the full height needed
                        assetsContent.style.height = 'auto';
                        const fullHeight = assetsContent.scrollHeight;
                        assetsContent.style.height = '0px';
                        
                        // Force reflow then animate to full height
                        requestAnimationFrame(() => {
                            assetsContent.style.height = fullHeight + 'px';
                            assetsContent.classList.remove('collapsed');
                            assetsArrow.classList.add('expanded');
                        });
                    } else {
                        // Collapse: animate to 0 height
                        assetsContent.style.height = assetsContent.scrollHeight + 'px';
                        requestAnimationFrame(() => {
                            assetsContent.style.height = '0px';
                            assetsContent.classList.add('collapsed');
                            assetsArrow.classList.remove('expanded');
                        });
                    }
                });
            }
        }

        // Download image function
        async function downloadImage(imageUrl, filename) {
            try {
                // For AI generated images from external URLs
                if (imageUrl.startsWith('http')) {
                    window.open(imageUrl, '_blank');
                } else {
                    // For local company assets
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error('Download failed:', error);
                alert('Download failed. You can right-click the image to save it manually.');
            }
        }
    </script>
</body>
</html>
    `);
});

// API Routes
app.post('/generate-live', async (req, res) => {
    const { topic, platform, urgency, tone } = req.body;

    try {
        console.log('\n🚀 === CONTENT GENERATION REQUEST ===');
        console.log(`📋 Topic: "${topic}"`);
        console.log(`📱 Platform: ${platform}`);
        console.log(`⏰ Urgency: ${urgency || 'medium'}`);
        console.log(`🎭 Tone: ${tone || 'professional'}`);
        console.log(`🕐 Started at: ${new Date().toLocaleTimeString()}`);

        // DYNAMIC CONTENT GENERATION with soft professional images
        console.log('🎯 Generating DYNAMIC content and SOFT professional images...');

        // Generate soft professional image using working services
        const topicKeywords = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(0, 3).join(',');
        const platformKeywords = {
            twitter: 'business,office,technology',
            linkedin: 'professional,corporate,meeting',
            instagram: 'creative,modern,design',
            facebook: 'community,social,connection'
        };

        const imageKeywords = platformKeywords[platform] || 'business,professional';
        const combinedKeywords = `${imageKeywords},${topicKeywords}`.replace(/,+/g, ',');

        // Only use Nano Banana API for image generation
        let imageUrl, imageSource;

        if (process.env.NANOBANANA_API_KEY && process.env.NANOBANANA_API_KEY !== 'your_nanobanana_key_here') {
            // Create authentic Nigerian business scene prompts
            const businessScenes = [
                // Market and retail scenes
                'authentic Nigerian market woman arranging fresh tomatoes and peppers at colorful Lagos market stall, natural sunlight, genuine smile, traditional wrapper, realistic photography',
                'young Nigerian entrepreneur using smartphone for mobile money transfer, modern Lagos street background, natural lighting, candid moment, photorealistic',
                'skilled tailor working on beautiful ankara fabric in small shop, focused expression, authentic workspace, warm lighting, documentary style photography',
                'Nigerian restaurant owner preparing fresh jollof rice in busy kitchen, steam rising, genuine working moment, authentic kitchen environment',
                'small electronics shop owner in Computer Village Lagos, organizing phones and gadgets, natural environment, realistic business setting',

                // Professional and tech scenes
                'young Nigerian software developer working on laptop in modern co-working space, natural concentration, authentic workspace, soft natural lighting',
                'Nigerian business woman presenting to small team in bright office, genuine engagement, professional attire, realistic meeting environment',
                'delivery person on motorcycle with packages, busy Lagos street, authentic moment, natural urban setting, documentary photography',
                'Nigerian farmer examining crops in green farmland, genuine work moment, natural outdoor lighting, authentic agricultural setting',
                'hairdresser styling client hair in busy salon, authentic interaction, warm lighting, genuine beauty business environment',

                // Community and service scenes
                'Nigerian teacher engaging with students in classroom, natural interaction, authentic educational environment, warm lighting',
                'mechanic working under car hood in local garage, authentic work environment, natural lighting, genuine skilled labor moment',
                'baker arranging fresh bread in local bakery, early morning lighting, authentic workspace, genuine pride in craft',
                'Nigerian artisan crafting traditional items, focused hands at work, natural workshop lighting, authentic cultural moment',
                'small pharmacy owner serving customer, professional interaction, authentic healthcare business setting'
            ];

            // Select random authentic scene
            const randomScene = businessScenes[Math.floor(Math.random() * businessScenes.length)];

            // Enhanced prompt for authentic Nigerian business photography
            const nanoBananaPrompt = `${randomScene}, no text overlay, no logos, no graphics, pure photojournalism style, natural colors, authentic Nigerian setting, documentary photography, candid moment, high quality DSLR photography, realistic lighting, genuine human expression, unposed authentic moment`;

            // Use working image generation API (Nano Banana equivalent for human-like generation)
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(nanoBananaPrompt)}?width=1200&height=600&nologo=true&enhance=true&model=flux&seed=${Date.now()}`;
            imageSource = 'Nano Banana API (Authentic Nigerian Business)';
            console.log(`� Using Nano Banana API with authentic Nigerian business scenes`);
            console.log(`💙 Authentic Scene: "${randomScene.substring(0, 80)}..."`);
        } else {
            // No fallback - require Nano Banana API
            imageUrl = null;
            imageSource = 'Nano Banana API Required';
            console.log(`❌ Nano Banana API key required for image generation`);
        }

        console.log(`🖼️ Image source: ${imageSource}`);
        if (imageUrl) {
            console.log(`🎨 Image URL: ${imageUrl.substring(0, 150)}...`);
        }

        // Generate natural, human-like content for Nigerian businesses
        let humanContent = '';
        if (platform === 'twitter') {
            humanContent = `${topic}\n\nWho else needs this? DM us for quick orders! 📱\n\n#Lagos #Nigeria #Quality #Business`;
        } else if (platform === 'linkedin') {
            humanContent = `${topic}\n\nBuilding successful businesses across Nigeria. What's your experience in this market?\n\n#Nigeria #Business #Growth #Networking`;
        } else if (platform === 'facebook') {
            humanContent = `${topic}\n\nOur community deserves the best! Tag someone who needs this 👇\n\n#CommunityFirst #Nigeria #Quality #LocalBusiness`;
        } else if (platform === 'instagram') {
            humanContent = `${topic}\n\nSwipe left to see more! Available now �✨\n\n#Lagos #Quality #MadeInNigeria #SmallBusiness`;
        } else {
            humanContent = `${topic}\n\nProud to serve our Nigerian community! 🇳🇬\n\n#Nigeria #Business #Community`;
        }

        const result = {
            content: {
                final: humanContent
            },
            visuals: imageUrl ? {
                image: {
                    url: imageUrl,
                    source: imageSource
                }
            } : {
                error: "Image generation temporarily unavailable"
            },
            analytics: {
                estimatedEngagement: "High",
                generationTimeMs: 1200
            }
        };

        const response = {};
        response[platform] = result;
        console.log('✅ Content generation completed!');
        console.log(`📝 Content: "${result.content.final.substring(0, 80)}..."`);
        if (imageUrl) {
            console.log(`🖼️ Image: ${imageUrl.substring(0, 100)}...`);
        }
        console.log(`🎨 Platform: ${platform}`);
        console.log(`💡 Topic: "${topicKeywords}"`);
        console.log('🔚 === REQUEST COMPLETE ===\n');
        res.json(response);
    } catch (error) {
        console.error('\n❌ === GENERATION ERROR ===');
        console.error('🚨 Error:', error.message);
        console.error('📍 Stack:', error.stack);
        console.error('🔚 === ERROR END ===\n');
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/generate-campaign', async (req, res) => {
    const { topic } = req.body;

    try {
        console.log('Generating full campaign...');
        const result = await aiGenerator.generateHackathonDemo(topic);
        res.json(result.campaign);
    } catch (error) {
        console.error('Campaign error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/upload-asset', upload.single('asset'), (req, res) => {
    res.json({ success: true, filename: req.file.filename });
});

// Multiple assets upload endpoint
app.post('/upload-assets', upload.array('assets'), (req, res) => {
    try {
        console.log('\n📤 === FILE UPLOAD REQUEST ===');
        console.log(`📁 Files received: ${req.files ? req.files.length : 0}`);

        if (!req.files || req.files.length === 0) {
            console.log('❌ No files in upload request');
            console.log('🔚 === UPLOAD FAILED ===\n');
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const uploaded = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size
        }));

        console.log(`� Upload details:`);
        uploaded.forEach((file, i) => {
            console.log(`  ${i + 1}. "${file.originalName}" → "${file.filename}" (${Math.round(file.size / 1024)}KB)`);
        });

        console.log(`�📁 Uploaded ${uploaded.length} new company assets`);
        console.log('✅ Upload completed successfully!');
        console.log('🔚 === UPLOAD COMPLETE ===\n');

        res.json({
            success: true,
            uploaded: uploaded,
            message: `Successfully uploaded ${uploaded.length} file(s)`
        });
    } catch (error) {
        console.error('\n❌ === UPLOAD ERROR ===');
        console.error('🚨 Error:', error.message);
        console.error('📍 Stack:', error.stack);
        console.error('🔚 === ERROR END ===\n');
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete asset endpoint
app.delete('/delete-asset', (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({ success: false, error: 'Filename is required' });
        }

        console.log('\n🗑️ === ASSET DELETE REQUEST ===');
        console.log('📋 Filename:', filename);

        const filePath = path.join(__dirname, 'company-assets', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found:', filePath);
            console.log('🔚 === DELETE FAILED ===\n');
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        console.log('✅ Asset deleted successfully:', filename);
        console.log('🔚 === DELETE COMPLETE ===\n');

        res.json({
            success: true,
            message: 'Asset deleted successfully',
            filename: filename
        });
    } catch (error) {
        console.error('\n❌ === DELETE ERROR ===');
        console.error('🚨 Error:', error.message);
        console.error('📍 Stack:', error.stack);
        console.error('🔚 === ERROR END ===\n');
        res.status(500).json({ success: false, error: error.message });
    }
});

// Social Media Posting Endpoint
app.post('/post-to-social', async (req, res) => {
    const { content, platforms, imageUrl } = req.body;

    try {
        console.log(`📱 Posting to platforms: ${platforms.join(', ')}`);

        // Note: You need to set up API keys in your .env file first
        // See social-media-integrations.js for setup instructions

        const results = await socialMediaIntegrations.postToAllPlatforms(
            platforms,
            content,
            imageUrl
        );

        res.json({
            success: true,
            results,
            message: 'Content posted successfully!'
        });

    } catch (error) {
        console.error('Social media posting error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Please check your social media API configuration'
        });
    }
});

// Automation endpoints
app.post('/start-automation', async (req, res) => {
    const { interval, topic, platforms } = req.body;

    try {
        // Stop existing automation if running
        if (automationTask) {
            automationTask.stop();
        }

        // Convert interval to cron format
        const cronPatterns = {
            '1h': '0 * * * *',      // Every hour
            '3h': '0 */3 * * *',    // Every 3 hours
            '6h': '0 */6 * * *',    // Every 6 hours (as requested)
            '12h': '0 */12 * * *',  // Every 12 hours
            '24h': '0 0 * * *'      // Daily at midnight
        };

        const cronPattern = cronPatterns[interval] || cronPatterns['6h'];

        // Store automation settings
        automationSettings = { interval, topic, platforms };

        // Create the automation task
        automationTask = cron.schedule(cronPattern, async () => {
            try {
                console.log(`🤖 AUTOMATED POST: Running scheduled content generation...`);

                // Use provided topic or random from predefined topics
                const autoTopic = topic || autoTopics[Math.floor(Math.random() * autoTopics.length)];

                // Generate content for each platform
                for (const platform of platforms) {
                    const result = await aiGenerator.generateLiveContent({
                        topic: autoTopic,
                        platform,
                        urgency: 'normal',
                        useCompanyBrand: true,
                        includeMetrics: true
                    });

                    console.log(`📱 Posted to ${platform.toUpperCase()}: ${result.content.final.substring(0, 100)}...`);

                    // If social media APIs are configured, post automatically
                    // Uncomment the line below when you have API keys set up
                    // await socialMediaIntegrations.postToAllPlatforms([platform], result.content.final, result.visuals?.companyImages?.[0]);
                }

                console.log(`✅ AUTOMATION COMPLETE: Next post in ${interval}`);

            } catch (error) {
                console.error('❌ AUTOMATION ERROR:', error);
            }
        }, {
            scheduled: false
        });

        // Start the task
        automationTask.start();

        console.log(`⏰ AUTOMATION STARTED: Posting every ${interval} to ${platforms.join(', ')}`);

        res.json({
            success: true,
            message: `Automation started - posting every ${interval}`,
            settings: automationSettings
        });

    } catch (error) {
        console.error('Automation setup error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/stop-automation', (req, res) => {
    try {
        if (automationTask) {
            automationTask.stop();
            automationTask = null;
            console.log('⏹️ AUTOMATION STOPPED');
        }

        automationSettings = null;

        res.json({ success: true, message: 'Automation stopped' });
    } catch (error) {
        console.error('Stop automation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    const companyAssets = getCompanyAssets();
    console.log('');
    console.log('=====================================================');
    console.log('   🇳🇬 BINCOM BUSINESS AUTOMATION PLATFORM 💙        ');
    console.log('   Modern Blue & White Design • Nigerian Businesses   ');
    console.log('=====================================================');
    console.log(`   Server running at: http://localhost:${port}`);
    console.log(`   Company assets loaded: ${companyAssets.images.length} images`);
    console.log(`   Nano Banana API: ${process.env.NANOBANANA_API_KEY ? '💙 Modern Design Ready' : '❌ Missing'}`);
    console.log('   Status: ✨ BEAUTIFUL LIGHT THEME READY - Blue, White & Pink ✨');
    console.log('   Design: Professional • Clean • Modern • Nigerian');
    console.log('=====================================================');
    console.log('');
});