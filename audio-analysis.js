// 音频分析模块
class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.animationId = null;
        this.isAnalyzing = false;
    }

    // 初始化音频上下文
    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            return true;
        } catch (error) {
            console.error('音频上下文初始化失败:', error);
            return false;
        }
    }

    // 开始音频分析
    async startAnalysis(stream) {
        if (!this.audioContext) {
            const initialized = await this.initializeAudioContext();
            if (!initialized) return false;
        }

        try {
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            this.isAnalyzing = true;
            this.visualizeAudio();
            
            return true;
        } catch (error) {
            console.error('音频分析启动失败:', error);
            return false;
        }
    }

    // 停止音频分析
    stopAnalysis() {
        this.isAnalyzing = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
    }

    // 音频可视化
    visualizeAudio() {
        const canvas = document.getElementById('recordingCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const draw = () => {
            if (!this.isAnalyzing) return;
            
            this.animationId = requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // 清空画布
            ctx.fillStyle = '#f7fafc';
            ctx.fillRect(0, 0, width, height);
            
            // 绘制音频波形
            const barWidth = (width / this.dataArray.length) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < this.dataArray.length; i++) {
                barHeight = (this.dataArray[i] / 255) * height * 0.8;
                
                // 创建渐变
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#ff6b6b');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }

    // 分析音频文件
    async analyzeAudioFile(audioBlob) {
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            return this.extractAudioFeatures(audioBuffer);
        } catch (error) {
            console.error('音频文件分析失败:', error);
            return null;
        }
    }

    // 提取音频特征
    extractAudioFeatures(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // 计算基本特征
        const features = {
            duration: duration,
            sampleRate: sampleRate,
            rms: this.calculateRMS(channelData),
            zeroCrossingRate: this.calculateZeroCrossingRate(channelData),
            spectralCentroid: this.calculateSpectralCentroid(channelData, sampleRate),
            pitchCurve: this.extractPitchCurve(channelData, sampleRate),
            pauses: this.detectPauses(channelData, sampleRate)
        };
        
        return features;
    }

    // 计算RMS（均方根）
    calculateRMS(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        return Math.sqrt(sum / data.length);
    }

    // 计算过零率
    calculateZeroCrossingRate(data) {
        let crossings = 0;
        for (let i = 1; i < data.length; i++) {
            if ((data[i] >= 0) !== (data[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / data.length;
    }

    // 计算频谱重心
    calculateSpectralCentroid(data, sampleRate) {
        // 简化的频谱重心计算
        const fft = this.simpleFFT(data);
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < fft.length / 2; i++) {
            const magnitude = Math.sqrt(fft[i * 2] * fft[i * 2] + fft[i * 2 + 1] * fft[i * 2 + 1]);
            const frequency = (i * sampleRate) / fft.length;
            
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    // 简化的FFT实现
    simpleFFT(data) {
        const N = data.length;
        const fft = new Array(N * 2);
        
        // 复制实数部分
        for (let i = 0; i < N; i++) {
            fft[i * 2] = data[i];
            fft[i * 2 + 1] = 0;
        }
        
        // 简化的FFT计算（实际应用中应使用更高效的实现）
        for (let i = 0; i < N; i++) {
            let real = 0;
            let imag = 0;
            
            for (let j = 0; j < N; j++) {
                const angle = -2 * Math.PI * i * j / N;
                real += data[j] * Math.cos(angle);
                imag += data[j] * Math.sin(angle);
            }
            
            fft[i * 2] = real;
            fft[i * 2 + 1] = imag;
        }
        
        return fft;
    }

    // 提取音调曲线
    extractPitchCurve(data, sampleRate) {
        const windowSize = 1024;
        const hopSize = 512;
        const pitchCurve = [];
        
        for (let i = 0; i < data.length - windowSize; i += hopSize) {
            const window = data.slice(i, i + windowSize);
            const pitch = this.estimatePitch(window, sampleRate);
            pitchCurve.push({
                time: i / sampleRate,
                frequency: pitch
            });
        }
        
        return pitchCurve;
    }

    // 估计音调
    estimatePitch(window, sampleRate) {
        // 使用自相关方法估计音调
        const autocorr = this.autocorrelation(window);
        
        // 寻找峰值
        let maxPeak = 0;
        let maxIndex = 0;
        
        for (let i = 1; i < autocorr.length / 2; i++) {
            if (autocorr[i] > maxPeak) {
                maxPeak = autocorr[i];
                maxIndex = i;
            }
        }
        
        // 计算频率
        const frequency = sampleRate / maxIndex;
        
        // 限制在合理的音调范围内
        return Math.max(80, Math.min(400, frequency));
    }

    // 自相关计算
    autocorrelation(data) {
        const N = data.length;
        const result = new Array(N);
        
        for (let lag = 0; lag < N; lag++) {
            let sum = 0;
            for (let i = 0; i < N - lag; i++) {
                sum += data[i] * data[i + lag];
            }
            result[lag] = sum / (N - lag);
        }
        
        return result;
    }

    // 检测停顿
    detectPauses(data, sampleRate) {
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms窗口
        const threshold = 0.01; // 音量阈值
        const pauses = [];
        
        let inPause = false;
        let pauseStart = 0;
        
        for (let i = 0; i < data.length - windowSize; i += windowSize) {
            const window = data.slice(i, i + windowSize);
            const rms = this.calculateRMS(window);
            
            if (rms < threshold && !inPause) {
                // 开始停顿
                inPause = true;
                pauseStart = i / sampleRate;
            } else if (rms >= threshold && inPause) {
                // 结束停顿
                inPause = false;
                const pauseEnd = i / sampleRate;
                const pauseDuration = pauseEnd - pauseStart;
                
                if (pauseDuration > 0.2) { // 只记录超过200ms的停顿
                    pauses.push({
                        start: pauseStart,
                        end: pauseEnd,
                        duration: pauseDuration
                    });
                }
            }
        }
        
        return pauses;
    }

    // 比较两个音频特征
    compareAudioFeatures(originalFeatures, userFeatures) {
        const comparison = {
            speedDifference: this.calculateSpeedDifference(originalFeatures, userFeatures),
            pitchDifference: this.calculatePitchDifference(originalFeatures, userFeatures),
            pauseDifference: this.calculatePauseDifference(originalFeatures, userFeatures),
            overallSimilarity: 0
        };
        
        // 计算总体相似度
        const speedScore = Math.max(0, 1 - Math.abs(comparison.speedDifference) / 50);
        const pitchScore = Math.max(0, 1 - Math.abs(comparison.pitchDifference) / 50);
        const pauseScore = Math.max(0, 1 - Math.abs(comparison.pauseDifference) / 5);
        
        comparison.overallSimilarity = (speedScore + pitchScore + pauseScore) / 3;
        
        return comparison;
    }

    // 计算语速差异
    calculateSpeedDifference(original, user) {
        // 基于停顿数量估算语速
        const originalSpeed = original.pauses.length > 0 ? 60 / original.pauses.length : 200;
        const userSpeed = user.pauses.length > 0 ? 60 / user.pauses.length : 200;
        
        return userSpeed - originalSpeed;
    }

    // 计算音调差异
    calculatePitchDifference(original, user) {
        const originalAvgPitch = this.calculateAveragePitch(original.pitchCurve);
        const userAvgPitch = this.calculateAveragePitch(user.pitchCurve);
        
        return userAvgPitch - originalAvgPitch;
    }

    // 计算停顿差异
    calculatePauseDifference(original, user) {
        return user.pauses.length - original.pauses.length;
    }

    // 计算平均音调
    calculateAveragePitch(pitchCurve) {
        if (pitchCurve.length === 0) return 0;
        
        const sum = pitchCurve.reduce((acc, point) => acc + point.frequency, 0);
        return sum / pitchCurve.length;
    }

    // 生成音调曲线数据用于图表
    generatePitchChartData(pitchCurve) {
        const labels = [];
        const values = [];
        
        pitchCurve.forEach(point => {
            labels.push(point.time.toFixed(1));
            values.push(point.frequency);
        });
        
        return { labels, values };
    }
}

// 全局音频分析器实例
let audioAnalyzer;

// 初始化音频分析器
function initializeAudioAnalyzer() {
    audioAnalyzer = new AudioAnalyzer();
}

// 开始音频分析
async function startAudioAnalysis(stream) {
    if (!audioAnalyzer) {
        initializeAudioAnalyzer();
    }
    
    return await audioAnalyzer.startAnalysis(stream);
}

// 停止音频分析
function stopAudioAnalysis() {
    if (audioAnalyzer) {
        audioAnalyzer.stopAnalysis();
    }
}

// 分析音频文件
async function analyzeAudioFile(audioBlob) {
    if (!audioAnalyzer) {
        initializeAudioAnalyzer();
    }
    
    return await audioAnalyzer.analyzeAudioFile(audioBlob);
}

// 比较音频特征
function compareAudioFeatures(originalFeatures, userFeatures) {
    if (!audioAnalyzer) {
        initializeAudioAnalyzer();
    }
    
    return audioAnalyzer.compareAudioFeatures(originalFeatures, userFeatures);
}

// 生成音调图表数据
function generatePitchChartData(pitchCurve) {
    if (!audioAnalyzer) {
        initializeAudioAnalyzer();
    }
    
    return audioAnalyzer.generatePitchChartData(pitchCurve);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAudioAnalyzer();
});

// 导出函数供其他模块使用
window.audioAnalysisFunctions = {
    startAudioAnalysis,
    stopAudioAnalysis,
    analyzeAudioFile,
    compareAudioFeatures,
    generatePitchChartData
};

