// 高性能可视化引擎 - Canvas渲染和实时音频可视化
class VisualizationEngine {
    constructor() {
        this.canvases = new Map();
        this.animationFrames = new Map();
        this.renderQueue = [];
        this.isRendering = false;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.offscreenSupport = 'OffscreenCanvas' in window;
        
        // 渲染配置
        this.config = {
            maxFPS: 60,
            enableAntiAliasing: true,
            enableHardwareAcceleration: true,
            batchSize: 10,
            memoryLimit: 100 * 1024 * 1024 // 100MB
        };
        
        this.setupRenderLoop();
    }

    // 初始化Canvas
    initializeCanvas(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas元素未找到: ${canvasId}`);
        }

        const {
            width = canvas.offsetWidth,
            height = canvas.offsetHeight,
            enableOffscreen = false,
            contextType = '2d'
        } = options;

        // 设置高DPI支持
        canvas.width = width * this.pixelRatio;
        canvas.height = height * this.pixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // 获取渲染上下文
        const ctx = canvas.getContext(contextType, {
            alpha: true,
            antialias: this.config.enableAntiAliasing,
            desynchronized: this.config.enableHardwareAcceleration,
            powerPreference: 'high-performance'
        });

        // 缩放上下文以支持高DPI
        if (contextType === '2d') {
            ctx.scale(this.pixelRatio, this.pixelRatio);
        }

        // 创建离屏Canvas（如果支持）
        let offscreenCanvas = null;
        if (enableOffscreen && this.offscreenSupport) {
            try {
                offscreenCanvas = new OffscreenCanvas(width, height);
            } catch (error) {
                console.warn('离屏Canvas创建失败:', error);
            }
        }

        const canvasInfo = {
            canvas,
            ctx,
            width,
            height,
            offscreenCanvas,
            lastRender: 0,
            renderCount: 0,
            options
        };

        this.canvases.set(canvasId, canvasInfo);
        return canvasInfo;
    }

    // 设置渲染循环
    setupRenderLoop() {
        let lastFrameTime = 0;
        const targetFrameTime = 1000 / this.config.maxFPS;

        const renderLoop = (currentTime) => {
            if (currentTime - lastFrameTime >= targetFrameTime) {
                this.processRenderQueue();
                lastFrameTime = currentTime;
            }
            
            if (this.renderQueue.length > 0 || this.isRendering) {
                requestAnimationFrame(renderLoop);
            }
        };

        requestAnimationFrame(renderLoop);
    }

    // 处理渲染队列
    processRenderQueue() {
        if (this.renderQueue.length === 0) return;

        this.isRendering = true;
        const batch = this.renderQueue.splice(0, this.config.batchSize);

        batch.forEach(renderTask => {
            try {
                renderTask.execute();
            } catch (error) {
                console.error('渲染任务失败:', error);
            }
        });

        this.isRendering = this.renderQueue.length > 0;
    }

    // 添加渲染任务
    addRenderTask(task) {
        this.renderQueue.push(task);
    }

    // 绘制音调曲线
    drawPitchCurve(canvasId, pitchData, options = {}) {
        const canvasInfo = this.canvases.get(canvasId);
        if (!canvasInfo) {
            throw new Error(`Canvas未初始化: ${canvasId}`);
        }

        const {
            lineColor = '#059669',
            lineWidth = 3,
            fillColor = 'rgba(5, 150, 105, 0.1)',
            enableFill = true,
            enableSmoothing = true,
            enableGrid = true,
            enableLabels = true,
            animationDuration = 0
        } = options;

        const renderTask = {
            priority: 'high',
            execute: () => {
                const { ctx, width, height } = canvasInfo;
                
                // 清空画布
                ctx.clearRect(0, 0, width, height);
                
                // 绘制网格
                if (enableGrid) {
                    this.drawGrid(ctx, width, height);
                }
                
                // 绘制坐标轴
                this.drawAxes(ctx, width, height);
                
                // 绘制音调曲线
                this.renderPitchPath(ctx, pitchData, width, height, {
                    lineColor,
                    lineWidth,
                    fillColor,
                    enableFill,
                    enableSmoothing
                });
                
                // 绘制标签
                if (enableLabels) {
                    this.drawPitchLabels(ctx, width, height);
                }
                
                canvasInfo.renderCount++;
                canvasInfo.lastRender = performance.now();
            }
        };

        if (animationDuration > 0) {
            this.animatePitchCurve(canvasId, pitchData, options, animationDuration);
        } else {
            this.addRenderTask(renderTask);
        }
    }

    // 渲染音调路径
    renderPitchPath(ctx, pitchData, width, height, options) {
        if (!pitchData || pitchData.length === 0) return;

        const { lineColor, lineWidth, fillColor, enableFill, enableSmoothing } = options;
        
        // 计算路径点
        const points = pitchData.map((point, index) => ({
            x: (index / (pitchData.length - 1)) * width,
            y: height - ((point.frequency - 150) / 200) * height
        }));

        // 设置绘制样式
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 创建路径
        ctx.beginPath();
        
        if (enableSmoothing && points.length > 2) {
            // 使用贝塞尔曲线平滑
            this.drawSmoothCurve(ctx, points);
        } else {
            // 直线连接
            points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
        }

        // 绘制填充
        if (enableFill) {
            ctx.save();
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.restore();
        }

        // 绘制线条
        ctx.stroke();
    }

    // 绘制平滑曲线
    drawSmoothCurve(ctx, points) {
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
            const cp1x = points[i].x + (points[i + 1].x - points[i - 1].x) / 6;
            const cp1y = points[i].y + (points[i + 1].y - points[i - 1].y) / 6;
            const cp2x = points[i + 1].x - (points[i + 2].x - points[i].x) / 6;
            const cp2y = points[i + 1].y - (points[i + 2].y - points[i].y) / 6;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
        }
        
        // 处理最后一段
        if (points.length > 2) {
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        }
    }

    // 绘制网格
    drawGrid(ctx, width, height, options = {}) {
        const {
            gridColor = '#e5e7eb',
            gridLineWidth = 0.5,
            horizontalLines = 10,
            verticalLines = 20
        } = options;

        ctx.save();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = gridLineWidth;
        ctx.globalAlpha = 0.5;

        // 水平网格线
        for (let i = 0; i <= horizontalLines; i++) {
            const y = (i / horizontalLines) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 垂直网格线
        for (let i = 0; i <= verticalLines; i++) {
            const x = (i / verticalLines) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        ctx.restore();
    }

    // 绘制坐标轴
    drawAxes(ctx, width, height, options = {}) {
        const {
            axisColor = '#374151',
            axisLineWidth = 2,
            showLabels = true,
            labelFont = '12px Arial',
            labelColor = '#6b7280'
        } = options;

        ctx.save();
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = axisLineWidth;

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

        if (showLabels) {
            ctx.fillStyle = labelColor;
            ctx.font = labelFont;
            ctx.textAlign = 'center';
            
            // X轴标签（时间）
            ctx.fillText('时间(s)', width / 2, height - 8);
            
            // Y轴标签（频率）
            ctx.save();
            ctx.translate(20, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('频率(Hz)', 0, 0);
            ctx.restore();
        }

        ctx.restore();
    }

    // 绘制音调标签
    drawPitchLabels(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Arial';
        
        // Y轴刻度标签
        const freqLabels = ['350Hz', '300Hz', '250Hz', '200Hz', '150Hz'];
        freqLabels.forEach((label, index) => {
            const y = (index / 4) * height;
            ctx.textAlign = 'right';
            ctx.fillText(label, 35, y + 3);
        });
        
        // X轴刻度标签
        const timeLabels = ['0s', '1s', '2s', '3s', '4s', '5s'];
        timeLabels.forEach((label, index) => {
            const x = (index / 5) * width;
            ctx.textAlign = 'center';
            ctx.fillText(label, x, height - 20);
        });
        
        ctx.restore();
    }

    // 绘制词语标注
    drawWordAnnotations(canvasId, annotations, options = {}) {
        const canvasInfo = this.canvases.get(canvasId);
        if (!canvasInfo) return;

        const {
            keywordColor = '#ef4444',
            regularColor = '#3b82f6',
            fontSize = '10px',
            fontFamily = 'Arial'
        } = options;

        const renderTask = {
            priority: 'medium',
            execute: () => {
                const { ctx, width, height } = canvasInfo;
                
                annotations.forEach((annotation, index) => {
                    const x = (annotation.time / 5) * width; // 假设5秒总长度
                    const y = height - ((annotation.frequency - 150) / 200) * height;
                    
                    // 绘制标注点
                    ctx.fillStyle = annotation.isKeyword ? keywordColor : regularColor;
                    ctx.beginPath();
                    ctx.arc(x, y, annotation.isKeyword ? 4 : 2, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // 绘制文字
                    ctx.fillStyle = annotation.isKeyword ? '#1f2937' : '#6b7280';
                    ctx.font = `${annotation.isKeyword ? 'bold ' : ''}${fontSize} ${fontFamily}`;
                    ctx.textAlign = 'center';
                    
                    // 计算文字位置，避免重叠
                    let textY = y - (annotation.isKeyword ? 15 : 10);
                    if (index % 2 === 1) textY = y + (annotation.isKeyword ? 20 : 15);
                    
                    // 文字阴影效果
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                    ctx.shadowBlur = 2;
                    ctx.fillText(annotation.word, x, textY);
                    ctx.shadowBlur = 0;
                });
            }
        };

        this.addRenderTask(renderTask);
    }

    // 实时音频可视化
    createRealtimeVisualizer(canvasId, audioStream, options = {}) {
        const canvasInfo = this.canvases.get(canvasId);
        if (!canvasInfo) {
            throw new Error(`Canvas未初始化: ${canvasId}`);
        }

        const {
            fftSize = 256,
            smoothingTimeConstant = 0.8,
            minDecibels = -90,
            maxDecibels = -10,
            visualizationType = 'frequency' // 'frequency', 'waveform', 'both'
        } = options;

        // 创建音频分析器
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(audioStream);
        
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;
        analyser.minDecibels = minDecibels;
        analyser.maxDecibels = maxDecibels;
        
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const waveformArray = new Uint8Array(analyser.fftSize);

        const visualizer = {
            isActive: true,
            audioContext,
            analyser,
            
            start: () => {
                const animate = () => {
                    if (!visualizer.isActive) return;
                    
                    const renderTask = {
                        priority: 'high',
                        execute: () => {
                            const { ctx, width, height } = canvasInfo;
                            
                            // 清空画布
                            ctx.fillStyle = '#f7fafc';
                            ctx.fillRect(0, 0, width, height);
                            
                            if (visualizationType === 'frequency' || visualizationType === 'both') {
                                analyser.getByteFrequencyData(dataArray);
                                this.drawFrequencyBars(ctx, dataArray, width, height);
                            }
                            
                            if (visualizationType === 'waveform' || visualizationType === 'both') {
                                analyser.getByteTimeDomainData(waveformArray);
                                this.drawWaveform(ctx, waveformArray, width, height);
                            }
                        }
                    };
                    
                    this.addRenderTask(renderTask);
                    requestAnimationFrame(animate);
                };
                
                animate();
            },
            
            stop: () => {
                visualizer.isActive = false;
                audioContext.close();
            }
        };

        return visualizer;
    }

    // 绘制频率条
    drawFrequencyBars(ctx, dataArray, width, height) {
        const barWidth = (width / dataArray.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            
            // 彩色渐变
            const hue = i / dataArray.length * 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    // 绘制波形
    drawWaveform(ctx, dataArray, width, height) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
    }

    // 动画音调曲线
    animatePitchCurve(canvasId, pitchData, options, duration) {
        const canvasInfo = this.canvases.get(canvasId);
        if (!canvasInfo) return;

        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数
            const easeProgress = this.easeOutCubic(progress);
            
            // 计算当前显示的数据点数量
            const currentLength = Math.floor(pitchData.length * easeProgress);
            const currentData = pitchData.slice(0, currentLength);
            
            // 绘制当前状态
            this.drawPitchCurve(canvasId, currentData, {
                ...options,
                animationDuration: 0 // 避免递归动画
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 缓动函数
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // 对比两条曲线
    drawComparisonCurves(canvasId, originalData, userData, options = {}) {
        const canvasInfo = this.canvases.get(canvasId);
        if (!canvasInfo) return;

        const {
            originalColor = '#10b981',
            userColor = '#ef4444',
            showDifferences = true,
            differenceColor = '#f59e0b'
        } = options;

        const renderTask = {
            priority: 'high',
            execute: () => {
                const { ctx, width, height } = canvasInfo;
                
                // 清空画布
                ctx.clearRect(0, 0, width, height);
                
                // 绘制网格和坐标轴
                this.drawGrid(ctx, width, height);
                this.drawAxes(ctx, width, height);
                
                // 绘制原声曲线
                this.renderPitchPath(ctx, originalData, width, height, {
                    lineColor: originalColor,
                    lineWidth: 3,
                    enableFill: false,
                    enableSmoothing: true
                });
                
                // 绘制用户曲线（虚线）
                ctx.save();
                ctx.setLineDash([8, 4]);
                this.renderPitchPath(ctx, userData, width, height, {
                    lineColor: userColor,
                    lineWidth: 2,
                    enableFill: false,
                    enableSmoothing: true
                });
                ctx.setLineDash([]);
                ctx.restore();
                
                // 标记差异点
                if (showDifferences) {
                    this.markDifferences(ctx, originalData, userData, width, height, differenceColor);
                }
                
                // 绘制图例
                this.drawLegend(ctx, width, height, {
                    items: [
                        { color: originalColor, label: '原声', style: 'solid' },
                        { color: userColor, label: '您的录音', style: 'dashed' },
                        { color: differenceColor, label: '差异点', style: 'dot' }
                    ]
                });
            }
        };

        this.addRenderTask(renderTask);
    }

    // 标记差异点
    markDifferences(ctx, originalData, userData, width, height, color) {
        if (!originalData || !userData) return;

        const minLength = Math.min(originalData.length, userData.length);
        
        for (let i = 0; i < minLength; i += 10) {
            const originalFreq = originalData[i]?.frequency || 0;
            const userFreq = userData[i]?.frequency || 0;
            const difference = Math.abs(originalFreq - userFreq);
            
            if (difference > 15) { // 15Hz以上的差异
                const x = (i / (minLength - 1)) * width;
                const avgY = height - (((originalFreq + userFreq) / 2 - 150) / 200) * height;
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, avgY, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    // 绘制图例
    drawLegend(ctx, width, height, options) {
        const { items } = options;
        const legendX = width - 150;
        const legendY = 20;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(legendX - 10, legendY - 5, 140, items.length * 25 + 10);
        ctx.strokeStyle = '#d1d5db';
        ctx.strokeRect(legendX - 10, legendY - 5, 140, items.length * 25 + 10);
        
        items.forEach((item, index) => {
            const y = legendY + index * 25;
            
            // 绘制样式线
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2;
            
            if (item.style === 'dashed') {
                ctx.setLineDash([4, 2]);
            } else if (item.style === 'dot') {
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc(legendX + 10, y, 2, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                ctx.setLineDash([]);
            }
            
            if (item.style !== 'dot') {
                ctx.beginPath();
                ctx.moveTo(legendX, y);
                ctx.lineTo(legendX + 20, y);
                ctx.stroke();
            }
            
            // 绘制文字
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.fillText(item.label, legendX + 25, y + 4);
        });
        
        ctx.restore();
    }

    // 获取渲染统计
    getRenderStats() {
        const stats = {
            canvasCount: this.canvases.size,
            renderQueueSize: this.renderQueue.length,
            isRendering: this.isRendering,
            canvases: {}
        };

        this.canvases.forEach((info, id) => {
            stats.canvases[id] = {
                renderCount: info.renderCount,
                lastRender: info.lastRender,
                dimensions: `${info.width}x${info.height}`,
                pixelRatio: this.pixelRatio
            };
        });

        return stats;
    }

    // 清理资源
    cleanup() {
        // 停止所有动画
        this.animationFrames.forEach(id => cancelAnimationFrame(id));
        this.animationFrames.clear();
        
        // 清空渲染队列
        this.renderQueue = [];
        this.isRendering = false;
        
        // 清理Canvas
        this.canvases.clear();
        
        console.log('可视化引擎资源已清理');
    }

    // 优化内存使用
    optimizeMemory() {
        // 清理未使用的Canvas
        this.canvases.forEach((info, id) => {
            const element = document.getElementById(id);
            if (!element || !element.isConnected) {
                this.canvases.delete(id);
                console.log(`清理未使用的Canvas: ${id}`);
            }
        });
        
        // 限制渲染队列大小
        if (this.renderQueue.length > 100) {
            this.renderQueue = this.renderQueue.slice(-50);
            console.log('渲染队列已优化');
        }
    }
}

// 导出可视化引擎
window.VisualizationEngine = VisualizationEngine;
