// 100天挑战系统
class ChallengeSystem {
    constructor() {
        this.storageKey = 'broadcasting_challenge_progress';
        this.challengeData = this.loadChallengeData();
        this.initializeUI();
    }

    // 加载挑战数据
    loadChallengeData() {
        const defaultData = {
            startDate: new Date().toISOString().split('T')[0],
            completedDays: [],
            currentStreak: 0,
            longestStreak: 0,
            totalDays: 0
        };

        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : defaultData;
        } catch (error) {
            console.error('加载挑战数据失败:', error);
            return defaultData;
        }
    }

    // 保存挑战数据
    saveChallengeData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.challengeData));
        } catch (error) {
            console.error('保存挑战数据失败:', error);
        }
    }

    // 初始化UI
    initializeUI() {
        this.updateProgressDisplay();
        this.generateCalendar();
        this.updateStats();
    }

    // 更新进度显示
    updateProgressDisplay() {
        const currentDay = this.getCurrentDay();
        const completedDays = this.challengeData.completedDays.length;
        const progressPercentage = (completedDays / 100) * 100;

        // 更新头部进度条
        document.getElementById('currentDay').textContent = currentDay;
        document.getElementById('completedDays').textContent = completedDays;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;

        // 更新进度界面统计
        document.getElementById('totalDays').textContent = completedDays;
        document.getElementById('streakDays').textContent = this.challengeData.currentStreak;
        document.getElementById('remainingDays').textContent = 100 - completedDays;
    }

    // 获取当前天数
    getCurrentDay() {
        const startDate = new Date(this.challengeData.startDate);
        const today = new Date();
        const diffTime = today - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.min(100, diffDays));
    }

    // 完成今日挑战
    completeTodayChallenge() {
        const today = new Date().toISOString().split('T')[0];
        
        // 检查今天是否已经完成
        if (this.challengeData.completedDays.includes(today)) {
            return false; // 今天已经完成过了
        }

        // 添加完成日期
        this.challengeData.completedDays.push(today);
        this.challengeData.totalDays++;

        // 更新连续天数
        this.updateStreak();

        // 保存数据
        this.saveChallengeData();

        // 更新UI
        this.updateProgressDisplay();
        this.generateCalendar();
        this.updateStats();

        return true;
    }

    // 更新连续天数
    updateStreak() {
        const completedDays = this.challengeData.completedDays.sort();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const today = new Date();
        
        for (let i = 0; i < completedDays.length; i++) {
            const completedDate = new Date(completedDays[i]);
            const daysDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 1) {
                tempStreak++;
                if (i === 0 || daysDiff === 1) {
                    currentStreak = tempStreak;
                }
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
        
        this.challengeData.currentStreak = currentStreak;
        this.challengeData.longestStreak = longestStreak;
    }

    // 生成日历
    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        calendarGrid.innerHTML = '';

        const startDate = new Date(this.challengeData.startDate);
        const today = new Date();
        const totalDays = 100;

        for (let i = 0; i < totalDays; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            const dayString = dayDate.toISOString().split('T')[0];
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i + 1;

            // 判断日期状态
            if (this.challengeData.completedDays.includes(dayString)) {
                dayElement.classList.add('completed');
                dayElement.title = `第${i + 1}天 - 已完成`;
            } else if (dayDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('current');
                dayElement.title = `第${i + 1}天 - 今天`;
            } else if (dayDate > today) {
                dayElement.classList.add('future');
                dayElement.title = `第${i + 1}天 - 未来`;
            } else {
                dayElement.title = `第${i + 1}天 - 未完成`;
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    // 更新统计信息
    updateStats() {
        const stats = this.getChallengeStats();
        
        // 更新统计卡片
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 3) {
            statCards[0].querySelector('.stat-number').textContent = stats.totalDays;
            statCards[1].querySelector('.stat-number').textContent = stats.currentStreak;
            statCards[2].querySelector('.stat-number').textContent = stats.remainingDays;
        }
    }

    // 获取挑战统计
    getChallengeStats() {
        return {
            totalDays: this.challengeData.totalDays,
            currentStreak: this.challengeData.currentStreak,
            longestStreak: this.challengeData.longestStreak,
            remainingDays: 100 - this.challengeData.totalDays,
            completionRate: Math.round((this.challengeData.totalDays / 100) * 100)
        };
    }

    // 获取成就信息
    getAchievements() {
        const stats = this.getChallengeStats();
        const achievements = [];

        if (stats.totalDays >= 7) {
            achievements.push({
                title: '坚持一周',
                description: '连续练习7天',
                icon: '🏆',
                unlocked: true
            });
        }

        if (stats.totalDays >= 30) {
            achievements.push({
                title: '月度坚持',
                description: '完成30天练习',
                icon: '🎖️',
                unlocked: true
            });
        }

        if (stats.currentStreak >= 10) {
            achievements.push({
                title: '连续十天',
                description: '连续10天不间断练习',
                icon: '🔥',
                unlocked: true
            });
        }

        if (stats.totalDays >= 100) {
            achievements.push({
                title: '百日挑战',
                description: '完成100天播音挑战',
                icon: '👑',
                unlocked: true
            });
        }

        return achievements;
    }

    // 重置挑战
    resetChallenge() {
        if (confirm('确定要重置挑战进度吗？此操作不可恢复。')) {
            this.challengeData = {
                startDate: new Date().toISOString().split('T')[0],
                completedDays: [],
                currentStreak: 0,
                longestStreak: 0,
                totalDays: 0
            };
            
            this.saveChallengeData();
            this.initializeUI();
            
            alert('挑战已重置，重新开始您的播音之旅！');
        }
    }

    // 导出进度数据
    exportProgress() {
        const data = {
            ...this.challengeData,
            exportDate: new Date().toISOString(),
            stats: this.getChallengeStats(),
            achievements: this.getAchievements()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `播音挑战进度_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 导入进度数据
    importProgress(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (data.startDate && Array.isArray(data.completedDays)) {
                    this.challengeData = {
                        startDate: data.startDate,
                        completedDays: data.completedDays,
                        currentStreak: data.currentStreak || 0,
                        longestStreak: data.longestStreak || 0,
                        totalDays: data.totalDays || data.completedDays.length
                    };
                    
                    this.saveChallengeData();
                    this.initializeUI();
                    
                    alert('进度数据导入成功！');
                } else {
                    throw new Error('数据格式不正确');
                }
            } catch (error) {
                console.error('导入失败:', error);
                alert('导入失败，请检查文件格式是否正确。');
            }
        };
        reader.readAsText(file);
    }
}

// 全局挑战系统实例
let challengeSystem;

// 初始化挑战系统
function initializeChallengeSystem() {
    challengeSystem = new ChallengeSystem();
}

// 更新挑战进度（在录音分析完成后调用）
function updateChallengeProgress() {
    if (challengeSystem) {
        const completed = challengeSystem.completeTodayChallenge();
        if (completed) {
            console.log('今日挑战完成！');
        } else {
            console.log('今日挑战已完成过了');
        }
    }
}

// 加载挑战进度（在页面加载时调用）
function loadChallengeProgress() {
    if (!challengeSystem) {
        initializeChallengeSystem();
    }
}

// 获取挑战统计
function getChallengeStats() {
    return challengeSystem ? challengeSystem.getChallengeStats() : null;
}

// 获取成就
function getAchievements() {
    return challengeSystem ? challengeSystem.getAchievements() : [];
}

// 重置挑战
function resetChallenge() {
    if (challengeSystem) {
        challengeSystem.resetChallenge();
    }
}

// 导出进度
function exportProgress() {
    if (challengeSystem) {
        challengeSystem.exportProgress();
    }
}

// 导入进度
function importProgress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        if (e.target.files[0] && challengeSystem) {
            challengeSystem.importProgress(e.target.files[0]);
        }
    };
    input.click();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeChallengeSystem();
});

// 导出函数供其他模块使用
window.challengeFunctions = {
    updateChallengeProgress,
    loadChallengeProgress,
    getChallengeStats,
    getAchievements,
    resetChallenge,
    exportProgress,
    importProgress
};

