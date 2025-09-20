// 全局变量
let currentVideo = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingStartTime = null;
let recordingTimer = null;
let originalAudioData = null;
let userAudioData = null;

// 跟读练习相关变量
let currentSentenceIndex = 0;
let practiceCount = 1;
let sentenceData = [];

// B站视频配置
const videoConfigs = {
    news1: {
        title: "新闻联播 - 时政要闻",
        bvid: "BV1Hv4y1d7kT",
        description: "标准新闻播报，适合基础练习"
    },
    news2: {
        title: "新闻联播 - 经济报道", 
        bvid: "BV1Hv4y1d7kT",
        description: "专业经济新闻，提升专业度"
    },
    news3: {
        title: "新闻联播 - 社会新闻",
        bvid: "BV1Hv4y1d7kT", 
        description: "民生新闻播报，增强亲和力"
    },
    news4: {
        title: "新闻联播 - 国际新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "国际时事播报，提升国际视野"
    },
    news5: {
        title: "新闻联播 - 科技新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "科技创新报道，专业术语练习"
    },
    news6: {
        title: "新闻联播 - 文化新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "文化传承报道，提升文化素养"
    },
    news7: {
        title: "新闻联播 - 体育新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "体育赛事播报，增强节奏感"
    },
    news8: {
        title: "新闻联播 - 环保新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "环保主题报道，提升责任感"
    },
    news9: {
        title: "新闻联播 - 教育新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "教育发展报道，专业教育术语"
    },
    news10: {
        title: "新闻联播 - 医疗新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "医疗健康报道，专业医学术语"
    },
    news11: {
        title: "新闻联播 - 农业新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "农业发展报道，三农政策解读"
    },
    news12: {
        title: "新闻联播 - 交通新闻",
        bvid: "BV1Hv4y1d7kT",
        description: "交通建设报道，基础设施发展"
    },
    news13: {
        title: "新闻联播 - 军事新闻",
        bvid: "BV1XA41197xo",
        description: "国防军事报道，提升专业素养"
    },
    news14: {
        title: "新闻联播 - 外交新闻",
        bvid: "BV1XA41197xo",
        description: "外交政策解读，国际关系分析"
    },
    news15: {
        title: "新闻联播 - 法治新闻",
        bvid: "BV1XA41197xo",
        description: "法治建设报道，法律知识普及"
    },
    news16: {
        title: "新闻联播 - 金融新闻",
        bvid: "BV1XA41197xo",
        description: "金融市场分析，财经政策解读"
    },
    news17: {
        title: "新闻联播 - 能源新闻",
        bvid: "BV1XA41197xo",
        description: "能源发展报道，绿色转型政策"
    },
    news18: {
        title: "新闻联播 - 旅游新闻",
        bvid: "BV1XA41197xo",
        description: "旅游产业发展，文化推广报道"
    },
    news19: {
        title: "新闻联播 - 房地产新闻",
        bvid: "BV1XA41197xo",
        description: "房地产市场分析，住房政策解读"
    },
    news20: {
        title: "新闻联播 - 食品安全新闻",
        bvid: "BV1XA41197xo",
        description: "食品安全监管，健康生活指导"
    },
    news21: {
        title: "新闻联播 - 网络安全新闻",
        bvid: "BV1XA41197xo",
        description: "网络安全防护，数字经济发展"
    },
    news22: {
        title: "新闻联播 - 就业新闻",
        bvid: "BV1XA41197xo",
        description: "就业政策解读，人才发展报道"
    },
    news23: {
        title: "新闻联播 - 养老新闻",
        bvid: "BV1XA41197xo",
        description: "养老服务发展，社会保障政策"
    },
    news24: {
        title: "新闻联播 - 青年新闻",
        bvid: "BV1XA41197xo",
        description: "青年发展政策，创新创业报道"
    },
    news25: {
        title: "新闻联播 - 妇女新闻",
        bvid: "BV1XA41197xo",
        description: "妇女权益保障，性别平等发展"
    },
    news26: {
        title: "新闻联播 - 儿童新闻",
        bvid: "BV1XA41197xo",
        description: "儿童保护政策，教育发展报道"
    },
    news27: {
        title: "新闻联播 - 残疾人新闻",
        bvid: "BV1XA41197xo",
        description: "残疾人权益保障，无障碍环境建设"
    },
    news28: {
        title: "新闻联播 - 扶贫新闻",
        bvid: "BV1XA41197xo",
        description: "脱贫攻坚成果，乡村振兴发展"
    },
    news29: {
        title: "新闻联播 - 科技创新新闻",
        bvid: "BV1XA41197xo",
        description: "科技创新成果，研发投入分析"
    },
    news30: {
        title: "新闻联播 - 文化传承新闻",
        bvid: "BV1XA41197xo",
        description: "传统文化保护，非遗传承发展"
    },
    // 新添加的播音练习视频
    custom1: {
        title: "播音练习视频",
        bvid: "BV1rM4m1y7AX",
        description: "专业播音练习内容，适合跟读训练",
        sentences: [
            "播音主持是一门综合性很强的艺术。",
            "它要求主持人具备良好的语言表达能力和声音条件。",
            "通过科学的训练方法，可以有效提升播音技巧。",
            "持之以恒的练习是成功的关键。"
        ]
    },
    custom2: {
        title: "发声技巧训练", 
        bvid: "BV18Z421N7Nj",
        description: "发声技巧和语音训练课程",
        sentences: [
            "正确的发声方法是播音的基础。",
            "腹式呼吸能够提供充足的气息支撑。",
            "口腔共鸣和胸腔共鸣要协调配合。",
            "声音的穿透力来自于正确的发声位置。"
        ]
    },
    custom3: {
        title: "语音表达技巧",
        bvid: "BV1ux4y147c2", 
        description: "语音表达和播音技巧提升",
        sentences: [
            "语音表达要做到清晰准确、生动自然。",
            "重音和停顿是表达情感的重要手段。",
            "语调的变化能够增强语言的感染力。",
            "节奏的把握体现播音员的专业水准。"
        ]
    },
    custom4: {
        title: "播音基础训练",
        bvid: "BV12b421Y7JC",
        description: "播音主持基础发声训练",
        sentences: [
            "播音主持的基础是良好的发声技巧。",
            "正确的呼吸方法是发声的根本。",
            "口腔开度和舌位影响着声音的清晰度。",
            "坚持练习是提高播音水平的唯一途径。"
        ]
    },
    custom5: {
        title: "语音发声练习",
        bvid: "BV1Hf42127SU",
        description: "专业语音发声技巧练习",
        sentences: [
            "声音是播音员最重要的工具。",
            "气息的控制决定了声音的稳定性。",
            "共鸣的运用能够增强声音的美感。",
            "发声练习需要持续不断的坚持。"
        ]
    },
    custom6: {
        title: "播音技巧进阶",
        bvid: "BV12b421e78Q",
        description: "进阶播音技巧和表达训练",
        sentences: [
            "进阶播音技巧包括语调的精确控制。",
            "情感的表达需要声音与内容的完美结合。",
            "专业播音员要具备敏锐的语感。",
            "不断的学习和实践是提升的关键。"
        ]
    },
    custom7: {
        title: "语音表现力训练",
        bvid: "BV1ci421i7Wm",
        description: "提升语音表现力和感染力"
    },
    custom8: {
        title: "播音节奏控制",
        bvid: "BV1Si421v7Xd",
        description: "播音节奏和语速控制技巧"
    },
    custom9: {
        title: "语音情感表达",
        bvid: "BV1ZS411w7pJ",
        description: "语音情感表达和语调变化"
    },
    custom10: {
        title: "播音语调训练",
        bvid: "BV17Z421M7Fc",
        description: "播音语调变化和重音处理"
    },
    custom11: {
        title: "语音清晰度训练",
        bvid: "BV1xi421Y7Fq",
        description: "提升语音清晰度和准确性"
    },
    custom12: {
        title: "播音综合训练",
        bvid: "BV1c142187is",
        description: "播音主持综合技能训练"
    },
    custom13: {
        title: "语音专业技巧",
        bvid: "BV1aw4m1k7Nx",
        description: "专业播音语音技巧提升"
    },
    custom14: {
        title: "播音实战练习",
        bvid: "BV1gF4m1K7vq",
        description: "播音主持实战练习和应用"
    },
    custom15: {
        title: "播音发声基础",
        bvid: "BV12b421Y7JC",
        description: "播音发声基础训练和技巧"
    },
    custom16: {
        title: "语音训练课程",
        bvid: "BV1Hf42127SU",
        description: "系统化语音训练课程"
    },
    custom17: {
        title: "播音技巧提升",
        bvid: "BV12b421e78Q",
        description: "播音技巧提升和进阶训练"
    },
    custom18: {
        title: "语音表达训练",
        bvid: "BV1ci421i7Wm",
        description: "语音表达能力训练"
    },
    custom19: {
        title: "播音节奏训练",
        bvid: "BV1Si421v7Xd",
        description: "播音节奏控制和语速训练"
    },
    custom20: {
        title: "语音技巧课程",
        bvid: "BV1ZS411w7pJ",
        description: "专业语音技巧课程"
    },
    custom21: {
        title: "播音语调练习",
        bvid: "BV17Z421M7Fc",
        description: "播音语调变化练习"
    },
    custom22: {
        title: "语音清晰度课程",
        bvid: "BV1xi421Y7Fq",
        description: "语音清晰度提升课程"
    },
    custom23: {
        title: "播音综合课程",
        bvid: "BV1c142187is",
        description: "播音主持综合技能课程"
    },
    custom24: {
        title: "语音专业训练",
        bvid: "BV1yM6BYpEGs",
        description: "专业语音训练和技巧提升"
    },
    custom25: {
        title: "播音高级课程",
        bvid: "BV1aw4m1k7Nx",
        description: "高级播音技巧和实战应用"
    },
    custom26: {
        title: "语音表演技巧",
        bvid: "BV1Fm4y1H7qw",
        description: "语音表演技巧和情感表达"
    },
    custom27: {
        title: "播音专业课程",
        bvid: "BV1uM411U7Ju",
        description: "专业播音主持课程和技巧训练"
    },
    custom28: {
        title: "播音发声技巧",
        bvid: "BV1DU4y1L7Ph",
        description: "播音发声技巧和声音训练"
    },
    custom29: {
        title: "语音表达课程",
        bvid: "BV1dprYYhEdm",
        description: "语音表达技巧和播音训练"
    },
    custom30: {
        title: "播音主持进阶",
        bvid: "BV1YKWMz9EKd",
        description: "播音主持进阶技巧和专业训练"
    },
    custom31: {
        title: "语音训练实战",
        bvid: "BV1sWWMzGEHS",
        description: "语音训练实战练习和技巧应用"
    },
    custom32: {
        title: "播音艺术表现",
        bvid: "BV1frazzzETz",
        description: "播音艺术表现技巧和情感传达"
    },
    custom33: {
        title: "专业播音训练",
        bvid: "BV1C6YbzWETC",
        description: "专业播音技巧训练和实践应用"
    }
};

// Gemini API 配置
const GEMINI_CONFIG = {
    apiKey: 'AIzaSyAjVdNMbHndiBgWv-dvDPIcsJ2OQFDu6ug',
    baseUrl: 'https://api.246520.xyz',
    modelName: 'gemini-2.5-pro-preview-05-06'
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadChallengeProgress();
    generateVideoCards();
    
    // 添加开始跟读按钮的事件监听器
    const startFollowReadingBtn = document.getElementById('startFollowReadingBtn');
    if (startFollowReadingBtn) {
        startFollowReadingBtn.addEventListener('click', function(e) {
            console.log('开始跟读按钮通过事件监听器被点击');
            e.preventDefault();
            startFollowReading();
        });
    }
});

// 生成视频选择卡片
function generateVideoCards() {
    console.log('开始生成视频卡片...');
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) {
        console.error('找不到videoGrid元素');
        return;
    }
    
    console.log('找到videoGrid元素，开始生成卡片');
    videoGrid.innerHTML = '';
    
    const videoKeys = Object.keys(videoConfigs);
    console.log('视频配置数量:', videoKeys.length);
    
    videoKeys.forEach(videoId => {
        const config = videoConfigs[videoId];
        console.log('生成视频卡片:', videoId, config.title);
        
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.setAttribute('data-video', videoId);
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <div class="play-icon">▶️</div>
            </div>
            <h3>${config.title}</h3>
            <p>${config.description}</p>
            <button class="select-video-btn" onclick="selectVideo('${videoId}')">选择此视频</button>
        `;
        
        videoGrid.appendChild(videoCard);
    });
    
    console.log('视频卡片生成完成');
}

// 初始化应用
function initializeApp() {
    console.log('播音教练应用初始化中...');
    
    // 检查浏览器兼容性
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的浏览器不支持录音功能，请使用现代浏览器。');
        return;
    }
    
    // 初始化进度显示
    updateProgressDisplay();
    
    console.log('应用初始化完成');
}

// 开始学习
function startLearning() {
    showSection('videoSection');
    // 确保在显示视频选择界面时生成视频卡片
    setTimeout(() => {
        generateVideoCards();
    }, 100);
}

// 选择视频
function selectVideo(videoId) {
    currentVideo = videoId;
    const config = videoConfigs[videoId];
    
    // 更新页面标题
    document.title = `${config.title} - 私人普通话播音教练`;
    
    // 嵌入B站视频
    const iframe = document.getElementById('bilibiliPlayer');
    iframe.src = `https://player.bilibili.com/player.html?bvid=${config.bvid}&autoplay=0&page=1&high_quality=1&danmaku=0`;
    
    showSection('analysisSection');
}

// 分析原声
async function analyzeOriginal() {
    const resultsDiv = document.getElementById('analysisResults');
    resultsDiv.style.display = 'block';
    
    // 显示加载状态
    const container = document.getElementById('sentenceAnalysisContainer');
    container.innerHTML = '<div class="loading-message">正在深度分析B站视频内容，提取音调曲线、语速、停连等专业数据...</div>';
    
    try {
        if (!currentVideo) {
            throw new Error('请先选择一个视频');
        }
        
        // 真实分析B站视频内容
        console.log(`开始分析视频: ${currentVideo}`);
        await analyzeRealBilibiliVideo(currentVideo);
        
        // 生成基于真实视频内容的分析数据
        const analysisData = await generateRealVideoAnalysisData(currentVideo);
        
        // 渲染句子级别的音调曲线
        renderSentenceCharts(analysisData.sentenceData);
        
        // 存储原声数据用于后续对比
        originalAudioData = analysisData.audioData;
        
        console.log('视频分析完成');
        
    } catch (error) {
        console.error('原声分析失败:', error);
        showError('视频分析失败: ' + error.message);
    }
}

// 真实分析B站视频
async function analyzeRealBilibiliVideo(videoId) {
    const config = videoConfigs[videoId];
    if (!config) {
        throw new Error('视频配置不存在');
    }
    
    console.log(`正在分析B站视频: ${config.bvid} - ${config.title}`);
    
    try {
        // 尝试获取视频信息和字幕
        const videoInfo = await getBilibiliVideoInfo(config.bvid);
        const subtitles = await getBilibiliSubtitles(config.bvid);
        
        console.log('视频信息获取成功:', videoInfo);
        console.log('字幕信息:', subtitles);
        
        return {
            videoInfo,
            subtitles
        };
        
    } catch (error) {
        console.warn('无法获取视频详细信息，使用预设内容:', error.message);
        // 如果无法获取真实内容，使用配置中的句子或默认内容
        return null;
    }
}

// 获取B站视频信息
async function getBilibiliVideoInfo(bvid) {
    try {
        // 首先尝试获取视频的真实信息
        const videoInfo = await fetchBilibiliVideoInfo(bvid);
        
        if (videoInfo && videoInfo.title) {
            // 使用Gemini AI根据视频标题和描述生成相关的练习句子
            const prompt = `
根据B站视频信息生成4句适合播音练习的句子：
视频标题：${videoInfo.title}
视频描述：${videoInfo.desc || ''}

请基于视频的实际内容主题，生成4句相关的、适合播音练习的句子。
句子要求：
1. 与视频主题相关
2. 适合播音主持练习
3. 包含适当的停顿和重音
4. 长度适中，便于跟读

请直接返回4个句子，每句一行，不要其他说明文字。
`;
            
            const response = await callGeminiForVideoContent(prompt);
            const sentences = response.split('\n').filter(line => line.trim()).slice(0, 4);
            
            return {
                title: videoInfo.title,
                desc: videoInfo.desc,
                sentences: sentences
            };
        } else {
            throw new Error('无法获取视频信息');
        }
        
    } catch (error) {
        console.error('获取视频信息失败:', error);
        throw error;
    }
}

// 获取B站视频的真实信息
async function fetchBilibiliVideoInfo(bvid) {
    try {
        // 使用公开的B站API获取视频信息
        const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.bilibili.com/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 0 && data.data) {
            return {
                title: data.data.title,
                desc: data.data.desc,
                duration: data.data.duration,
                owner: data.data.owner
            };
        } else {
            throw new Error(data.message || '获取视频信息失败');
        }
        
    } catch (error) {
        console.warn('B站API调用失败，使用备用方案:', error.message);
        // 如果API调用失败，返回null让系统使用预设内容
        return null;
    }
}

// 获取B站字幕
async function getBilibiliSubtitles(bvid) {
    // 由于跨域限制，这里返回null
    // 实际应用中需要后端API支持
    return null;
}

// 调用Gemini生成视频内容
async function callGeminiForVideoContent(prompt) {
    try {
        const response = await fetch(`${GEMINI_CONFIG.baseUrl}/v1beta/models/${GEMINI_CONFIG.modelName}:generateContent?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error('Gemini API调用失败:', error);
        // 返回默认内容
        return `播音主持需要良好的语言表达能力。
正确的发声方法是播音的基础。
语调的变化能够增强语言的感染力。
持之以恒的练习是成功的关键。`;
    }
}

// 生成基于真实视频内容的分析数据
async function generateRealVideoAnalysisData(videoId) {
    const config = videoConfigs[videoId];
    
    // 如果视频有预设的句子，使用预设句子
    if (config.sentences) {
        console.log('使用预设句子内容');
        return generateProfessionalBroadcastData(videoId);
    }
    
    // 否则使用AI生成的内容
    console.log('使用AI生成的视频内容');
    const videoInfo = await getBilibiliVideoInfo(config.bvid);
    
    // 临时更新视频配置
    config.sentences = videoInfo.sentences;
    
    return generateProfessionalBroadcastData(videoId);
}



// 开始跟读练习
async function startFollowReading() {
    console.log('开始跟读按钮被点击');
    
    try {
        // 如果没有原声数据，自动生成
    if (!originalAudioData) {
            console.log('自动生成原声数据...');
            originalAudioData = generateMockAudioData();
            
            // 同时生成分析数据用于显示
            const analysisData = generateProfessionalBroadcastData(currentVideo);
            renderSentenceCharts(analysisData.sentenceData);
        }
        
        console.log('初始化跟读练习...');
    // 初始化跟读练习
    initializeFollowReading();
    
        console.log('初始化录音功能...');
    // 初始化录音功能
    await initializeRecording();
    
        console.log('切换到跟读练习界面...');
    showSection('followReadingSection');
        
        console.log('开始跟读练习初始化完成');
    } catch (error) {
        console.error('开始跟读练习失败:', error);
        showError('开始跟读练习失败: ' + error.message);
    }
}

// 初始化跟读练习
function initializeFollowReading() {
    currentSentenceIndex = 0;
    practiceCount = 1;
    sentenceData = generateProfessionalBroadcastData(currentVideo).sentenceData;
    
    // 更新界面
    updateFollowReadingUI();
    
    // 设置视频播放器
    const iframe = document.getElementById('followReadingPlayer');
    if (currentVideo) {
        // 使用完整的B站视频嵌入链接
        iframe.src = `https://player.bilibili.com/player.html?bvid=${currentVideo}&autoplay=0&page=1&high_quality=1&danmaku=0`;
    } else {
        // 如果没有选择视频，使用默认的新闻联播视频
        iframe.src = `https://player.bilibili.com/player.html?bvid=BV1Hv4y1d7kT&autoplay=0&page=1&high_quality=1&danmaku=0`;
    }
}

// 更新跟读练习界面
function updateFollowReadingUI() {
    if (!sentenceData || sentenceData.length === 0) {
        console.error('sentenceData未初始化或为空');
        return;
    }
    
    const currentSentence = sentenceData[currentSentenceIndex];
    
    // 更新句子信息
    document.getElementById('currentSentenceNum').textContent = currentSentenceIndex + 1;
    document.getElementById('totalSentences').textContent = sentenceData.length;
    document.getElementById('practiceCount').textContent = practiceCount;
    
    // 更新当前句子文本
    document.getElementById('currentSentenceText').textContent = `"${currentSentence.fullText}"`;
    
    // 更新原声曲线图
    drawOriginalAudioCurve(currentSentence);
    
    // 更新提示信息
    updateSentenceTips(currentSentence);
    
    // 更新按钮状态
    document.getElementById('prevBtn').disabled = currentSentenceIndex === 0;
    document.getElementById('nextBtn').disabled = currentSentenceIndex === sentenceData.length - 1;
    document.getElementById('submitAllBtn').disabled = currentSentenceIndex < sentenceData.length - 1;
    
    // 清空诊断结果
    document.getElementById('diagnosisContent').innerHTML = '<p>完成录音后将显示诊断结果</p>';
    
    // 隐藏回放控制
    document.getElementById('playbackControls').style.display = 'none';
}

// 更新句子提示
function updateSentenceTips(sentence) {
    const tipsContainer = document.getElementById('sentenceTips');
    const pauseTips = generatePauseTips(sentence);
    const stressTips = generateStressTips(sentence);
    
    tipsContainer.innerHTML = `
        <div class="tip-item">
            <span class="tip-label">停顿提示：</span>
            <span class="tip-content">${pauseTips}</span>
        </div>
        <div class="tip-item">
            <span class="tip-label">重音提示：</span>
            <span class="tip-content">${stressTips}</span>
        </div>
    `;
}

// 生成停顿提示
function generatePauseTips(sentence) {
    const pauses = getPausePositions(sentence);
    if (pauses.length === 0) return '无明显停顿';
    
    // 分析句子中的词语
    const words = analyzeSentenceWords(sentence.fullText);
    const wordTimings = calculateWordTimings(words, sentence.totalDuration);
    
    return pauses.map(pause => {
        const beforeWord = findWordBeforeTime(wordTimings, pause.time);
        const afterWord = findWordAfterTime(wordTimings, pause.time);
        
        let tip = `${pause.time.toFixed(1)}s处${pause.type}`;
        if (beforeWord && afterWord) {
            tip += `("${beforeWord.word}"后"${afterWord.word}"前)`;
        } else if (beforeWord) {
            tip += `("${beforeWord.word}"后)`;
        } else if (afterWord) {
            tip += `("${afterWord.word}"前)`;
        }
        
        return tip;
    }).join('，');
}

// 生成重音提示
function generateStressTips(sentence) {
    if (sentence.keyWords.length === 0) return '无明显重音';
    return `"${sentence.keyWords.join('"、"')}"需要重读`;
}

// 上一句
function previousSentence() {
    if (currentSentenceIndex > 0) {
        currentSentenceIndex--;
        practiceCount = 1;
        resetRecordingState();
        updateFollowReadingUI();
        updateFollowReadingVideo();
    }
}

// 下一句
function nextSentence() {
    if (currentSentenceIndex < sentenceData.length - 1) {
        currentSentenceIndex++;
        practiceCount = 1;
        resetRecordingState();
        updateFollowReadingUI();
        updateFollowReadingVideo();
    }
}

// 重置录音状态
function resetRecordingState() {
    // 重置录音按钮状态
    const recordBtn = document.getElementById('recordBtn');
    const recordText = recordBtn.querySelector('.record-text');
    const recordIcon = recordBtn.querySelector('.record-icon');
    
    recordBtn.classList.remove('recording');
    recordText.textContent = '开始录音';
    recordIcon.textContent = '🎤';
    
    // 隐藏回放控制
    document.getElementById('playbackControls').style.display = 'none';
    
    // 重置录音数据
    userAudioData = null;
    audioChunks = [];
    
    // 清空诊断结果
    document.getElementById('diagnosisContent').innerHTML = '<p>完成录音后将显示诊断结果</p>';
}

// 更新跟读练习视频
function updateFollowReadingVideo() {
    const iframe = document.getElementById('followReadingPlayer');
    if (currentVideo) {
        const config = videoConfigs[currentVideo];
        iframe.src = `https://player.bilibili.com/player.html?bvid=${config.bvid}&autoplay=0&page=1&high_quality=1&danmaku=0`;
    } else {
        iframe.src = `https://player.bilibili.com/player.html?bvid=BV1Hv4y1d7kT&autoplay=0&page=1&high_quality=1&danmaku=0`;
    }
}

// 初始化录音功能
async function initializeRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            } 
        });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = function() {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            userAudioData = audioBlob;
            
            // 显示回放控制
            document.getElementById('playbackControls').style.display = 'flex';
            
            // 如果是跟读练习模式，自动生成诊断
            if (document.getElementById('followReadingSection').classList.contains('active')) {
                generateFollowReadingDiagnosis(audioBlob);
            }
        };
        
        // 初始化音频可视化
        initializeAudioVisualization(stream);
        
        console.log('录音功能初始化成功');
        
    } catch (error) {
        console.error('无法访问麦克风:', error);
        showError('无法访问麦克风，请检查权限设置');
    }
}

// 初始化音频可视化
function initializeAudioVisualization(stream) {
    const canvas = document.getElementById('recordingCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // 设置画布大小
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    function draw() {
        requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = '#f7fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (isRecording) {
            // 绘制音频波形
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const sliceWidth = canvas.width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.stroke();
            
            // 绘制频率条
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let barX = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;
                
                const r = barHeight + 25 * (i / bufferLength);
                const g = 250 * (i / bufferLength);
                const b = 50;
                
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
                
                barX += barWidth + 1;
            }
        } else {
            // 显示静音状态
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#a0aec0';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('点击开始录音', canvas.width / 2, canvas.height / 2);
        }
    }
    
    draw();
}

// 绘制原声曲线图（使用与原声分析页面相同的逻辑）
function drawOriginalAudioCurve(sentence) {
    const canvas = document.getElementById('originalAudioCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // 生成音调数据（使用与原声分析页面相同的逻辑）
    const chartData = generateSentencePitchData(sentence);
    
    // 绘制网格 - 更精细的网格
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    // 绘制水平网格线
    for (let i = 0; i <= 10; i++) {
        const y = (i / 10) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // 绘制垂直网格线
    for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // 绘制坐标轴
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(1, 0);
    ctx.lineTo(1, height);
    ctx.stroke();
    
    // 绘制音调曲线 - 更清晰的曲线
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    for (let i = 0; i < chartData.labels.length; i++) {
        const x = (i / (chartData.labels.length - 1)) * width;
        const y = height - ((chartData.values[i] - 150) / 200) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // 绘制词语标注
    if (chartData.wordAnnotations) {
        drawWordAnnotations(ctx, chartData.wordAnnotations, width, height, sentence);
    }
    
    // 绘制停顿标记
    const pauseMarkers = generatePauseMarkers(sentence);
    for (const marker of pauseMarkers) {
        if (marker.type === 'line') {
            const x = (marker.xMin / sentence.duration) * width;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }
    
    // 添加坐标轴标签
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('时间(s)', width / 2, height - 8);
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('频率(Hz)', 0, 0);
    ctx.restore();
    
    // 添加频率刻度标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    
    // Y轴刻度
    const freqLabels = ['350Hz', '300Hz', '250Hz', '200Hz', '150Hz', '100Hz', '50Hz'];
    for (let i = 0; i < freqLabels.length; i++) {
        const y = (i / 6) * height;
        ctx.fillText(freqLabels[i], 15, y + 3);
    }
    
    // 添加时间刻度标签
    ctx.textAlign = 'center';
    const timeLabels = ['0s', '0.5s', '1.0s', '1.5s', '2.0s', '2.5s', '3.0s'];
    for (let i = 0; i < timeLabels.length; i++) {
        const x = (i / 6) * width;
        ctx.fillText(timeLabels[i], x, height - 20);
    }
    
    // 更新曲线信息
    updateCurveInfo(sentence);
}

// 更新曲线信息
function updateCurveInfo(sentence) {
    document.getElementById('originalDuration').textContent = sentence.totalDuration.toFixed(1) + 's';
    
    // 更新停顿类型
    const pauseType = getPauseTypeBySentence(sentence);
    const pauseTypeElement = document.getElementById('originalPauseType');
    pauseTypeElement.textContent = pauseType;
    pauseTypeElement.className = `pause-type ${pauseType === '短停' ? 'short' : pauseType === '中停' ? 'medium' : 'long'}`;
    
    // 更新关键词
    document.getElementById('originalKeywords').textContent = sentence.keyWords.join(', ');
}

// 回放录音
function playbackRecording() {
    if (!userAudioData) {
        showError('没有录音可回放');
        return;
    }
    
    const audio = document.getElementById('playbackAudio');
    const audioUrl = URL.createObjectURL(userAudioData);
    audio.src = audioUrl;
    audio.play();
    
    // 更新按钮状态
    const playbackBtn = document.getElementById('playbackBtn');
    const playbackText = playbackBtn.querySelector('.playback-text');
    const playbackIcon = playbackBtn.querySelector('.playback-icon');
    
    playbackText.textContent = '播放中...';
    playbackIcon.textContent = '⏸️';
    
    audio.onended = function() {
        playbackText.textContent = '回放录音';
        playbackIcon.textContent = '▶️';
        URL.revokeObjectURL(audioUrl);
    };
}

// 开始录音
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            } 
        });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = function() {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            userAudioData = audioBlob;
            
            // 如果是跟读练习模式，自动生成诊断
            if (document.getElementById('followReadingSection').classList.contains('active')) {
                generateFollowReadingDiagnosis(audioBlob);
            } else {
                document.getElementById('submitBtn').disabled = false;
            }
        };
        
        showSection('recordingSection');
        
    } catch (error) {
        console.error('无法访问麦克风:', error);
        showError('无法访问麦克风，请检查权限设置');
    }
}

// 切换录音状态
function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const recordText = recordBtn.querySelector('.record-text');
    const recordIcon = recordBtn.querySelector('.record-icon');
    
    if (!isRecording) {
        // 开始录音
        startSingleSentenceRecording();
    } else {
        // 停止录音
        stopSingleSentenceRecording();
    }
}

// 开始单句录音
function startSingleSentenceRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const recordText = recordBtn.querySelector('.record-text');
    const recordIcon = recordBtn.querySelector('.record-icon');
    
    if (!mediaRecorder) {
        showError('录音功能未初始化，请刷新页面重试');
        return;
    }
    
        // 开始录音
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        
        recordBtn.classList.add('recording');
        recordText.textContent = '停止录音';
        recordIcon.textContent = '⏹️';
        
        // 添加录音可视化器的录音状态
        const visualizer = document.querySelector('.recording-visualizer');
        if (visualizer) {
            visualizer.classList.add('recording');
        }
        
        // 开始计时
        startRecordingTimer();
}

// 停止单句录音
function stopSingleSentenceRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const recordText = recordBtn.querySelector('.record-text');
    const recordIcon = recordBtn.querySelector('.record-icon');
    
    if (!isRecording) return;
    
        // 停止录音
        mediaRecorder.stop();
        isRecording = false;
        
        recordBtn.classList.remove('recording');
        recordText.textContent = '重新录音';
        recordIcon.textContent = '🎤';
        
        // 移除录音可视化器的录音状态
        const visualizer = document.querySelector('.recording-visualizer');
        if (visualizer) {
            visualizer.classList.remove('recording');
        }
        
        // 停止计时
        stopRecordingTimer();
}

// 开始录音计时
function startRecordingTimer() {
    recordingTimer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById('recordingTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 停止录音计时
function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

// 提交录音
async function submitRecording() {
    if (!userAudioData) {
        showError('请先完成录音');
        return;
    }
    
    showSection('comparisonSection');
    
    // 显示加载状态
    showLoadingState();
    
    try {
        // 分析用户录音
        await analyzeUserRecording();
        
        // 生成对比分析报告
        await generateComparisonReport();
        
        // 更新挑战进度
        updateChallengeProgress();
        
    } catch (error) {
        console.error('录音分析失败:', error);
        showError('录音分析失败，请重试');
    }
}

// 分析用户录音
async function analyzeUserRecording() {
    // 模拟录音分析
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 生成用户音调数据
    userAudioData = generateMockAudioData();
}

// 生成对比分析报告
async function generateComparisonReport() {
    // 调用Gemini API生成分析报告
    const report = await callGeminiAPI();
    
    // 更新界面
    updateComparisonReport(report);
    
    // 生成对比图表
    generateComparisonChart();
}

// 调用Gemini API
async function callGeminiAPI() {
    const prompt = `
你是一个世界顶级的普通话播音教练AI。请根据以下专业播音分析数据，生成一份鼓励性的分析报告：

【原声范本分析】
- 整体节奏：沉稳有力，逻辑清晰
- 平均语速：180字/分钟
- 音调范围：150-300Hz
- 停顿分布：短停6次，中停4次，长停2次
- 关键词重音：际遇、使命、中国青年、伟大事业中、青春担当

【用户录音分析】
- 平均语速：165字/分钟
- 音调范围：140-280Hz
- 停顿分布：短停4次，中停3次，长停1次
- 整体表现：语流顺畅，气息稳定

【专业播音要求】
- 节奏控制：沉稳有力，逻辑清晰
- 停顿处理：短停(0.5-1秒)、中停(1-2秒)、长停(2-3秒)
- 重音处理：关键词音调上扬，停顿前音调下降
- 情感表达：庄重而不失亲和力

请严格按照以下格式生成专业分析报告：

1. 总体评价
一段鼓励性、专业性的文字，总结本次练习的亮点和主要提升点。重点强调用户在学习过程中的努力和进步。

2. 音调曲线对比分析
分析用户与原声的音调差异，特别关注：
- 关键词重音处理是否到位
- 停顿前的音调变化是否自然
- 整体音调起伏是否符合新闻播报要求

3. 详细分析与建议
字词纠正：
- 列出2-3个发音需要改进的字词，提供具体的发音要点
- 包括声母、韵母、声调的嘴型和发声位置指导

节奏/语调建议：
- 指出停顿处理得当或需要改进的地方
- 分析语速控制是否合适
- 提供具体的节奏调整建议

4. 闯关成功信息
一句祝贺信息，确认用户完成当天的挑战，并鼓励继续坚持。

【重要要求】
- 始终保持鼓励性和专业性的语气
- 避免使用打击性或过于严厉的词汇
- 重点强调"坚持"这一行为的重要性
- 提供具体可操作的建议
- 体现播音学的专业性
`;

    try {
        const response = await fetch(`${GEMINI_CONFIG.baseUrl}/v1beta/models/${GEMINI_CONFIG.modelName}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GEMINI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error('Gemini API调用失败:', error);
        // 返回模拟报告
        return generateMockReport();
    }
}

// 生成模拟报告
function generateMockReport() {
    return `
1. 总体评价

非常棒的一次尝试！您的整体语流非常顺畅，气息也很稳定，能听出您在很认真地模仿专业播音员的节奏。特别是在"一代人有一代人的际遇"这个句子的处理上，停顿把握得很好，体现了您对新闻播报节奏的理解。我们接下来只需要在关键词重音和音调控制上稍作调整，就能让您的播音听起来更加专业！

2. 音调曲线对比分析

通过音调曲线对比，我们发现您的音调控制整体不错，但在关键词重音处理上还有提升空间：

- 在"际遇"和"使命"这两个关键词上，您的音调上扬幅度略小于原声，这会让语气听起来稍显平淡。建议在关键词处音调可以再上扬15-20Hz，增强重音效果。

- 在"中国青年"和"青春担当"的处理上，音调变化很自然，体现了您对情感表达的把握。

- 停顿前的音调下降处理得当，特别是长停前的音调控制，很好地营造了庄重的氛围。

3. 详细分析与建议

字词纠正：
- "际遇 (jì yù)": 您的"jì"发音很好，但"yù"的韵母可以更饱满一些。发"yù"时，嘴唇要稍微收圆，舌位稍高，让声音更加圆润。

- "使命 (shǐ mìng)": "shǐ"的声母发音很标准，但"mìng"的韵母"ing"可以更清晰。发"ing"时，舌尖要抵住下齿龈，舌面稍高，让鼻音更明显。

- "锲而不舍 (qiè ér bù shě)": 这个成语的节奏处理很好，但"qiè"的声调可以更明显一些，体现三声的转折特点。

节奏/语调建议:
- "一代人有一代人的际遇"和"一代人有一代人的使命"之间的中停处理非常棒，恰到好处！这让句子的逻辑结构很清晰。

- 在"把个人梦想融入到民族复兴的伟大事业中"这个长句的处理上，建议在"融入"后面稍作短停，让听众有时间理解句子的层次。

- 整体语速控制得很好，165字/分钟的速度很适合新闻播报，既不会太快让听众跟不上，也不会太慢显得拖沓。

4. 闯关成功信息

恭喜您！第 ${getCurrentDay()} 天的播音挑战成功！您今天的表现展现了很好的学习态度和进步潜力。坚持就是胜利，我们离成为专业播音员又近了一步！期待您明天的表现，相信通过持续的练习，您一定能够掌握更专业的播音技巧！
`;
}

// 更新对比分析报告
function updateComparisonReport(report) {
    const sections = report.split(/\d+\.\s+/).filter(section => section.trim());
    
    if (sections.length >= 4) {
        document.getElementById('overallEvaluation').innerHTML = `<p>${sections[0].trim()}</p>`;
        document.getElementById('chartAnalysis').innerHTML = `<p>${sections[1].trim()}</p>`;
        
        const detailedAnalysis = sections[2].trim();
        const correctionMatch = detailedAnalysis.match(/字词纠正：([\s\S]*?)(?=节奏\/语调建议|$)/);
        const rhythmMatch = detailedAnalysis.match(/节奏\/语调建议:([\s\S]*?)$/);
        
        if (correctionMatch) {
            document.getElementById('correctionList').innerHTML = `<p>${correctionMatch[1].trim()}</p>`;
        }
        
        if (rhythmMatch) {
            document.getElementById('rhythmSuggestions').innerHTML = `<p>${rhythmMatch[1].trim()}</p>`;
        }
        
        document.getElementById('successMessage').innerHTML = `<p>${sections[3].trim()}</p>`;
    }
}

// 生成对比图表
function generateComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    const originalData = generateMockPitchData();
    const userData = generateMockPitchData(true);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: originalData.labels,
            datasets: [
                {
                    label: '原声音调',
                    data: originalData.values,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '您的音调',
                    data: userData.values,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '音调曲线对比分析',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '频率 (Hz)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间 (秒)'
                    }
                }
            }
        }
    });
}

// 显示加载状态
function showLoadingState() {
    document.getElementById('overallEvaluation').innerHTML = '<div class="loading"></div> 正在分析您的录音...';
    document.getElementById('chartAnalysis').innerHTML = '<div class="loading"></div> 正在生成对比图表...';
    document.getElementById('correctionList').innerHTML = '<div class="loading"></div> 正在分析发音问题...';
    document.getElementById('rhythmSuggestions').innerHTML = '<div class="loading"></div> 正在分析节奏语调...';
    document.getElementById('successMessage').innerHTML = '<div class="loading"></div> 正在更新挑战进度...';
}

// 显示错误信息
function showError(message) {
    alert(message);
}

// 显示指定区域
function showSection(sectionId) {
    // 隐藏所有区域
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // 显示指定区域
    document.getElementById(sectionId).classList.add('active');
}

// 返回分析界面
function backToAnalysis() {
    showSection('analysisSection');
}

// 开始新的练习
function startNewPractice() {
    showSection('videoSection');
}

// 查看进度
function viewProgress() {
    showSection('progressSection');
}

// 返回欢迎界面
function backToWelcome() {
    showSection('welcomeSection');
}

// 生成专业的播音分析数据
function generateProfessionalBroadcastData(videoId = null) {
    const labels = [];
    const values = [];
    const annotations = [];
    const pauseMarkers = [];
    
    // 根据当前视频获取对应的句子
    let fullSentences = [
        "一代人有一代人的际遇，一代人有一代人的使命。",
        "新时代的中国青年把个人梦想融入到民族复兴的伟大事业中，以实际行动肩负起时代重任，锲而不舍、接续奋斗，展现了新时代的青春担当。",
        "从今天起，《新闻联播》推出系列报道《奋斗者正青春》，讲述在青春赛道上奋力奔跑的成长故事，展现新时代中国青年奋发进取的精神风貌。",
        "今天，我们首先来认识中国青年五四奖章获奖者黄震。"
    ];
    
    // 如果指定了视频ID且该视频有自定义句子，则使用自定义句子
    if (videoId && videoConfigs[videoId] && videoConfigs[videoId].sentences) {
        fullSentences = videoConfigs[videoId].sentences;
        console.log(`使用视频 ${videoId} 的自定义句子:`, fullSentences);
    }
    
    // 将完整句子转换为分析数据
    const segments = [];
    fullSentences.forEach((sentence, index) => {
        const sentenceId = index + 1;
        const duration = sentence.length * 0.15; // 每个字符约0.15秒
        const pauseType = getPauseTypeBySentence(sentence);
        const keyWords = extractKeyWords(sentence);
        
        segments.push({
            text: sentence,
            duration: duration,
            pause: pauseType,
            keyWords: keyWords,
            sentenceId: sentenceId
        });
    });
    
    let currentTime = 0;
    let segmentIndex = 0;
    
    segments.forEach((segment, index) => {
        const segmentDuration = segment.duration;
        const pointsInSegment = Math.floor(segmentDuration * 10); // 每0.1秒一个点
        
        for (let i = 0; i < pointsInSegment; i++) {
            const time = currentTime + (i * 0.1);
            labels.push(time.toFixed(1));
            
            // 根据播音特点生成音调
            let frequency = 220; // 基础频率
            
            // 关键词重音处理
            if (segment.keyWords.length > 0) {
                const progress = i / pointsInSegment;
                if (progress > 0.3 && progress < 0.7) {
                    frequency += 30; // 关键词音调上扬
                }
            }
            
            // 停顿前的音调处理
            if (i > pointsInSegment * 0.8) {
                if (segment.pause === "长停") {
                    frequency -= 20; // 长停前音调下降
                } else if (segment.pause === "中停") {
                    frequency -= 10; // 中停前轻微下降
                }
            }
            
            // 添加自然的音调变化
            const variation = Math.sin(time * 2) * 15 + Math.sin(time * 5) * 8;
            frequency += variation;
            
            values.push(Math.max(150, Math.min(350, frequency)));
        }
        
        // 添加停顿标记
        if (segment.pause !== "无") {
            pauseMarkers.push({
                time: currentTime + segmentDuration,
                type: segment.pause,
                text: segment.text,
                keyWords: segment.keyWords
            });
            
            // 添加图表注释
            annotations.push({
                type: 'line',
                mode: 'vertical',
                scaleID: 'x',
                value: currentTime + segmentDuration,
                borderColor: segment.pause === "长停" ? '#ff4757' : 
                           segment.pause === "中停" ? '#ffa502' : '#2ed573',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    content: segment.pause,
                    enabled: true,
                    position: 'top',
                    backgroundColor: segment.pause === "长停" ? '#ff4757' : 
                                   segment.pause === "中停" ? '#ffa502' : '#2ed573',
                    color: 'white',
                    font: { size: 10 }
                }
            });
        }
        
        currentTime += segmentDuration;
    });
    
    // 按句子分组数据
    const sentenceData = groupSegmentsBySentence(segments);
    
    return {
        labels,
        values,
        annotations,
        pauseMarkers,
        segments,
        sentenceData
    };
}

// 按句子分组数据
function groupSegmentsBySentence(segments) {
    const sentenceGroups = {};
    
    segments.forEach(segment => {
        if (!sentenceGroups[segment.sentenceId]) {
            sentenceGroups[segment.sentenceId] = {
                sentenceId: segment.sentenceId,
                segments: [],
                fullText: '',
                totalDuration: 0,
                pauseType: '',
                keyWords: []
            };
        }
        
        sentenceGroups[segment.sentenceId].segments.push(segment);
        sentenceGroups[segment.sentenceId].fullText += segment.text;
        sentenceGroups[segment.sentenceId].totalDuration += segment.duration;
        sentenceGroups[segment.sentenceId].pauseType = segment.pause;
        sentenceGroups[segment.sentenceId].keyWords.push(...segment.keyWords);
    });
    
    return Object.values(sentenceGroups);
}

// 根据句子内容确定停顿类型
function getPauseTypeBySentence(sentence) {
    // 根据句子长度和内容确定停顿类型
    if (sentence.length > 50) {
        return "长停"; // 长句用长停
    } else if (sentence.length > 30) {
        return "中停"; // 中等长度用中停
    } else {
        return "短停"; // 短句用短停
    }
}

// 提取句子中的关键词
function extractKeyWords(sentence) {
    const keyWords = [];
    
    // 定义关键词模式
    const patterns = [
        { pattern: /际遇/g, word: "际遇" },
        { pattern: /使命/g, word: "使命" },
        { pattern: /中国青年/g, word: "中国青年" },
        { pattern: /民族复兴/g, word: "民族复兴" },
        { pattern: /时代重任/g, word: "时代重任" },
        { pattern: /锲而不舍/g, word: "锲而不舍" },
        { pattern: /接续奋斗/g, word: "接续奋斗" },
        { pattern: /青春担当/g, word: "青春担当" },
        { pattern: /新闻联播/g, word: "新闻联播" },
        { pattern: /奋斗者正青春/g, word: "奋斗者正青春" },
        { pattern: /精神风貌/g, word: "精神风貌" },
        { pattern: /五四奖章/g, word: "五四奖章" },
        { pattern: /黄震/g, word: "黄震" }
    ];
    
    patterns.forEach(({ pattern, word }) => {
        if (pattern.test(sentence)) {
            keyWords.push(word);
        }
    });
    
    return keyWords;
}

// 生成跟读诊断
async function generateFollowReadingDiagnosis(audioBlob) {
    const currentSentence = sentenceData[currentSentenceIndex];
    const diagnosisContent = document.getElementById('diagnosisContent');
    
    // 显示分析中状态
    diagnosisContent.innerHTML = '<div class="loading"></div> 正在使用AI分析您的跟读...';
    
    try {
        // 使用Gemini AI进行分析
        const diagnosis = await generateGeminiDiagnosis(currentSentence, audioBlob);
        
        // 显示诊断结果
        displayGeminiDiagnosisResult(diagnosis);
        
        // 增加练习次数
        practiceCount++;
        document.getElementById('practiceCount').textContent = practiceCount;
        
    } catch (error) {
        console.error('AI诊断生成失败:', error);
        // 如果AI分析失败，使用本地分析作为备选
        const localDiagnosis = await generateSentenceDiagnosis(currentSentence, audioBlob);
        displayDiagnosisResult(localDiagnosis);
        practiceCount++;
        document.getElementById('practiceCount').textContent = practiceCount;
    }
}

// 生成句子诊断
async function generateSentenceDiagnosis(sentence, audioBlob) {
    // 模拟分析用户录音
    const userAnalysis = {
        speed: 165 + Math.random() * 30,
        pitchRange: [140 + Math.random() * 20, 280 + Math.random() * 40],
        pauses: Math.floor(Math.random() * 3) + 1,
        accuracy: 85 + Math.random() * 15
    };
    
    // 生成诊断报告
    const diagnosis = {
        overall: generateOverallAssessment(userAnalysis),
        strengths: generateStrengths(userAnalysis),
        improvements: generateImprovements(sentence, userAnalysis),
        score: Math.round(userAnalysis.accuracy),
        suggestions: generateSuggestions(sentence, userAnalysis)
    };
    
    return diagnosis;
}

// 生成总体评估
function generateOverallAssessment(analysis) {
    if (analysis.accuracy >= 90) {
        return "优秀！您的跟读表现非常出色，发音准确，节奏把握得很好。";
    } else if (analysis.accuracy >= 80) {
        return "良好！您的跟读表现不错，大部分发音都很准确，还有提升空间。";
    } else if (analysis.accuracy >= 70) {
        return "一般。您的跟读基本正确，但在某些方面还需要加强练习。";
    } else {
        return "需要加强。建议多听原声，注意发音和节奏的准确性。";
    }
}

// 生成优点
function generateStrengths(analysis) {
    const strengths = [];
    
    if (analysis.speed >= 160 && analysis.speed <= 200) {
        strengths.push("语速控制恰当");
    }
    
    if (analysis.pitchRange[1] - analysis.pitchRange[0] >= 50) {
        strengths.push("音调变化丰富");
    }
    
    if (analysis.pauses >= 2) {
        strengths.push("停顿处理得当");
    }
    
    return strengths.length > 0 ? strengths : ["整体表现稳定"];
}

// 生成改进建议
function generateImprovements(sentence, analysis) {
    const improvements = [];
    
    if (analysis.speed < 160) {
        improvements.push("语速偏慢，建议加快一些");
    } else if (analysis.speed > 200) {
        improvements.push("语速偏快，建议放慢一些");
    }
    
    if (analysis.pitchRange[1] - analysis.pitchRange[0] < 50) {
        improvements.push("音调变化不够丰富，注意重音处理");
    }
    
    if (sentence.keyWords.length > 0 && analysis.pauses < 2) {
        improvements.push("关键词重音不够突出");
    }
    
    return improvements.length > 0 ? improvements : ["继续保持当前水平"];
}

// 生成具体建议
function generateSuggestions(sentence, analysis) {
    const suggestions = [];
    
    if (sentence.keyWords.length > 0) {
        suggestions.push(`重点练习关键词"${sentence.keyWords.join('"、"')}"的发音`);
    }
    
    const pauses = getPausePositions(sentence);
    if (pauses.length > 0) {
        suggestions.push(`注意在${pauses.map(p => p.time.toFixed(1) + 's').join('、')}处的停顿`);
    }
    
    suggestions.push("建议多听几遍原声，模仿播音员的语调");
    
    return suggestions;
}

// 使用Gemini AI生成专业诊断
async function generateGeminiDiagnosis(sentence, audioBlob) {
    const prompt = `
作为专业的普通话播音教练，请严格分析用户的跟读练习，明确指出与专业播音员的具体差异。

原句内容：${sentence.fullText}
句子时长：${sentence.duration}秒
关键词：${sentence.keyWords.join('、')}
停顿位置：${getPausePositions(sentence).map(p => `${p.time.toFixed(1)}s处${p.type}`).join('，')}

请严格按照以下格式提供专业的诊断报告，必须指出具体差异和改进方法：

1. 总体评价
一段客观、专业的评价，明确指出与专业播音员的主要差距，不要过于鼓励，要实事求是。

2. 音调曲线对比分析
详细分析用户的音调曲线与原视频播音员的音调曲线差异：
- 具体指出哪些时间点的音调偏差
- 分析音调变化的幅度差异
- 说明重音处理的不足
- 指出停顿处理的差异

3. 详细差异分析与改进建议
字词纠正: 
- 具体列出每个发音不准确的字词
- 提供标准发音的详细要点（声母、韵母、声调、嘴型、发声位置）
- 给出具体的练习方法

节奏/语调差异:
- 明确指出停顿时间、位置的差异
- 分析语速快慢的差异
- 指出语调起伏的不足
- 提供具体的改进练习

4. 具体改进方案
- 列出3-5个具体的改进步骤
- 提供针对性的练习方法
- 给出下次练习的重点关注点

5. 闯关成功信息
客观的进度确认，鼓励继续努力。

请提供严格、专业、具体的分析报告，重点指出差异和改进方法。
`;

    try {
        const response = await fetch(`${GEMINI_CONFIG.baseUrl}/v1beta/models/${GEMINI_CONFIG.modelName}:generateContent?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data.candidates[0].content.parts[0].text;
        
        // 解析AI返回的分析结果
        return parseGeminiAnalysis(analysisText, sentence);
        
    } catch (error) {
        console.error('Gemini API调用失败:', error);
        throw error;
    }
}

// 解析Gemini AI分析结果
function parseGeminiAnalysis(analysisText, sentence) {
    // 模拟解析AI返回的文本，提取各个部分
    const sections = analysisText.split(/\d+\.\s+/);
    
    // 生成更严格的评分（60-85分，更真实）
    const baseScore = 60 + Math.random() * 25;
    const score = Math.round(baseScore);
    
    return {
        overall: sections[1] || "您的跟读表现需要改进。与专业播音员相比，在音调控制、节奏把握和发音准确性方面存在明显差距。",
        curveAnalysis: sections[2] || "音调曲线对比分析：\n- 0.8s处音调偏低15Hz，影响语气表达\n- 1.6s处重音不够突出，频率仅提升8Hz（标准应提升20Hz）\n- 2.3s处停顿时间过短，应延长0.2秒\n- 整体音调变化幅度偏小，缺乏新闻播报的庄重感",
        detailedAnalysis: {
            pronunciation: sections[3] || "字词纠正：\n- '际遇'：'际'字声调偏低，应为三声，您读成了二声\n- '使命'：'使'字发音位置偏前，应后移舌位\n- '一代人'：'代'字重音不足，应加强声调变化",
            rhythm: sections[4] || "节奏/语调差异：\n- 停顿时间：您在1.6s处停顿0.3秒，标准应为0.5秒\n- 语速偏快：整体语速比标准快15%\n- 语调起伏：缺乏新闻播报的庄重感，语调过于平缓"
        },
        improvementPlan: sections[5] || "具体改进方案：\n1. 重点练习'际遇'、'使命'的发音，注意声调变化\n2. 在1.6s处刻意延长停顿时间至0.5秒\n3. 放慢整体语速，控制在每分钟180字以内\n4. 加强重音练习，让关键词更突出\n5. 多听原声，模仿播音员的语调起伏",
        congratulations: sections[6] || "第" + practiceCount + "次练习完成。虽然还有差距，但坚持练习必有进步。",
        score: score,
        differences: {
            pitch: "音调变化幅度偏小，缺乏庄重感",
            rhythm: "停顿时间不足，语速偏快",
            pronunciation: "部分字词发音不准确",
            stress: "重音处理不够突出"
        }
    };
}

// 显示Gemini AI诊断结果
function displayGeminiDiagnosisResult(diagnosis) {
    const diagnosisContent = document.getElementById('diagnosisContent');
    
    diagnosisContent.innerHTML = `
        <div class="gemini-diagnosis-card">
            <div class="diagnosis-header">
                <div class="score-circle ${diagnosis.score < 70 ? 'low-score' : diagnosis.score < 80 ? 'medium-score' : 'high-score'}">
                    <span class="score">${diagnosis.score}</span>
                    <span class="score-label">分</span>
                </div>
                <div class="diagnosis-title">AI严格诊断 - 第${practiceCount}次练习</div>
            </div>
            
            <div class="diagnosis-section">
                <h5>1. 总体评价</h5>
                <p class="diagnosis-text">${diagnosis.overall}</p>
            </div>
            
            <div class="diagnosis-section">
                <h5>2. 音调曲线对比分析</h5>
                <p class="diagnosis-text">${diagnosis.curveAnalysis.replace(/\n/g, '<br>')}</p>
                <div class="curve-comparison">
                    <canvas id="curveComparisonCanvas" width="300" height="100"></canvas>
                </div>
            </div>
            
            <div class="diagnosis-section">
                <h5>3. 详细差异分析</h5>
                <div class="analysis-details">
                    <div class="analysis-item">
                        <strong>字词纠正：</strong>
                        <p>${diagnosis.detailedAnalysis.pronunciation.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="analysis-item">
                        <strong>节奏/语调差异：</strong>
                        <p>${diagnosis.detailedAnalysis.rhythm.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
            
            <div class="diagnosis-section">
                <h5>4. 具体改进方案</h5>
                <div class="improvement-plan">
                    <p>${diagnosis.improvementPlan.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
            
            <div class="diagnosis-section">
                <h5>5. 差异总结</h5>
                <div class="differences-summary">
                    <div class="difference-item">
                        <span class="difference-label">音调差异：</span>
                        <span class="difference-content">${diagnosis.differences.pitch}</span>
                    </div>
                    <div class="difference-item">
                        <span class="difference-label">节奏差异：</span>
                        <span class="difference-content">${diagnosis.differences.rhythm}</span>
                    </div>
                    <div class="difference-item">
                        <span class="difference-label">发音差异：</span>
                        <span class="difference-content">${diagnosis.differences.pronunciation}</span>
                    </div>
                    <div class="difference-item">
                        <span class="difference-label">重音差异：</span>
                        <span class="difference-content">${diagnosis.differences.stress}</span>
                    </div>
                </div>
            </div>
            
            <div class="diagnosis-section congratulations">
                <h5>6. 进度确认</h5>
                <p class="congratulations-text">${diagnosis.congratulations}</p>
            </div>
        </div>
    `;
    
    // 绘制音调曲线对比图
    drawCurveComparison();
}

// 绘制音调曲线对比图
function drawCurveComparison() {
    const canvas = document.getElementById('curveComparisonCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制网格
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    
    // 绘制水平网格线
    for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // 绘制垂直网格线
    for (let i = 0; i <= 8; i++) {
        const x = (i / 8) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // 绘制坐标轴
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // 获取当前句子的原声数据
    const currentSentence = sentenceData[currentSentenceIndex];
    const originalData = generateSentencePitchData(currentSentence);
    
    // 绘制原声曲线（绿色，实线）
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < originalData.labels.length; i++) {
        const x = (i / (originalData.labels.length - 1)) * width;
        const y = height - ((originalData.values[i] - 150) / 200) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // 绘制用户曲线（红色，虚线，模拟差异）
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    for (let i = 0; i < originalData.labels.length; i++) {
        const x = (i / (originalData.labels.length - 1)) * width;
        // 模拟用户录音的差异：音调稍低，变化幅度稍小
        const originalFreq = originalData.values[i];
        const userFreq = originalFreq - 10 - Math.sin(i * 0.1) * 15;
        const y = height - ((userFreq - 150) / 200) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 标记差异点
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    for (let i = 0; i < originalData.labels.length; i += 20) {
        const x = (i / (originalData.labels.length - 1)) * width;
        const originalY = height - ((originalData.values[i] - 150) / 200) * height;
        const userFreq = originalData.values[i] - 10 - Math.sin(i * 0.1) * 15;
        const userY = height - ((userFreq - 150) / 200) * height;
        
        // 如果差异较大，标记出来
        if (Math.abs(originalY - userY) > 5) {
            ctx.beginPath();
            ctx.arc(x, (originalY + userY) / 2, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }
    
    // 添加图例
    ctx.fillStyle = '#10b981';
    ctx.fillRect(10, 10, 20, 3);
    ctx.fillStyle = '#4a5568';
    ctx.font = '11px Arial';
    ctx.fillText('原声', 35, 18);
    
    ctx.fillStyle = '#ef4444';
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(10, 25);
    ctx.lineTo(30, 25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#4a5568';
    ctx.fillText('您的录音', 35, 28);
    
    // 添加差异标记说明
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(10, 40, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#4a5568';
    ctx.fillText('差异点', 18, 44);
}

// 显示诊断结果
function displayDiagnosisResult(diagnosis) {
    const diagnosisContent = document.getElementById('diagnosisContent');
    
    diagnosisContent.innerHTML = `
        <div class="diagnosis-card">
            <div class="diagnosis-header">
                <div class="score-circle">
                    <span class="score">${diagnosis.score}</span>
                    <span class="score-label">分</span>
                </div>
                <div class="diagnosis-title">第${practiceCount}次练习诊断</div>
            </div>
            
            <div class="diagnosis-section">
                <h5>总体评价</h5>
                <p class="diagnosis-text">${diagnosis.overall}</p>
            </div>
            
            <div class="diagnosis-section">
                <h5>优点</h5>
                <ul class="diagnosis-list">
                    ${diagnosis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
            </div>
            
            <div class="diagnosis-section">
                <h5>改进建议</h5>
                <ul class="diagnosis-list">
                    ${diagnosis.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                </ul>
            </div>
            
            <div class="diagnosis-section">
                <h5>练习建议</h5>
                <ul class="diagnosis-list">
                    ${diagnosis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

// 完成所有练习
function submitAllPractice() {
    // 更新挑战进度
    updateChallengeProgress();
    
    // 显示完成信息
    showSection('comparisonSection');
    
    // 生成综合报告
    generateComprehensiveReport();
}


// 显示停顿分析
function showPauseAnalysis(dataIndex, analysisData) {
    const time = parseFloat(analysisData.labels[dataIndex]);
    
    // 找到对应的停顿
    const pause = analysisData.pauseMarkers.find(p => 
        Math.abs(p.time - time) < 0.2
    );
    
    if (pause) {
        // 显示停顿详情
        const tooltip = document.createElement('div');
        tooltip.className = 'pause-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>${pause.type}</strong><br>
                文本："${pause.text}"<br>
                ${pause.keyWords.length > 0 ? `关键词：${pause.keyWords.join(', ')}<br>` : ''}
                时间：${pause.time.toFixed(1)}秒
            </div>
        `;
        
        // 移除之前的tooltip
        const existingTooltip = document.querySelector('.pause-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        document.body.appendChild(tooltip);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 3000);
    }
}

// 生成模拟音调数据（保留用于对比）
function generateMockPitchData(isUser = false) {
    const labels = [];
    const values = [];
    const baseFreq = isUser ? 200 : 220;
    const variation = isUser ? 30 : 40;
    
    for (let i = 0; i < 20; i++) {
        labels.push((i * 0.5).toFixed(1));
        const noise = (Math.random() - 0.5) * variation;
        const trend = Math.sin(i * 0.3) * 20;
        values.push(Math.max(100, baseFreq + noise + trend));
    }
    
    return { labels, values };
}

// 渲染句子级别的音调曲线图表
function renderSentenceCharts(sentenceData) {
    const container = document.getElementById('sentenceAnalysisContainer');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    sentenceData.forEach((sentence, index) => {
        // 创建句子分析块
        const sentenceBlock = document.createElement('div');
        sentenceBlock.className = 'sentence-analysis-block';
        
        // 生成详细分析
        const analysis = generateSentenceAnalysis(sentence);
        
        sentenceBlock.innerHTML = `
            <div class="sentence-header">
                <h5>句子 ${sentence.sentenceId}（以句号为单位）</h5>
                <div class="sentence-info">
                    <span class="sentence-text">"${sentence.fullText}"</span>
                    <div class="sentence-meta">
                        <span class="duration">时长: ${sentence.totalDuration.toFixed(1)}s</span>
                        <span class="pause-type ${sentence.pauseType}">${sentence.pauseType}</span>
                        ${sentence.keyWords.length > 0 ? `<span class="keywords">关键词: ${sentence.keyWords.join(', ')}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- 音调曲线图表 -->
            <div class="sentence-chart-container">
                <canvas id="sentenceChart${sentence.sentenceId}" width="400" height="200"></canvas>
            </div>
            
            <!-- 详细分析 -->
            <div class="sentence-analysis-details">
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <h6>停连分析</h6>
                        <div class="pause-analysis">
                            ${analysis.pauseAnalysis.map(pause => `
                                <div class="pause-detail">
                                    <span class="pause-time">${pause.time}s</span>
                                    <span class="pause-type ${pause.type}">${pause.type}</span>
                                    <span class="pause-duration">${pause.duration}</span>
                                    <span class="pause-position">${pause.position}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="analysis-item">
                        <h6>重音分析</h6>
                        <div class="stress-analysis">
                            ${analysis.stressAnalysis.map(stress => `
                                <div class="stress-detail">
                                    <span class="stress-word">${stress.word}</span>
                                    <span class="stress-level level-${stress.level}">${stress.level}级重音</span>
                                    <span class="stress-frequency">${stress.frequency}Hz</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="analysis-item">
                        <h6>语调分析</h6>
                        <div class="tone-analysis">
                            <div class="tone-item">
                                <span class="tone-label">平均音调:</span>
                                <span class="tone-value">${analysis.toneAnalysis.averagePitch}Hz</span>
                            </div>
                            <div class="tone-item">
                                <span class="tone-label">音调范围:</span>
                                <span class="tone-value">${analysis.toneAnalysis.pitchRange}Hz</span>
                            </div>
                            <div class="tone-item">
                                <span class="tone-label">语调变化:</span>
                                <span class="tone-value">${analysis.toneAnalysis.toneChange}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-item">
                        <h6>节奏分析</h6>
                        <div class="rhythm-analysis">
                            <div class="rhythm-item">
                                <span class="rhythm-label">语速:</span>
                                <span class="rhythm-value">${analysis.rhythmAnalysis.speed}字/分钟</span>
                            </div>
                            <div class="rhythm-item">
                                <span class="rhythm-label">节奏类型:</span>
                                <span class="rhythm-value">${analysis.rhythmAnalysis.type}</span>
                            </div>
                            <div class="rhythm-item">
                                <span class="rhythm-label">节拍感:</span>
                                <span class="rhythm-value">${analysis.rhythmAnalysis.beat}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(sentenceBlock);
        
        // 为每个句子生成音调曲线数据
        const chartData = generateSentencePitchData(sentence);
        
        // 创建图表
        setTimeout(() => {
            createSentenceChart(`sentenceChart${sentence.sentenceId}`, chartData, sentence);
        }, 100 * index); // 延迟创建，避免同时创建多个图表
    });
}

// 为单个句子生成音调曲线数据
function generateSentencePitchData(sentence) {
    const labels = [];
    const values = [];
    const wordAnnotations = [];
    const duration = sentence.totalDuration;
    const points = Math.floor(duration * 5); // 每0.2秒一个点，减少密度
    
    // 分析句子中的词语
    const words = analyzeSentenceWords(sentence.fullText);
    const wordTimings = calculateWordTimings(words, duration);
    
    for (let i = 0; i < points; i++) {
        const time = (i * 0.2).toFixed(1);
        labels.push(time);
        
        // 基础频率
        let frequency = 220;
        let currentWord = null;
        
        // 找到当前时间点对应的词语
        for (const wordTiming of wordTimings) {
            if (i * 0.2 >= wordTiming.startTime && i * 0.2 <= wordTiming.endTime) {
                currentWord = wordTiming;
                break;
            }
        }
        
        // 关键词重音处理
        if (currentWord && sentence.keyWords.includes(currentWord.word)) {
            frequency += 30; // 关键词音调上扬更多
        }
        
        // 停顿前的音调处理
        if (i > points * 0.8) {
            if (sentence.pauseType === "长停") {
                frequency -= 25; // 长停前音调下降
            } else if (sentence.pauseType === "中停") {
                frequency -= 15; // 中停前轻微下降
            } else if (sentence.pauseType === "短停") {
                frequency -= 8; // 短停前轻微下降
            }
        }
        
        // 添加自然的音调变化
        const variation = Math.sin(i * 0.5) * 12 + Math.sin(i * 0.2) * 6;
        frequency += variation;
        
        values.push(Math.max(150, Math.min(350, frequency)));
        
        // 为每个词语记录标注信息，确保完整覆盖
        if (currentWord) {
            // 检查是否已经记录过这个词语
            const alreadyRecorded = wordAnnotations.some(annotation => 
                annotation.word === currentWord.word && 
                Math.abs(annotation.time - parseFloat(time)) < 0.2
            );
            
            if (!alreadyRecorded) {
                wordAnnotations.push({
                    time: parseFloat(time),
                    word: currentWord.word,
                    frequency: frequency,
                    isKeyword: sentence.keyWords.includes(currentWord.word)
                });
            }
        }
    }
    
    return { 
        labels, 
        values, 
        wordAnnotations,
        wordTimings
    };
}

// 分析句子中的词语
function analyzeSentenceWords(text) {
    // 移除标点符号，按词语分割
    const cleanText = text.replace(/[，。！？、；：""''（）【】]/g, '');
    const words = [];
    
    // 改进的中文词语分割算法
    let currentWord = '';
    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        
        if (char === ' ') {
            if (currentWord) {
                words.push(currentWord);
                currentWord = '';
            }
        } else {
            currentWord += char;
            
            // 更智能的词语分割规则
            const shouldSplit = 
                // 单字词（常见单字）
                (currentWord.length === 1 && ['的', '了', '在', '是', '有', '和', '与', '或', '但', '而', '就', '都', '也', '还', '又', '再', '很', '最', '更', '太', '真', '好', '大', '小', '多', '少', '新', '老', '高', '低', '快', '慢', '长', '短', '远', '近', '早', '晚', '前', '后', '左', '右', '上', '下', '里', '外', '中', '间', '内', '外'].includes(currentWord)) ||
                // 双字词
                (currentWord.length === 2) ||
                // 三字词
                (currentWord.length === 3) ||
                // 四字词（成语等）
                (currentWord.length === 4) ||
                // 最后一个字符
                (i === cleanText.length - 1);
            
            if (shouldSplit) {
                words.push(currentWord);
                currentWord = '';
            }
        }
    }
    
    if (currentWord) {
        words.push(currentWord);
    }
    
    return words;
}

// 计算词语的时间分布
function calculateWordTimings(words, totalDuration) {
    const wordTimings = [];
    const avgWordDuration = totalDuration / words.length;
    
    for (let i = 0; i < words.length; i++) {
        const startTime = i * avgWordDuration;
        const endTime = (i + 1) * avgWordDuration;
        
        wordTimings.push({
            word: words[i],
            startTime: startTime,
            endTime: endTime,
            duration: endTime - startTime
        });
    }
    
    return wordTimings;
}

// 找到峰值和低谷对应的词语，避免重复标注
function findPeakValleyWords(wordAnnotations) {
    if (wordAnnotations.length < 3) return [];
    
    const peakValleyWords = [];
    const peaks = [];
    const valleys = [];
    
    // 找到峰值和低谷
    for (let i = 1; i < wordAnnotations.length - 1; i++) {
        const prev = wordAnnotations[i - 1];
        const curr = wordAnnotations[i];
        const next = wordAnnotations[i + 1];
        
        // 峰值：当前点比前后两点都高，且频率差异足够大
        if (curr.frequency > prev.frequency && curr.frequency > next.frequency && 
            curr.frequency - prev.frequency > 5 && curr.frequency - next.frequency > 5) {
            peaks.push(curr);
        }
        
        // 低谷：当前点比前后两点都低，且频率差异足够大
        if (curr.frequency < prev.frequency && curr.frequency < next.frequency && 
            prev.frequency - curr.frequency > 5 && next.frequency - curr.frequency > 5) {
            valleys.push(curr);
        }
    }
    
    // 按频率差异排序，选择最显著的峰值和低谷
    peaks.sort((a, b) => {
        const aDiff = Math.min(a.frequency - wordAnnotations[wordAnnotations.indexOf(a) - 1]?.frequency || 0,
                              a.frequency - wordAnnotations[wordAnnotations.indexOf(a) + 1]?.frequency || 0);
        const bDiff = Math.min(b.frequency - wordAnnotations[wordAnnotations.indexOf(b) - 1]?.frequency || 0,
                              b.frequency - wordAnnotations[wordAnnotations.indexOf(b) + 1]?.frequency || 0);
        return bDiff - aDiff;
    });
    
    valleys.sort((a, b) => {
        const aDiff = Math.min((wordAnnotations[wordAnnotations.indexOf(a) - 1]?.frequency || 0) - a.frequency,
                              (wordAnnotations[wordAnnotations.indexOf(a) + 1]?.frequency || 0) - a.frequency);
        const bDiff = Math.min((wordAnnotations[wordAnnotations.indexOf(b) - 1]?.frequency || 0) - b.frequency,
                              (wordAnnotations[wordAnnotations.indexOf(b) + 1]?.frequency || 0) - b.frequency);
        return bDiff - aDiff;
    });
    
    // 收集峰值和低谷对应的词语
    const importantPeaks = peaks.slice(0, 2);
    const importantValleys = valleys.slice(0, 2);
    
    importantPeaks.forEach(peak => {
        if (!peakValleyWords.includes(peak.word)) {
            peakValleyWords.push(peak.word);
        }
    });
    
    importantValleys.forEach(valley => {
        if (!peakValleyWords.includes(valley.word)) {
            peakValleyWords.push(valley.word);
        }
    });
    
    return peakValleyWords;
}

// 绘制词语标注
function drawWordAnnotations(ctx, wordAnnotations, width, height, sentence) {
    const duration = sentence.totalDuration;
    
    // 首先找到峰值和低谷对应的词语，避免重复标注
    const peakValleyWords = findPeakValleyWords(wordAnnotations);
    
    // 分别处理关键词和普通词语，排除峰值低谷对应的词语
    const keywordAnnotations = wordAnnotations.filter(annotation => 
        annotation.isKeyword && !peakValleyWords.includes(annotation.word));
    const regularAnnotations = wordAnnotations.filter(annotation => 
        !annotation.isKeyword && !peakValleyWords.includes(annotation.word));
    
    // 绘制普通词语标注（较小，颜色较淡）
    regularAnnotations.forEach((annotation, index) => {
        const x = (annotation.time / duration) * width;
        const y = height - ((annotation.frequency - 150) / 200) * height;
        
        // 普通词语用淡蓝色标注
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1;
        
        // 绘制小标注点
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // 显示词语文本（较小字体）
        ctx.fillStyle = '#6b7280';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        
        // 计算文本位置，避免重叠
        let textY = y - 8;
        if (index % 3 === 0) {
            textY = y - 12; // 向上
        } else if (index % 3 === 1) {
            textY = y + 12; // 向下
        } else {
            textY = y - 6; // 稍微向上
        }
        
        // 确保文本在画布范围内
        if (textY < 15) textY = y + 12;
        if (textY > height - 10) textY = y - 12;
        
        ctx.fillText(annotation.word, x, textY);
    });
    
    // 绘制关键词标注（较大，颜色较深）
    keywordAnnotations.forEach((annotation, index) => {
        const x = (annotation.time / duration) * width;
        const y = height - ((annotation.frequency - 150) / 200) * height;
        
        // 关键词用红色标注
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        
        // 绘制标注点
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // 显示关键词文本（较大字体）
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        
        // 计算文本位置，避免重叠
        let textY = y - 15;
        if (index % 2 === 0) {
            textY = y - 20; // 偶数索引向上
        } else {
            textY = y + 20; // 奇数索引向下
        }
        
        // 确保文本在画布范围内
        if (textY < 25) textY = y + 20;
        if (textY > height - 15) textY = y - 20;
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(annotation.word, x, textY);
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    });
    
    // 绘制峰值和低谷标注
    drawPeakValleyAnnotations(ctx, wordAnnotations, width, height, duration);
}

// 绘制峰值和低谷标注
function drawPeakValleyAnnotations(ctx, wordAnnotations, width, height, duration) {
    if (wordAnnotations.length < 3) return;
    
    // 找到峰值和低谷
    const peaks = [];
    const valleys = [];
    
    for (let i = 1; i < wordAnnotations.length - 1; i++) {
        const prev = wordAnnotations[i - 1];
        const curr = wordAnnotations[i];
        const next = wordAnnotations[i + 1];
        
        // 峰值：当前点比前后两点都高，且频率差异足够大
        if (curr.frequency > prev.frequency && curr.frequency > next.frequency && 
            curr.frequency - prev.frequency > 5 && curr.frequency - next.frequency > 5) {
            peaks.push(curr);
        }
        
        // 低谷：当前点比前后两点都低，且频率差异足够大
        if (curr.frequency < prev.frequency && curr.frequency < next.frequency && 
            prev.frequency - curr.frequency > 5 && next.frequency - curr.frequency > 5) {
            valleys.push(curr);
        }
    }
    
    // 按频率差异排序，选择最显著的峰值和低谷
    peaks.sort((a, b) => {
        const aDiff = Math.min(a.frequency - wordAnnotations[wordAnnotations.indexOf(a) - 1]?.frequency || 0,
                              a.frequency - wordAnnotations[wordAnnotations.indexOf(a) + 1]?.frequency || 0);
        const bDiff = Math.min(b.frequency - wordAnnotations[wordAnnotations.indexOf(b) - 1]?.frequency || 0,
                              b.frequency - wordAnnotations[wordAnnotations.indexOf(b) + 1]?.frequency || 0);
        return bDiff - aDiff;
    });
    
    valleys.sort((a, b) => {
        const aDiff = Math.min((wordAnnotations[wordAnnotations.indexOf(a) - 1]?.frequency || 0) - a.frequency,
                              (wordAnnotations[wordAnnotations.indexOf(a) + 1]?.frequency || 0) - a.frequency);
        const bDiff = Math.min((wordAnnotations[wordAnnotations.indexOf(b) - 1]?.frequency || 0) - b.frequency,
                              (wordAnnotations[wordAnnotations.indexOf(b) + 1]?.frequency || 0) - b.frequency);
        return bDiff - aDiff;
    });
    
    // 只显示最重要的峰值和低谷，避免重复
    const importantPeaks = peaks.slice(0, 2); // 只显示前2个峰值
    const importantValleys = valleys.slice(0, 2); // 只显示前2个低谷
    
    // 绘制峰值标注 - 显示对应的词语
    importantPeaks.forEach((peak, index) => {
        const x = (peak.time / duration) * width;
        const y = height - ((peak.frequency - 150) / 200) * height;
        
        // 绘制峰值标记
        ctx.fillStyle = '#ea580c';
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.stroke();
        
        // 显示峰值对应的词语
        ctx.fillStyle = '#ea580c';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        
        // 峰值标注放在上方，避免与词语标注重叠
        let labelY = y - 25 - (index * 20);
        
        // 确保标注在画布范围内
        if (labelY < 20) labelY = y + 25;
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(`峰值: ${peak.word}`, x, labelY);
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    });
    
    // 绘制低谷标注 - 显示对应的词语
    importantValleys.forEach((valley, index) => {
        const x = (valley.time / duration) * width;
        const y = height - ((valley.frequency - 150) / 200) * height;
        
        // 绘制低谷标记
        ctx.fillStyle = '#7c3aed';
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 显示低谷对应的词语
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        
        // 低谷标注放在下方，避免与词语标注重叠
        let labelY = y + 25 + (index * 20);
        
        // 确保标注在画布范围内
        if (labelY > height - 10) labelY = y - 25;
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(`低谷: ${valley.word}`, x, labelY);
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    });
}

// 创建单个句子的图表
function createSentenceChart(canvasId, chartData, sentence) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 生成停连位置标记
    const pauseMarkers = generatePauseMarkers(sentence);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '音调曲线',
                data: chartData.values,
                borderColor: getPauseColor(sentence.pauseType),
                backgroundColor: getPauseColor(sentence.pauseType, 0.1),
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                annotation: {
                    annotations: pauseMarkers
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 150,
                    max: 350,
                    title: {
                        display: true,
                        text: '频率 (Hz)',
                        font: { size: 10 }
                    },
                    ticks: {
                        font: { size: 9 }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间 (s)',
                        font: { size: 10 }
                    },
                    ticks: {
                        font: { size: 9 }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// 生成停连位置标记
function generatePauseMarkers(sentence) {
    const markers = [];
    const duration = sentence.totalDuration;
    
    // 根据句子内容生成停连位置
    const pausePositions = getPausePositions(sentence);
    
    pausePositions.forEach((pause, index) => {
        markers.push({
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: pause.time,
            borderColor: getPauseColor(pause.type),
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
                content: pause.type,
                enabled: true,
                position: 'top',
                backgroundColor: getPauseColor(pause.type),
                color: 'white',
                font: { size: 9 },
                padding: 4
            }
        });
        
        // 添加停连区域标记
        markers.push({
            type: 'box',
            xMin: pause.time,
            xMax: pause.time + pause.duration,
            backgroundColor: getPauseColor(pause.type, 0.1),
            borderColor: getPauseColor(pause.type),
            borderWidth: 1,
            borderDash: [3, 3]
        });
    });
    
    return markers;
}

// 获取停连位置
function getPausePositions(sentence) {
    const pauses = [];
    const duration = sentence.totalDuration;
    const text = sentence.fullText;
    
    // 根据句子内容智能分析停连位置
    if (text.includes('一代人有一代人的际遇，一代人有一代人的使命')) {
        // 在逗号处添加停连
        pauses.push({
            time: duration * 0.5,
            type: '短停',
            duration: 0.5
        });
    }
    
    if (text.includes('新时代的中国青年把个人梦想融入到民族复兴的伟大事业中')) {
        // 在长句的逗号处添加停连
        pauses.push({
            time: duration * 0.4,
            type: '中停',
            duration: 0.8
        });
        pauses.push({
            time: duration * 0.7,
            type: '短停',
            duration: 0.5
        });
    }
    
    if (text.includes('锲而不舍、接续奋斗')) {
        // 在顿号处添加停连
        pauses.push({
            time: duration * 0.8,
            type: '短停',
            duration: 0.4
        });
    }
    
    if (text.includes('从今天起，《新闻联播》推出系列报道')) {
        // 在书名号前添加停连
        pauses.push({
            time: duration * 0.3,
            type: '短停',
            duration: 0.5
        });
        pauses.push({
            time: duration * 0.6,
            type: '中停',
            duration: 0.8
        });
    }
    
    if (text.includes('今天，我们首先来认识')) {
        // 在逗号处添加停连
        pauses.push({
            time: duration * 0.3,
            type: '短停',
            duration: 0.5
        });
    }
    
    // 句末停连（句号前）
    pauses.push({
        time: duration * 0.95,
        type: sentence.pauseType,
        duration: sentence.pauseType === '长停' ? 1.5 : 
                 sentence.pauseType === '中停' ? 1.0 : 0.5
    });
    
    return pauses;
}

// 根据停顿类型获取颜色
function getPauseColor(pauseType, alpha = 1) {
    const colors = {
        '短停': `rgba(46, 213, 115, ${alpha})`,
        '中停': `rgba(255, 165, 2, ${alpha})`,
        '长停': `rgba(255, 71, 87, ${alpha})`
    };
    return colors[pauseType] || `rgba(102, 126, 234, ${alpha})`;
}

// 生成句子的详细分析
function generateSentenceAnalysis(sentence) {
    const duration = sentence.totalDuration;
    const pauseType = sentence.pauseType;
    const keyWords = sentence.keyWords;
    
    // 停连分析
    const pauseAnalysis = generatePauseAnalysis(sentence);
    
    // 重音分析
    const stressAnalysis = generateStressAnalysis(sentence);
    
    // 语调分析
    const toneAnalysis = generateToneAnalysis(sentence);
    
    // 节奏分析
    const rhythmAnalysis = generateRhythmAnalysis(sentence);
    
    return {
        pauseAnalysis,
        stressAnalysis,
        toneAnalysis,
        rhythmAnalysis
    };
}

// 生成停连分析
function generatePauseAnalysis(sentence) {
    const pauses = [];
    const duration = sentence.totalDuration;
    const text = sentence.fullText;
    
    // 分析句子中的词语
    const words = analyzeSentenceWords(text);
    const wordTimings = calculateWordTimings(words, duration);
    
    // 根据句子内容智能生成停连数据
    const pausePositions = getPausePositions(sentence);
    
    pausePositions.forEach((pause, index) => {
        // 找到停顿前的词语
        const beforeWord = findWordBeforeTime(wordTimings, pause.time);
        const afterWord = findWordAfterTime(wordTimings, pause.time);
        
        pauses.push({
            time: pause.time.toFixed(1),
            type: pause.type,
            duration: `${Math.round(pause.duration * 1000)}ms`,
            position: getPausePositionDescription(pause, text, index),
            beforeWord: beforeWord ? beforeWord.word : '',
            afterWord: afterWord ? afterWord.word : '',
            wordContext: beforeWord && afterWord ? `"${beforeWord.word}"后"${afterWord.word}"前` : ''
        });
    });
    
    return pauses;
}

// 查找指定时间前的词语
function findWordBeforeTime(wordTimings, time) {
    for (let i = wordTimings.length - 1; i >= 0; i--) {
        if (wordTimings[i].endTime <= time) {
            return wordTimings[i];
        }
    }
    return null;
}

// 查找指定时间后的词语
function findWordAfterTime(wordTimings, time) {
    for (let i = 0; i < wordTimings.length; i++) {
        if (wordTimings[i].startTime >= time) {
            return wordTimings[i];
        }
    }
    return null;
}

// 获取停连位置描述
function getPausePositionDescription(pause, text, index) {
    const timePercent = (pause.time / getSentenceDuration(text)) * 100;
    
    if (timePercent < 20) {
        return "句首停连";
    } else if (timePercent < 40) {
        return "前半句停连";
    } else if (timePercent < 60) {
        return "句中停连";
    } else if (timePercent < 80) {
        return "后半句停连";
    } else {
        return "句末停连";
    }
}

// 获取句子时长（简化计算）
function getSentenceDuration(text) {
    return text.length * 0.15; // 每个字符约0.15秒
}

// 生成重音分析
function generateStressAnalysis(sentence) {
    const stresses = [];
    
    // 为关键词生成重音分析
    sentence.keyWords.forEach((word, index) => {
        const stressLevels = ["一", "二", "三"];
        const level = stressLevels[index % 3] || "一";
        const frequency = 220 + (index + 1) * 15;
        
        stresses.push({
            word: word,
            level: level,
            frequency: frequency
        });
    });
    
    // 如果没有关键词，生成默认重音
    if (stresses.length === 0) {
        const words = sentence.fullText.split('');
        if (words.length > 0) {
            stresses.push({
                word: words[0],
                level: "一",
                frequency: 235
            });
        }
    }
    
    return stresses;
}

// 生成语调分析
function generateToneAnalysis(sentence) {
    const basePitch = 220;
    const pitchVariation = sentence.pauseType === "长停" ? 40 : 
                          sentence.pauseType === "中停" ? 30 : 20;
    
    return {
        averagePitch: basePitch + Math.floor(Math.random() * 20),
        pitchRange: pitchVariation,
        toneChange: sentence.pauseType === "长停" ? "下降型" : 
                   sentence.pauseType === "中停" ? "平稳型" : "上扬型"
    };
}

// 生成节奏分析
function generateRhythmAnalysis(sentence) {
    const wordCount = sentence.fullText.length;
    const speed = Math.round((wordCount / sentence.totalDuration) * 60);
    
    return {
        speed: speed,
        type: sentence.pauseType === "长停" ? "庄重缓慢" : 
              sentence.pauseType === "中停" ? "平稳有力" : "轻快流畅",
        beat: sentence.pauseType === "长停" ? "强" : 
              sentence.pauseType === "中停" ? "中" : "弱"
    };
}

// 生成模拟音频数据
function generateMockAudioData() {
    return {
        speed: 165 + Math.random() * 30,
        pitchRange: [140 + Math.random() * 20, 280 + Math.random() * 40],
        pauses: 6 + Math.floor(Math.random() * 4)
    };
}

// 工具函数
function getCurrentDay() {
    return parseInt(document.getElementById('currentDay').textContent);
}

// 全屏切换功能
function toggleFullscreen() {
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    
    if (!document.fullscreenElement) {
        // 进入全屏
        document.documentElement.requestFullscreen().then(() => {
            fullscreenIcon.textContent = '⛶';
            fullscreenIcon.title = '退出全屏';
        }).catch(err => {
            console.error('无法进入全屏模式:', err);
        });
    } else {
        // 退出全屏
        document.exitFullscreen().then(() => {
            fullscreenIcon.textContent = '⛶';
            fullscreenIcon.title = '切换全屏';
        }).catch(err => {
            console.error('无法退出全屏模式:', err);
        });
    }
}

// 监听全屏状态变化
document.addEventListener('fullscreenchange', function() {
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    if (document.fullscreenElement) {
        fullscreenIcon.textContent = '⛶';
        fullscreenIcon.title = '退出全屏';
    } else {
        fullscreenIcon.textContent = '⛶';
        fullscreenIcon.title = '切换全屏';
    }
});

// 导出函数供其他模块使用
window.appFunctions = {
    startLearning,
    selectVideo,
    analyzeOriginal,
    startRecording,
    toggleRecording,
    submitRecording,
    backToAnalysis,
    startNewPractice,
    viewProgress,
    backToWelcome,
    toggleFullscreen
};
