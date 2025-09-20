// 游戏化系统 - 100天挑战和成就管理
class GamificationSystem {
    constructor() {
        this.storageKey = 'BroadcastingAI_Gamification';
        this.data = this.loadData();
        this.achievements = this.initializeAchievements();
        this.challenges = this.initializeChallenges();
        this.listeners = new Set();
        
        this.setupDailyReset();
        this.checkMilestones();
    }

    // 初始化数据
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const defaultData = {
                user: {
                    level: 1,
                    experience: 0,
                    totalPracticeTime: 0,
                    streak: 0,
                    longestStreak: 0,
                    joinDate: Date.now(),
                    lastActiveDate: null,
                    totalSessions: 0,
                    averageScore: 0,
                    bestScore: 0
                },
                progress: {
                    currentDay: 1,
                    totalDays: 100,
                    completedDays: [],
                    currentChallenge: null,
                    challengeHistory: []
                },
                achievements: {
                    unlocked: [],
                    progress: {},
                    notifications: []
                },
                statistics: {
                    practiceByDay: {},
                    scoreHistory: [],
                    improvementTrend: [],
                    weakAreas: [],
                    strongAreas: []
                }
            };
            
            return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
        } catch (error) {
            console.error('游戏化数据加载失败:', error);
            return this.getDefaultData();
        }
    }

    // 保存数据
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            this.notifyListeners('dataSaved', this.data);
        } catch (error) {
            console.error('游戏化数据保存失败:', error);
        }
    }

    // 初始化成就系统
    initializeAchievements() {
        return {
            // 基础成就
            'first_practice': {
                id: 'first_practice',
                name: '初次尝试',
                description: '完成第一次播音练习',
                icon: '🎤',
                type: 'milestone',
                requirement: 1,
                reward: { experience: 50, title: '播音新手' }
            },
            'perfect_score': {
                id: 'perfect_score',
                name: '完美表现',
                description: '获得95分以上的评分',
                icon: '⭐',
                type: 'performance',
                requirement: 95,
                reward: { experience: 200, title: '播音天才' }
            },
            'week_warrior': {
                id: 'week_warrior',
                name: '一周战士',
                description: '连续练习7天',
                icon: '🔥',
                type: 'streak',
                requirement: 7,
                reward: { experience: 300, title: '坚持者' }
            },
            'month_master': {
                id: 'month_master',
                name: '月度大师',
                description: '连续练习30天',
                icon: '👑',
                type: 'streak',
                requirement: 30,
                reward: { experience: 1000, title: '播音大师' }
            },
            'hundred_hero': {
                id: 'hundred_hero',
                name: '百日英雄',
                description: '完成100天挑战',
                icon: '🏆',
                type: 'challenge',
                requirement: 100,
                reward: { experience: 5000, title: '播音英雄' }
            },
            'speed_demon': {
                id: 'speed_demon',
                name: '语速大师',
                description: '语速控制准确率达到95%',
                icon: '⚡',
                type: 'skill',
                requirement: 0.95,
                reward: { experience: 150, title: '节奏大师' }
            },
            'pitch_perfect': {
                id: 'pitch_perfect',
                name: '音调完美',
                description: '音调准确率达到95%',
                icon: '🎵',
                type: 'skill',
                requirement: 0.95,
                reward: { experience: 150, title: '音调大师' }
            },
            'practice_marathon': {
                id: 'practice_marathon',
                name: '练习马拉松',
                description: '单次练习超过60分钟',
                icon: '🏃',
                type: 'endurance',
                requirement: 3600,
                reward: { experience: 250, title: '耐力王' }
            },
            'improvement_star': {
                id: 'improvement_star',
                name: '进步之星',
                description: '评分提升超过20分',
                icon: '📈',
                type: 'improvement',
                requirement: 20,
                reward: { experience: 300, title: '进步之星' }
            },
            'social_butterfly': {
                id: 'social_butterfly',
                name: '分享达人',
                description: '分享练习成果5次',
                icon: '🦋',
                type: 'social',
                requirement: 5,
                reward: { experience: 100, title: '分享达人' }
            }
        };
    }

    // 初始化挑战系统
    initializeChallenges() {
        return {
            daily: {
                'daily_practice': {
                    id: 'daily_practice',
                    name: '每日练习',
                    description: '完成今天的播音练习',
                    type: 'daily',
                    requirement: { sessions: 1 },
                    reward: { experience: 50, streak: 1 },
                    resetTime: 'daily'
                },
                'quality_practice': {
                    id: 'quality_practice',
                    name: '高质量练习',
                    description: '获得80分以上的评分',
                    type: 'daily',
                    requirement: { minScore: 80 },
                    reward: { experience: 100 },
                    resetTime: 'daily'
                }
            },
            weekly: {
                'consistency_master': {
                    id: 'consistency_master',
                    name: '坚持大师',
                    description: '本周每天都练习',
                    type: 'weekly',
                    requirement: { dailyStreak: 7 },
                    reward: { experience: 500, title: '坚持大师' },
                    resetTime: 'weekly'
                },
                'skill_improver': {
                    id: 'skill_improver',
                    name: '技能提升',
                    description: '本周平均分比上周提高5分',
                    type: 'weekly',
                    requirement: { scoreImprovement: 5 },
                    reward: { experience: 300 },
                    resetTime: 'weekly'
                }
            },
            special: {
                'new_year_resolution': {
                    id: 'new_year_resolution',
                    name: '新年决心',
                    description: '在新年期间完成特殊挑战',
                    type: 'special',
                    startDate: new Date(new Date().getFullYear(), 0, 1),
                    endDate: new Date(new Date().getFullYear(), 0, 31),
                    requirement: { sessions: 20 },
                    reward: { experience: 1000, title: '新年决心者' }
                }
            }
        };
    }

    // 记录练习会话
    recordPracticeSession(sessionData) {
        const {
            score = 0,
            duration = 0,
            practiceType = 'general',
            improvements = [],
            weakAreas = [],
            strongAreas = []
        } = sessionData;

        const today = this.getTodayString();
        const now = Date.now();

        // 更新用户数据
        this.data.user.totalSessions++;
        this.data.user.totalPracticeTime += duration;
        this.data.user.lastActiveDate = now;
        this.data.user.bestScore = Math.max(this.data.user.bestScore, score);
        
        // 计算平均分
        const totalScore = this.data.user.averageScore * (this.data.user.totalSessions - 1) + score;
        this.data.user.averageScore = Math.round(totalScore / this.data.user.totalSessions);

        // 更新连击
        this.updateStreak(today);

        // 记录今日练习
        if (!this.data.statistics.practiceByDay[today]) {
            this.data.statistics.practiceByDay[today] = {
                sessions: 0,
                totalDuration: 0,
                scores: [],
                averageScore: 0
            };
        }

        const dayData = this.data.statistics.practiceByDay[today];
        dayData.sessions++;
        dayData.totalDuration += duration;
        dayData.scores.push(score);
        dayData.averageScore = Math.round(dayData.scores.reduce((sum, s) => sum + s, 0) / dayData.scores.length);

        // 记录分数历史
        this.data.statistics.scoreHistory.push({
            date: now,
            score: score,
            type: practiceType
        });

        // 更新技能分析
        this.updateSkillAnalysis(improvements, weakAreas, strongAreas);

        // 检查成就和挑战
        this.checkAchievements(sessionData);
        this.checkChallenges(sessionData);

        // 更新经验值和等级
        this.addExperience(this.calculateSessionExperience(sessionData));

        // 更新进度
        this.updateProgress();

        this.saveData();
        this.notifyListeners('sessionRecorded', sessionData);
    }

    // 更新连击
    updateStreak(today) {
        const yesterday = this.getYesterdayString();
        const lastActiveDay = this.data.user.lastActiveDate ? 
            new Date(this.data.user.lastActiveDate).toDateString() : null;

        if (lastActiveDay === yesterday || lastActiveDay === today) {
            // 连续练习
            if (lastActiveDay === yesterday) {
                this.data.user.streak++;
                this.data.user.longestStreak = Math.max(this.data.user.longestStreak, this.data.user.streak);
            }
        } else if (lastActiveDay !== today) {
            // 断连了
            this.data.user.streak = 1;
        }
    }

    // 计算会话经验值
    calculateSessionExperience(sessionData) {
        let experience = 50; // 基础经验

        // 分数奖励
        if (sessionData.score >= 95) experience += 100;
        else if (sessionData.score >= 85) experience += 50;
        else if (sessionData.score >= 75) experience += 25;

        // 时长奖励
        if (sessionData.duration > 1800) experience += 50; // 30分钟+
        else if (sessionData.duration > 900) experience += 25; // 15分钟+

        // 连击奖励
        experience += Math.min(this.data.user.streak * 5, 100);

        return experience;
    }

    // 添加经验值
    addExperience(amount) {
        const oldLevel = this.data.user.level;
        this.data.user.experience += amount;
        
        // 计算新等级
        const newLevel = this.calculateLevel(this.data.user.experience);
        
        if (newLevel > oldLevel) {
            this.data.user.level = newLevel;
            this.notifyListeners('levelUp', { 
                oldLevel, 
                newLevel, 
                experience: this.data.user.experience 
            });
            
            // 升级奖励
            this.unlockAchievement('level_up_' + newLevel);
        }
    }

    // 计算等级
    calculateLevel(experience) {
        // 等级公式：每级所需经验递增
        let level = 1;
        let requiredExp = 100;
        let totalExp = 0;
        
        while (experience >= totalExp + requiredExp) {
            totalExp += requiredExp;
            level++;
            requiredExp = Math.floor(requiredExp * 1.2); // 每级增加20%
        }
        
        return level;
    }

    // 获取下一级所需经验
    getExperienceToNextLevel() {
        const currentExp = this.data.user.experience;
        let level = 1;
        let requiredExp = 100;
        let totalExp = 0;
        
        while (currentExp >= totalExp + requiredExp) {
            totalExp += requiredExp;
            level++;
            requiredExp = Math.floor(requiredExp * 1.2);
        }
        
        return {
            currentLevel: level,
            currentLevelExp: currentExp - totalExp,
            nextLevelExp: requiredExp,
            progress: (currentExp - totalExp) / requiredExp
        };
    }

    // 检查成就
    checkAchievements(sessionData) {
        Object.values(this.achievements).forEach(achievement => {
            if (this.data.achievements.unlocked.includes(achievement.id)) {
                return; // 已解锁
            }

            let shouldUnlock = false;

            switch (achievement.type) {
                case 'milestone':
                    if (achievement.id === 'first_practice' && this.data.user.totalSessions >= 1) {
                        shouldUnlock = true;
                    }
                    break;

                case 'performance':
                    if (achievement.id === 'perfect_score' && sessionData.score >= achievement.requirement) {
                        shouldUnlock = true;
                    }
                    break;

                case 'streak':
                    if (this.data.user.streak >= achievement.requirement) {
                        shouldUnlock = true;
                    }
                    break;

                case 'challenge':
                    if (achievement.id === 'hundred_hero' && this.data.progress.completedDays.length >= 100) {
                        shouldUnlock = true;
                    }
                    break;

                case 'endurance':
                    if (sessionData.duration >= achievement.requirement) {
                        shouldUnlock = true;
                    }
                    break;

                case 'improvement':
                    if (this.hasImprovedBy(achievement.requirement)) {
                        shouldUnlock = true;
                    }
                    break;
            }

            if (shouldUnlock) {
                this.unlockAchievement(achievement.id);
            }
        });
    }

    // 解锁成就
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || this.data.achievements.unlocked.includes(achievementId)) {
            return;
        }

        this.data.achievements.unlocked.push(achievementId);
        this.data.achievements.notifications.push({
            id: achievementId,
            timestamp: Date.now(),
            read: false
        });

        // 给予奖励
        if (achievement.reward.experience) {
            this.addExperience(achievement.reward.experience);
        }

        this.notifyListeners('achievementUnlocked', achievement);
    }

    // 检查挑战
    checkChallenges(sessionData) {
        const today = this.getTodayString();
        
        // 检查每日挑战
        Object.values(this.challenges.daily).forEach(challenge => {
            if (this.isChallengeCompleted(challenge.id, today)) return;

            let completed = false;

            switch (challenge.id) {
                case 'daily_practice':
                    completed = this.data.statistics.practiceByDay[today]?.sessions >= 1;
                    break;

                case 'quality_practice':
                    completed = sessionData.score >= challenge.requirement.minScore;
                    break;
            }

            if (completed) {
                this.completeChallenge(challenge.id);
            }
        });
    }

    // 完成挑战
    completeChallenge(challengeId) {
        const challenge = this.findChallenge(challengeId);
        if (!challenge) return;

        const today = this.getTodayString();
        const completion = {
            challengeId,
            completedAt: Date.now(),
            day: today
        };

        this.data.progress.challengeHistory.push(completion);

        // 给予奖励
        if (challenge.reward.experience) {
            this.addExperience(challenge.reward.experience);
        }

        if (challenge.reward.streak) {
            // 连击奖励已在recordPracticeSession中处理
        }

        this.notifyListeners('challengeCompleted', { challenge, completion });
    }

    // 查找挑战
    findChallenge(challengeId) {
        for (const category of Object.values(this.challenges)) {
            if (category[challengeId]) {
                return category[challengeId];
            }
        }
        return null;
    }

    // 检查挑战是否已完成
    isChallengeCompleted(challengeId, day) {
        return this.data.progress.challengeHistory.some(
            completion => completion.challengeId === challengeId && completion.day === day
        );
    }

    // 更新技能分析
    updateSkillAnalysis(improvements, weakAreas, strongAreas) {
        // 更新弱项
        weakAreas.forEach(area => {
            const existing = this.data.statistics.weakAreas.find(w => w.skill === area);
            if (existing) {
                existing.count++;
                existing.lastSeen = Date.now();
            } else {
                this.data.statistics.weakAreas.push({
                    skill: area,
                    count: 1,
                    firstSeen: Date.now(),
                    lastSeen: Date.now()
                });
            }
        });

        // 更新强项
        strongAreas.forEach(area => {
            const existing = this.data.statistics.strongAreas.find(s => s.skill === area);
            if (existing) {
                existing.count++;
                existing.lastSeen = Date.now();
            } else {
                this.data.statistics.strongAreas.push({
                    skill: area,
                    count: 1,
                    firstSeen: Date.now(),
                    lastSeen: Date.now()
                });
            }
        });

        // 记录改进趋势
        this.data.statistics.improvementTrend.push({
            date: Date.now(),
            improvements: improvements.length,
            weakAreas: weakAreas.length,
            strongAreas: strongAreas.length
        });

        // 保留最近30天的数据
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.data.statistics.improvementTrend = this.data.statistics.improvementTrend
            .filter(trend => trend.date > thirtyDaysAgo);
    }

    // 检查是否有改进
    hasImprovedBy(amount) {
        const recentScores = this.data.statistics.scoreHistory
            .slice(-10) // 最近10次
            .map(h => h.score);

        if (recentScores.length < 5) return false;

        const oldAverage = recentScores.slice(0, 5).reduce((sum, score) => sum + score, 0) / 5;
        const newAverage = recentScores.slice(-5).reduce((sum, score) => sum + score, 0) / 5;

        return newAverage - oldAverage >= amount;
    }

    // 更新进度
    updateProgress() {
        const today = this.getTodayString();
        
        if (!this.data.progress.completedDays.includes(today)) {
            this.data.progress.completedDays.push(today);
            this.data.progress.currentDay = this.data.progress.completedDays.length;
        }
    }

    // 获取当前状态
    getCurrentStatus() {
        const expInfo = this.getExperienceToNextLevel();
        const today = this.getTodayString();
        const todayPractice = this.data.statistics.practiceByDay[today];

        return {
            user: {
                ...this.data.user,
                level: expInfo.currentLevel,
                experienceInfo: expInfo
            },
            progress: {
                ...this.data.progress,
                completionPercentage: (this.data.progress.currentDay / this.data.progress.totalDays * 100).toFixed(1)
            },
            today: {
                practiced: !!todayPractice,
                sessions: todayPractice?.sessions || 0,
                totalTime: todayPractice?.totalDuration || 0,
                averageScore: todayPractice?.averageScore || 0
            },
            achievements: {
                total: Object.keys(this.achievements).length,
                unlocked: this.data.achievements.unlocked.length,
                unread: this.data.achievements.notifications.filter(n => !n.read).length
            }
        };
    }

    // 获取排行榜数据
    getLeaderboardData() {
        // 这里可以实现与服务器的排行榜同步
        // 目前返回本地数据
        return {
            streak: this.data.user.streak,
            longestStreak: this.data.user.longestStreak,
            totalSessions: this.data.user.totalSessions,
            averageScore: this.data.user.averageScore,
            bestScore: this.data.user.bestScore,
            level: this.data.user.level,
            completedDays: this.data.progress.completedDays.length
        };
    }

    // 获取统计图表数据
    getChartData() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        return {
            scoreHistory: this.data.statistics.scoreHistory
                .filter(h => h.date > thirtyDaysAgo)
                .map(h => ({
                    date: new Date(h.date).toLocaleDateString(),
                    score: h.score
                })),
            practiceFrequency: Object.entries(this.data.statistics.practiceByDay)
                .filter(([date]) => new Date(date).getTime() > thirtyDaysAgo)
                .map(([date, data]) => ({
                    date,
                    sessions: data.sessions,
                    duration: data.totalDuration
                })),
            improvementTrend: this.data.statistics.improvementTrend
                .map(trend => ({
                    date: new Date(trend.date).toLocaleDateString(),
                    improvements: trend.improvements,
                    issues: trend.weakAreas
                })),
            skillAnalysis: {
                weakAreas: this.data.statistics.weakAreas
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5),
                strongAreas: this.data.statistics.strongAreas
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
            }
        };
    }

    // 设置每日重置
    setupDailyReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeToMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.performDailyReset();
            
            // 设置每日重置定时器
            setInterval(() => {
                this.performDailyReset();
            }, 24 * 60 * 60 * 1000);
        }, timeToMidnight);
    }

    // 执行每日重置
    performDailyReset() {
        // 清理过期的通知
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.data.achievements.notifications = this.data.achievements.notifications
            .filter(n => n.timestamp > sevenDaysAgo);

        // 检查连击是否中断
        const yesterday = this.getYesterdayString();
        const lastActiveDay = this.data.user.lastActiveDate ? 
            new Date(this.data.user.lastActiveDate).toDateString() : null;
            
        if (lastActiveDay !== yesterday) {
            this.data.user.streak = 0;
        }

        this.saveData();
        this.notifyListeners('dailyReset');
    }

    // 检查里程碑
    checkMilestones() {
        const milestones = [
            { days: 7, title: '一周坚持者' },
            { days: 30, title: '月度挑战者' },
            { days: 50, title: '半程英雄' },
            { days: 100, title: '百日英雄' }
        ];

        const completedDays = this.data.progress.completedDays.length;
        milestones.forEach(milestone => {
            if (completedDays >= milestone.days) {
                this.unlockAchievement(`milestone_${milestone.days}`);
            }
        });
    }

    // 工具方法
    getTodayString() {
        return new Date().toDateString();
    }

    getYesterdayString() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toDateString();
    }

    getDefaultData() {
        return {
            user: {
                level: 1,
                experience: 0,
                totalPracticeTime: 0,
                streak: 0,
                longestStreak: 0,
                joinDate: Date.now(),
                lastActiveDate: null,
                totalSessions: 0,
                averageScore: 0,
                bestScore: 0
            },
            progress: {
                currentDay: 1,
                totalDays: 100,
                completedDays: [],
                currentChallenge: null,
                challengeHistory: []
            },
            achievements: {
                unlocked: [],
                progress: {},
                notifications: []
            },
            statistics: {
                practiceByDay: {},
                scoreHistory: [],
                improvementTrend: [],
                weakAreas: [],
                strongAreas: []
            }
        };
    }

    // 事件监听
    addEventListener(event, callback) {
        this.listeners.add({ event, callback });
    }

    removeEventListener(event, callback) {
        this.listeners.delete({ event, callback });
    }

    notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            if (listener.event === event) {
                try {
                    listener.callback(data);
                } catch (error) {
                    console.error('游戏化事件监听器错误:', error);
                }
            }
        });
    }

    // 重置所有数据（仅用于测试）
    resetAllData() {
        this.data = this.getDefaultData();
        this.saveData();
        console.log('游戏化数据已重置');
    }

    // 导出数据
    exportData() {
        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: this.data
        };
    }

    // 导入数据
    importData(exportedData) {
        try {
            if (exportedData.version === '1.0' && exportedData.data) {
                this.data = { ...this.getDefaultData(), ...exportedData.data };
                this.saveData();
                this.notifyListeners('dataImported', exportedData);
                return true;
            }
        } catch (error) {
            console.error('数据导入失败:', error);
        }
        return false;
    }
}

// 导出游戏化系统
window.GamificationSystem = GamificationSystem;
