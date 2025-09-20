// 专业音频分析引擎
class AudioAnalysisEngine {
    constructor() {
        this.sampleRate = 44100;
        this.windowSize = 2048;
        this.hopSize = 512;
        this.cache = new Map();
        this.worker = null;
        this.initializeWorker();
    }

    // 初始化Web Worker进行后台音频处理
    initializeWorker() {
        if (typeof Worker !== 'undefined') {
            const workerCode = `
                // YIN算法实现
                function yinPitchDetection(buffer, sampleRate) {
                    const threshold = 0.1;
                    const bufferSize = buffer.length;
                    const halfBufferSize = Math.floor(bufferSize / 2);
                    const yinBuffer = new Array(halfBufferSize);
                    
                    // Step 1: Difference function
                    yinBuffer[0] = 1;
                    for (let tau = 1; tau < halfBufferSize; tau++) {
                        yinBuffer[tau] = 0;
                        for (let i = 0; i < halfBufferSize; i++) {
                            const delta = buffer[i] - buffer[i + tau];
                            yinBuffer[tau] += delta * delta;
                        }
                    }
                    
                    // Step 2: Cumulative mean normalized difference function
                    let runningSum = 0;
                    yinBuffer[0] = 1;
                    for (let tau = 1; tau < halfBufferSize; tau++) {
                        runningSum += yinBuffer[tau];
                        yinBuffer[tau] *= tau / runningSum;
                    }
                    
                    // Step 3: Absolute threshold
                    let tau;
                    for (tau = 2; tau < halfBufferSize; tau++) {
                        if (yinBuffer[tau] < threshold) {
                            while (tau + 1 < halfBufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                                tau++;
                            }
                            break;
                        }
                    }
                    
                    // Step 4: Parabolic interpolation
                    let betterTau;
                    if (tau < halfBufferSize - 1) {
                        const s0 = yinBuffer[tau - 1];
                        const s1 = yinBuffer[tau];
                        const s2 = yinBuffer[tau + 1];
                        betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
                    } else {
                        betterTau = tau;
                    }
                    
                    return sampleRate / betterTau;
                }

                // 音频特征提取
                function extractAudioFeatures(audioData, sampleRate) {
                    const features = {
                        pitch: [],
                        rms: [],
                        zcr: [],
                        spectralCentroid: [],
                        mfcc: []
                    };
                    
                    const windowSize = 2048;
                    const hopSize = 512;
                    
                    for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
                        const window = audioData.slice(i, i + windowSize);
                        
                        // 音调检测
                        const pitch = yinPitchDetection(window, sampleRate);
                        features.pitch.push(Math.max(80, Math.min(400, pitch)));
                        
                        // RMS能量
                        const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
                        features.rms.push(rms);
                        
                        // 过零率
                        let zcr = 0;
                        for (let j = 1; j < window.length; j++) {
                            if ((window[j] >= 0) !== (window[j - 1] >= 0)) {
                                zcr++;
                            }
                        }
                        features.zcr.push(zcr / window.length);
                        
                        // 频谱质心
                        const fft = performFFT(window);
                        const spectralCentroid = calculateSpectralCentroid(fft, sampleRate);
                        features.spectralCentroid.push(spectralCentroid);
                    }
                    
                    return features;
                }

                // 简化的FFT实现
                function performFFT(signal) {
                    // 这里使用简化的频域分析
                    const N = signal.length;
                    const spectrum = new Array(N / 2);
                    
                    for (let k = 0; k < N / 2; k++) {
                        let real = 0, imag = 0;
                        for (let n = 0; n < N; n++) {
                            const angle = -2 * Math.PI * k * n / N;
                            real += signal[n] * Math.cos(angle);
                            imag += signal[n] * Math.sin(angle);
                        }
                        spectrum[k] = Math.sqrt(real * real + imag * imag);
                    }
                    
                    return spectrum;
                }

                // 计算频谱质心
                function calculateSpectralCentroid(spectrum, sampleRate) {
                    let weightedSum = 0;
                    let magnitudeSum = 0;
                    
                    for (let i = 0; i < spectrum.length; i++) {
                        const frequency = i * sampleRate / (2 * spectrum.length);
                        weightedSum += frequency * spectrum[i];
                        magnitudeSum += spectrum[i];
                    }
                    
                    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
                }

                // 停顿检测
                function detectPauses(audioData, sampleRate) {
                    const pauses = [];
                    const windowSize = Math.floor(sampleRate * 0.1); // 100ms窗口
                    const threshold = 0.01;
                    const minPauseDuration = 0.2; // 最小停顿时长200ms
                    
                    let inPause = false;
                    let pauseStart = 0;
                    
                    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
                        const window = audioData.slice(i, i + windowSize);
                        const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
                        const time = i / sampleRate;
                        
                        if (rms < threshold && !inPause) {
                            inPause = true;
                            pauseStart = time;
                        } else if (rms >= threshold && inPause) {
                            inPause = false;
                            const pauseDuration = time - pauseStart;
                            
                            if (pauseDuration >= minPauseDuration) {
                                pauses.push({
                                    start: pauseStart,
                                    end: time,
                                    duration: pauseDuration,
                                    type: pauseDuration > 1.5 ? '长停' : pauseDuration > 0.8 ? '中停' : '短停'
                                });
                            }
                        }
                    }
                    
                    return pauses;
                }

                // Worker消息处理
                self.onmessage = function(e) {
                    const { type, data } = e.data;
                    
                    switch (type) {
                        case 'extractFeatures':
                            const features = extractAudioFeatures(data.audioData, data.sampleRate);
                            self.postMessage({ type: 'featuresExtracted', data: features });
                            break;
                            
                        case 'detectPauses':
                            const pauses = detectPauses(data.audioData, data.sampleRate);
                            self.postMessage({ type: 'pausesDetected', data: pauses });
                            break;
                            
                        case 'pitchAnalysis':
                            const pitchData = [];
                            const windowSize = 2048;
                            const hopSize = 512;
                            
                            for (let i = 0; i < data.audioData.length - windowSize; i += hopSize) {
                                const window = data.audioData.slice(i, i + windowSize);
                                const pitch = yinPitchDetection(window, data.sampleRate);
                                const time = i / data.sampleRate;
                                
                                pitchData.push({
                                    time: time,
                                    frequency: Math.max(80, Math.min(400, pitch)),
                                    confidence: calculatePitchConfidence(window, pitch)
                                });
                            }
                            
                            self.postMessage({ type: 'pitchAnalyzed', data: pitchData });
                            break;
                    }
                };

                function calculatePitchConfidence(window, pitch) {
                    // 简化的置信度计算
                    const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
                    return Math.min(1.0, rms * 10);
                }
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
        }
    }

    // 提取音频特征
    async extractAudioFeatures(audioBuffer) {
        const cacheKey = `features_${audioBuffer.length}_${audioBuffer.sampleRate}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        return new Promise((resolve, reject) => {
            if (this.worker) {
                const audioData = audioBuffer.getChannelData(0);
                
                this.worker.onmessage = (e) => {
                    if (e.data.type === 'featuresExtracted') {
                        const features = e.data.data;
                        this.cache.set(cacheKey, features);
                        resolve(features);
                    }
                };
                
                this.worker.onerror = reject;
                
                this.worker.postMessage({
                    type: 'extractFeatures',
                    data: {
                        audioData: Array.from(audioData),
                        sampleRate: audioBuffer.sampleRate
                    }
                });
            } else {
                // Fallback to main thread processing
                resolve(this.extractFeaturesMainThread(audioBuffer));
            }
        });
    }

    // 主线程音频特征提取（备用方案）
    extractFeaturesMainThread(audioBuffer) {
        const audioData = audioBuffer.getChannelData(0);
        const features = {
            pitch: [],
            rms: [],
            zcr: [],
            spectralCentroid: []
        };

        for (let i = 0; i < audioData.length - this.windowSize; i += this.hopSize) {
            const window = audioData.slice(i, i + this.windowSize);
            
            // 基础音调检测
            const pitch = this.estimatePitch(window);
            features.pitch.push(Math.max(80, Math.min(400, pitch)));
            
            // RMS能量
            const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
            features.rms.push(rms);
            
            // 过零率
            let zcr = 0;
            for (let j = 1; j < window.length; j++) {
                if ((window[j] >= 0) !== (window[j - 1] >= 0)) {
                    zcr++;
                }
            }
            features.zcr.push(zcr / window.length);
        }

        return features;
    }

    // 简化的音调估算
    estimatePitch(window) {
        const autocorr = this.autocorrelation(window);
        let maxPeak = 0;
        let maxIndex = 0;
        
        for (let i = 1; i < autocorr.length / 2; i++) {
            if (autocorr[i] > maxPeak) {
                maxPeak = autocorr[i];
                maxIndex = i;
            }
        }
        
        return this.sampleRate / maxIndex;
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
    async detectPauses(audioBuffer) {
        return new Promise((resolve, reject) => {
            if (this.worker) {
                const audioData = audioBuffer.getChannelData(0);
                
                this.worker.onmessage = (e) => {
                    if (e.data.type === 'pausesDetected') {
                        resolve(e.data.data);
                    }
                };
                
                this.worker.onerror = reject;
                
                this.worker.postMessage({
                    type: 'detectPauses',
                    data: {
                        audioData: Array.from(audioData),
                        sampleRate: audioBuffer.sampleRate
                    }
                });
            } else {
                resolve(this.detectPausesMainThread(audioBuffer));
            }
        });
    }

    // 主线程停顿检测
    detectPausesMainThread(audioBuffer) {
        const audioData = audioBuffer.getChannelData(0);
        const pauses = [];
        const windowSize = Math.floor(audioBuffer.sampleRate * 0.1);
        const threshold = 0.01;
        
        let inPause = false;
        let pauseStart = 0;
        
        for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
            const window = audioData.slice(i, i + windowSize);
            const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
            const time = i / audioBuffer.sampleRate;
            
            if (rms < threshold && !inPause) {
                inPause = true;
                pauseStart = time;
            } else if (rms >= threshold && inPause) {
                inPause = false;
                const pauseDuration = time - pauseStart;
                
                if (pauseDuration > 0.2) {
                    pauses.push({
                        start: pauseStart,
                        end: time,
                        duration: pauseDuration,
                        type: pauseDuration > 1.5 ? '长停' : pauseDuration > 0.8 ? '中停' : '短停'
                    });
                }
            }
        }
        
        return pauses;
    }

    // 分析音调曲线
    async analyzePitchCurve(audioBuffer) {
        return new Promise((resolve, reject) => {
            if (this.worker) {
                const audioData = audioBuffer.getChannelData(0);
                
                this.worker.onmessage = (e) => {
                    if (e.data.type === 'pitchAnalyzed') {
                        resolve(e.data.data);
                    }
                };
                
                this.worker.onerror = reject;
                
                this.worker.postMessage({
                    type: 'pitchAnalysis',
                    data: {
                        audioData: Array.from(audioData),
                        sampleRate: audioBuffer.sampleRate
                    }
                });
            } else {
                resolve(this.analyzePitchMainThread(audioBuffer));
            }
        });
    }

    // 主线程音调分析
    analyzePitchMainThread(audioBuffer) {
        const audioData = audioBuffer.getChannelData(0);
        const pitchData = [];
        
        for (let i = 0; i < audioData.length - this.windowSize; i += this.hopSize) {
            const window = audioData.slice(i, i + this.windowSize);
            const pitch = this.estimatePitch(window);
            const time = i / audioBuffer.sampleRate;
            
            pitchData.push({
                time: time,
                frequency: Math.max(80, Math.min(400, pitch)),
                confidence: this.calculateConfidence(window)
            });
        }
        
        return pitchData;
    }

    // 计算置信度
    calculateConfidence(window) {
        const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
        return Math.min(1.0, rms * 10);
    }

    // 计算语速
    calculateSpeechSpeed(audioBuffer, textLength = null) {
        const duration = audioBuffer.duration;
        const estimatedChars = textLength || Math.floor(duration * 6); // 平均每秒6个字
        const wordsPerMinute = Math.round((estimatedChars / duration) * 60);
        
        return {
            duration: duration,
            estimatedCharacters: estimatedChars,
            wordsPerMinute: wordsPerMinute,
            charactersPerSecond: estimatedChars / duration
        };
    }

    // 综合音频分析
    async comprehensiveAnalysis(audioBuffer, textData = null) {
        try {
            console.log('开始综合音频分析...');
            
            // 并行执行多种分析
            const [features, pauses, pitchCurve, speedData] = await Promise.all([
                this.extractAudioFeatures(audioBuffer),
                this.detectPauses(audioBuffer),
                this.analyzePitchCurve(audioBuffer),
                Promise.resolve(this.calculateSpeechSpeed(audioBuffer, textData?.length))
            ]);

            return {
                features,
                pauses,
                pitchCurve,
                speedData,
                quality: this.assessAudioQuality(features),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('音频分析失败:', error);
            throw error;
        }
    }

    // 评估音频质量
    assessAudioQuality(features) {
        const avgRMS = features.rms.reduce((sum, val) => sum + val, 0) / features.rms.length;
        const pitchStability = this.calculatePitchStability(features.pitch);
        
        let quality = 'good';
        if (avgRMS < 0.001) quality = 'too_quiet';
        else if (avgRMS > 0.5) quality = 'too_loud';
        else if (pitchStability < 0.5) quality = 'unstable_pitch';
        
        return {
            level: quality,
            rms: avgRMS,
            pitchStability: pitchStability,
            snr: this.estimateSignalToNoise(features)
        };
    }

    // 计算音调稳定性
    calculatePitchStability(pitchData) {
        if (pitchData.length < 2) return 1.0;
        
        const validPitches = pitchData.filter(p => p > 80 && p < 400);
        if (validPitches.length < 2) return 0.0;
        
        const mean = validPitches.reduce((sum, val) => sum + val, 0) / validPitches.length;
        const variance = validPitches.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validPitches.length;
        const stdDev = Math.sqrt(variance);
        
        // 标准差越小，稳定性越高
        return Math.max(0, 1 - stdDev / mean);
    }

    // 估算信噪比
    estimateSignalToNoise(features) {
        const sortedRMS = [...features.rms].sort((a, b) => a - b);
        const noiseLevel = sortedRMS[Math.floor(sortedRMS.length * 0.1)]; // 取最小的10%作为噪声
        const signalLevel = sortedRMS[Math.floor(sortedRMS.length * 0.9)]; // 取最大的10%作为信号
        
        return signalLevel / (noiseLevel + 1e-10); // 避免除零
    }

    // 清理资源
    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.cache.clear();
    }
}

// 导出音频分析引擎
window.AudioAnalysisEngine = AudioAnalysisEngine;
