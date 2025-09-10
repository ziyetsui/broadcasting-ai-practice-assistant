// B站开放平台集成模块
class BilibiliIntegration {
    constructor() {
        this.appKey = 'YOUR_BILIBILI_APP_KEY'; // 需要申请B站开放平台应用
        this.appSecret = 'YOUR_BILIBILI_APP_SECRET';
        this.baseUrl = 'https://api.bilibili.com';
        this.accessToken = null;
    }

    // 初始化B站集成
    async initialize() {
        try {
            // 检查是否已有访问令牌
            const storedToken = localStorage.getItem('bilibili_access_token');
            if (storedToken) {
                this.accessToken = storedToken;
                return true;
            }
            
            // 如果没有令牌，引导用户授权
            this.showAuthorizationPrompt();
            return false;
        } catch (error) {
            console.error('B站集成初始化失败:', error);
            return false;
        }
    }

    // 显示授权提示
    showAuthorizationPrompt() {
        const authModal = document.createElement('div');
        authModal.className = 'auth-modal';
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <h3>B站授权</h3>
                <p>为了获取更好的视频分析体验，需要授权访问B站视频数据。</p>
                <button onclick="bilibiliIntegration.authorize()" class="auth-btn">授权登录</button>
                <button onclick="this.parentElement.parentElement.remove()" class="cancel-btn">稍后再说</button>
            </div>
        `;
        
        document.body.appendChild(authModal);
    }

    // 用户授权
    authorize() {
        const authUrl = `https://passport.bilibili.com/oauth/authorize?client_id=${this.appKey}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin)}`;
        window.open(authUrl, '_blank');
    }

    // 处理授权回调
    handleAuthCallback(code) {
        // 这里应该调用后端API交换访问令牌
        // 由于是前端演示，我们使用模拟令牌
        this.accessToken = 'mock_access_token_' + Date.now();
        localStorage.setItem('bilibili_access_token', this.accessToken);
        
        // 移除授权模态框
        const authModal = document.querySelector('.auth-modal');
        if (authModal) {
            authModal.remove();
        }
        
        return true;
    }

    // 获取视频信息
    async getVideoInfo(bvid) {
        try {
            const response = await fetch(`${this.baseUrl}/x/web-interface/view?bvid=${bvid}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 0) {
                return {
                    title: data.data.title,
                    desc: data.data.desc,
                    duration: data.data.duration,
                    cid: data.data.cid,
                    owner: data.data.owner,
                    pubdate: data.data.pubdate,
                    stat: data.data.stat
                };
            } else {
                throw new Error(data.message || '获取视频信息失败');
            }
        } catch (error) {
            console.error('获取视频信息失败:', error);
            return null;
        }
    }

    // 获取视频音频流URL
    async getVideoAudioUrl(bvid, cid) {
        try {
            const response = await fetch(`${this.baseUrl}/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=16&fnval=16`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.bilibili.com/'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 0 && data.data.dash && data.data.dash.audio) {
                return data.data.dash.audio[0].baseUrl;
            } else {
                throw new Error('无法获取音频流');
            }
        } catch (error) {
            console.error('获取音频流失败:', error);
            return null;
        }
    }

    // 提取视频音频
    async extractVideoAudio(bvid) {
        try {
            // 获取视频信息
            const videoInfo = await this.getVideoInfo(bvid);
            if (!videoInfo) {
                throw new Error('无法获取视频信息');
            }

            // 获取音频流URL
            const audioUrl = await this.getVideoAudioUrl(bvid, videoInfo.cid);
            if (!audioUrl) {
                throw new Error('无法获取音频流');
            }

            // 下载音频数据
            const audioResponse = await fetch(audioUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.bilibili.com/'
                }
            });

            if (!audioResponse.ok) {
                throw new Error('音频下载失败');
            }

            const audioBlob = await audioResponse.blob();
            
            return {
                audioBlob: audioBlob,
                videoInfo: videoInfo,
                duration: videoInfo.duration
            };
        } catch (error) {
            console.error('提取视频音频失败:', error);
            return null;
        }
    }

    // 搜索相关视频
    async searchVideos(keyword, page = 1, pageSize = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}&page=${page}&pagesize=${pageSize}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 0) {
                return data.data.result.map(item => ({
                    bvid: item.bvid,
                    title: item.title,
                    desc: item.description,
                    duration: item.duration,
                    author: item.author,
                    pic: item.pic,
                    play: item.play,
                    danmaku: item.video_review
                }));
            } else {
                throw new Error(data.message || '搜索失败');
            }
        } catch (error) {
            console.error('搜索视频失败:', error);
            return [];
        }
    }

    // 获取热门视频
    async getPopularVideos() {
        try {
            const response = await fetch(`${this.baseUrl}/x/web-interface/popular`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 0) {
                return data.data.list.map(item => ({
                    bvid: item.bvid,
                    title: item.title,
                    desc: item.desc,
                    duration: item.duration,
                    owner: item.owner,
                    pic: item.pic,
                    stat: item.stat
                }));
            } else {
                throw new Error(data.message || '获取热门视频失败');
            }
        } catch (error) {
            console.error('获取热门视频失败:', error);
            return [];
        }
    }

    // 获取新闻类视频
    async getNewsVideos() {
        const newsKeywords = ['新闻联播', '央视新闻', '新闻播报', '时政新闻'];
        const allVideos = [];
        
        for (const keyword of newsKeywords) {
            const videos = await this.searchVideos(keyword, 1, 5);
            allVideos.push(...videos);
        }
        
        // 去重并排序
        const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex(v => v.bvid === video.bvid)
        );
        
        return uniqueVideos.sort((a, b) => b.play - a.play);
    }

    // 创建视频选择器
    async createVideoSelector() {
        const videoSection = document.getElementById('videoSection');
        if (!videoSection) return;

        const videoGrid = videoSection.querySelector('.video-grid');
        if (!videoGrid) return;

        // 清空现有内容
        videoGrid.innerHTML = '';

        try {
            // 获取新闻类视频
            const newsVideos = await this.getNewsVideos();
            
            if (newsVideos.length === 0) {
                // 如果没有找到视频，显示默认视频
                this.showDefaultVideos(videoGrid);
                return;
            }

            // 显示找到的视频
            newsVideos.slice(0, 6).forEach(video => {
                const videoCard = this.createVideoCard(video);
                videoGrid.appendChild(videoCard);
            });

        } catch (error) {
            console.error('创建视频选择器失败:', error);
            this.showDefaultVideos(videoGrid);
        }
    }

    // 显示默认视频
    showDefaultVideos(videoGrid) {
        const defaultVideos = [
            {
                bvid: 'BV1Hv4y1d7kT',
                title: '新闻联播 - 时政要闻',
                desc: '标准新闻播报，适合基础练习',
                pic: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY3ZWVhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mlrDpl7vnpLrkvovvvIzlj6/ku6XlpKfmlrA8L3RleHQ+PC9zdmc+'
            },
            {
                bvid: 'BV1Hv4y1d7kT',
                title: '新闻联播 - 经济报道',
                desc: '专业经济新闻，提升专业度',
                pic: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjZiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mlrDpl7vnpLrkvovvvIzlj6/ku6XlpKfmlrA8L3RleHQ+PC9zdmc+'
            },
            {
                bvid: 'BV1Hv4y1d7kT',
                title: '新闻联播 - 社会新闻',
                desc: '民生新闻播报，增强亲和力',
                pic: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDhiYjc4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mlrDpl7vnpLrkvovvvIzlj6/ku6XlpKfmlrA8L3RleHQ+PC9zdmc+'
            }
        ];

        defaultVideos.forEach(video => {
            const videoCard = this.createVideoCard(video);
            videoGrid.appendChild(videoCard);
        });
    }

    // 创建视频卡片
    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.setAttribute('data-bvid', video.bvid);
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.pic}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
                <div class="play-icon">▶️</div>
                <div class="video-duration">${this.formatDuration(video.duration)}</div>
            </div>
            <h3>${video.title}</h3>
            <p>${video.desc}</p>
            <div class="video-stats">
                <span>👁️ ${this.formatNumber(video.play || 0)}</span>
                <span>💬 ${this.formatNumber(video.danmaku || 0)}</span>
            </div>
            <button class="select-video-btn" onclick="selectBilibiliVideo('${video.bvid}')">选择此视频</button>
        `;
        
        return card;
    }

    // 格式化时长
    formatDuration(seconds) {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 格式化数字
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    }

    // 嵌入B站视频播放器
    embedVideoPlayer(bvid) {
        const iframe = document.getElementById('bilibiliPlayer');
        if (iframe) {
            iframe.src = `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0&page=1&high_quality=1&danmaku=0`;
        }
    }

    // 获取视频字幕
    async getVideoSubtitles(bvid, cid) {
        try {
            const response = await fetch(`${this.baseUrl}/x/player/v2?bvid=${bvid}&cid=${cid}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 0 && data.data.subtitle && data.data.subtitle.subtitles) {
                return data.data.subtitle.subtitles;
            } else {
                return null;
            }
        } catch (error) {
            console.error('获取字幕失败:', error);
            return null;
        }
    }
}

// 全局B站集成实例
let bilibiliIntegration;

// 初始化B站集成
function initializeBilibiliIntegration() {
    bilibiliIntegration = new BilibiliIntegration();
    return bilibiliIntegration.initialize();
}

// 选择B站视频
async function selectBilibiliVideo(bvid) {
    if (!bilibiliIntegration) {
        initializeBilibiliIntegration();
    }
    
    // 嵌入视频播放器
    bilibiliIntegration.embedVideoPlayer(bvid);
    
    // 更新当前视频
    currentVideo = bvid;
    
    // 显示分析界面
    showSection('analysisSection');
    
    // 获取视频信息
    const videoInfo = await bilibiliIntegration.getVideoInfo(bvid);
    if (videoInfo) {
        console.log('视频信息:', videoInfo);
        
        // 更新页面标题
        document.title = `${videoInfo.title} - 私人普通话播音教练`;
    }
}

// 提取视频音频
async function extractBilibiliAudio(bvid) {
    if (!bilibiliIntegration) {
        initializeBilibiliIntegration();
    }
    
    try {
        const result = await bilibiliIntegration.extractVideoAudio(bvid);
        if (result) {
            return result.audioBlob;
        }
    } catch (error) {
        console.error('提取音频失败:', error);
    }
    
    return null;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeBilibiliIntegration().then(initialized => {
        if (initialized) {
            // 创建动态视频选择器
            bilibiliIntegration.createVideoSelector();
        }
    });
});

// 导出函数供其他模块使用
window.bilibiliFunctions = {
    selectBilibiliVideo,
    extractBilibiliAudio,
    initializeBilibiliIntegration
};

