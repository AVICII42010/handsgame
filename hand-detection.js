export class HandDetector {
    constructor() {
        this.hands = null;
        this.video = document.getElementById('webcam');
        this.results = null;
        this.stream = null;
        this.isDetecting = false;
        this.lastError = null;
        this.gestureConfig = {
            allowLike: false,
            allowOk: false,
            minStableFrames: 3,
            unknownGraceFrames: 8
        };
        this.lastRawGesture = 'none';
        this.sameRawFrames = 0;
        this.unknownFrames = 0;
        this.stableGesture = 'none';
        this.debugStyle = {
            connectorColor: '#00FF00',
            landmarkColor: '#FF0000',
            glow: false
        };
        this.preferredFacingMode = 'user';
        this._detectRaf = 0;
        this.assetBase = '';
        this.assetBaseCandidates = [
            './vendor/mediapipe/hands',
            'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
            'https://unpkg.com/@mediapipe/hands'
        ];
        this._configureVideoElement();
    }

    _configureVideoElement() {
        if (!this.video) return;
        this.video.setAttribute('autoplay', '');
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('muted', '');
        this.video.setAttribute('webkit-playsinline', 'true');
        this.video.setAttribute('x5-playsinline', 'true');
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.autoplay = true;
    }

    setGestureConfig(next) {
        if (!next) return;
        if (typeof next.allowLike === 'boolean') this.gestureConfig.allowLike = next.allowLike;
        if (typeof next.allowOk === 'boolean') this.gestureConfig.allowOk = next.allowOk;
        if (typeof next.minStableFrames === 'number' && Number.isFinite(next.minStableFrames)) this.gestureConfig.minStableFrames = Math.max(1, Math.floor(next.minStableFrames));
        if (typeof next.unknownGraceFrames === 'number' && Number.isFinite(next.unknownGraceFrames)) this.gestureConfig.unknownGraceFrames = Math.max(0, Math.floor(next.unknownGraceFrames));
    }

    setDebugStyle(next) {
        if (!next) return;
        if (typeof next.connectorColor === 'string' && next.connectorColor) this.debugStyle.connectorColor = next.connectorColor;
        if (typeof next.landmarkColor === 'string' && next.landmarkColor) this.debugStyle.landmarkColor = next.landmarkColor;
        if (typeof next.glow === 'boolean') this.debugStyle.glow = next.glow;
    }

    async init() {
        await this._ensureMediaPipeLoaded();
        if (typeof Hands !== 'function') {
            const err = new Error('MediaPipeHandsLoadFailed');
            this.lastError = err;
            throw err;
        }

        this.hands = new Hands({
            locateFile: (file) => {
                return this._resolveAssetUrl(file);
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => {
            this.results = results;
        });
        this.lastError = null;
    }

    _resolveAssetUrl(file) {
        const cleanFile = String(file || '').replace(/^\.?\//, '');
        if (this.assetBase) return `${this.assetBase}/${cleanFile}`;
        return `${this.assetBaseCandidates[1]}/${cleanFile}`;
    }

    _inferAssetBase() {
        const explicit = document.querySelector('script[src*="@mediapipe/hands"]');
        const src = explicit && explicit.src ? String(explicit.src) : '';
        if (!src) return '';
        return src.replace(/\/hands\.js(?:\?.*)?$/, '');
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = Array.from(document.scripts || []).find((s) => s.src === src);
            if (existing) {
                if (existing.dataset.loaded === 'true') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`ScriptLoadFailed:${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.addEventListener('load', () => {
                script.dataset.loaded = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', () => reject(new Error(`ScriptLoadFailed:${src}`)), { once: true });
            document.head.appendChild(script);
        });
    }

    async _loadFromCandidates(paths) {
        let lastErr = null;
        for (const src of paths) {
            try {
                await this._loadScript(src);
                return src;
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('ScriptLoadFailed');
    }

    async _ensureMediaPipeLoaded() {
        const inferredBase = this._inferAssetBase();
        if (inferredBase) this.assetBase = inferredBase;

        if (typeof drawConnectors !== 'function' || typeof drawLandmarks !== 'function') {
            await this._loadFromCandidates([
                'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
                'https://unpkg.com/@mediapipe/drawing_utils/drawing_utils.js'
            ]);
        }

        if (typeof Hands !== 'function') {
            const loadedSrc = await this._loadFromCandidates([
                'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
                'https://unpkg.com/@mediapipe/hands/hands.js'
            ]);
            this.assetBase = String(loadedSrc).replace(/\/hands\.js(?:\?.*)?$/, '');
        }

        if (!this.assetBase) {
            this.assetBase = this._inferAssetBase() || this.assetBaseCandidates[1];
        }
    }

    hasStream() {
        return !!(this.video && this.video.srcObject);
    }

    async requestCamera(opts) {
        const o = opts && typeof opts === 'object' ? opts : {};
        const preferBack = typeof o.preferBack === 'boolean' ? o.preferBack : (this.preferredFacingMode === 'environment');
        const silent = typeof o.silent === 'boolean' ? o.silent : false;
        const allowFallbackSwap = typeof o.allowFallbackSwap === 'boolean' ? o.allowFallbackSwap : true;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const err = new Error('getUserMedia not supported');
            this.lastError = err;
            if (!silent) throw err;
            return;
        }

        if (window.isSecureContext !== true) {
            const err = new Error('NotSecureContext');
            this.lastError = err;
            if (!silent) throw err;
            return;
        }

        this.stopCamera();
        const facingPrimary = preferBack ? 'environment' : 'user';
        const facingSecondary = preferBack ? 'user' : 'environment';
        const constraintsQueue = [
            {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: { ideal: facingPrimary }
                },
                audio: false
            },
            {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: facingPrimary
                },
                audio: false
            }
        ];

        if (allowFallbackSwap) {
            constraintsQueue.push(
                {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: { ideal: facingSecondary }
                    },
                    audio: false
                },
                {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: facingSecondary
                    },
                    audio: false
                }
            );
        }
        constraintsQueue.push(
            {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            },
            { video: true, audio: false }
        );

        let stream = null;
        let lastErr = null;
        for (const constraints of constraintsQueue) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                break;
            } catch (err) {
                lastErr = err;
            }
        }

        if (!stream) {
            this.lastError = lastErr;
            if (!silent) throw lastErr;
            return;
        }

        this.stream = stream;
        this._configureVideoElement();
        this.video.srcObject = stream;
        await new Promise((resolve) => {
            if (this.video.readyState >= 1) {
                resolve();
                return;
            }
            this.video.onloadedmetadata = () => resolve();
        });
        try {
            await this.video.play();
        } catch (err) {
            try {
                await this.video.play();
            } catch (err2) {
                this.lastError = err2;
                if (!silent) throw err2;
            }
        }

        const track = stream.getVideoTracks && stream.getVideoTracks()[0];
        const settings = track && typeof track.getSettings === 'function' ? track.getSettings() : null;
        const actualFacing = settings && settings.facingMode ? String(settings.facingMode) : '';
        if (actualFacing === 'user' || actualFacing === 'environment') {
            this.preferredFacingMode = actualFacing;
        } else {
            this.preferredFacingMode = preferBack ? 'environment' : 'user';
        }

        if (!this.isDetecting) this.startDetection();
        this.lastError = null;
    }

    stopCamera() {
        try {
            const s = this.video && this.video.srcObject;
            if (s && typeof s.getTracks === 'function') {
                s.getTracks().forEach((t) => {
                    try { t.stop(); } catch {}
                });
            }
        } catch {}
        this.stream = null;
        if (this.video) this.video.srcObject = null;
        this.results = null;
    }

    async startDetection() {
        if (this.isDetecting) return;
        this.isDetecting = true;
        const detect = async () => {
            if (!this.isDetecting) return;
            if (this.video.readyState >= 2) {
                try {
                    await this.hands.send({ image: this.video });
                } catch (err) {
                    this.lastError = err;
                }
            }
            this._detectRaf = requestAnimationFrame(detect);
        };
        detect();
    }

    getGesture() {
        if (!this.results || !this.results.multiHandLandmarks || this.results.multiHandLandmarks.length === 0) {
            return this._stabilize('none');
        }

        const landmarks = this.results.multiHandLandmarks[0];
        if (!Array.isArray(landmarks) || landmarks.length < 21) {
            return this._stabilize('none');
        }
        return this._stabilize(this._getRawGestureFromLandmarks(landmarks));
    }
        
    _stabilize(raw) {
        if (raw === this.lastRawGesture) {
            this.sameRawFrames++;
        } else {
            this.lastRawGesture = raw;
            this.sameRawFrames = 1;
        }

        const isUnknown = raw === 'unknown' || raw === 'none';
        if (isUnknown) this.unknownFrames++;
        else this.unknownFrames = 0;

        if (!isUnknown && this.sameRawFrames >= this.gestureConfig.minStableFrames) {
            this.stableGesture = raw;
            return this.stableGesture;
        }

        if (this.unknownFrames >= this.gestureConfig.unknownGraceFrames) {
            this.stableGesture = raw;
        }

        return this.stableGesture;
    }

    _getRawGestureFromLandmarks(landmarks) {
        // 计算两点间欧几里得距离的平方（省去开方运算，提高性能）
        const distSq = (p1, p2) => {
            if (!p1 || !p2) return 0;
            const x1 = Number(p1.x);
            const y1 = Number(p1.y);
            const x2 = Number(p2.x);
            const y2 = Number(p2.y);
            if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return 0;
            return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
        };

        const requiredIdx = [0, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20];
        for (const idx of requiredIdx) {
            const p = landmarks[idx];
            if (!p || !Number.isFinite(Number(p.x)) || !Number.isFinite(Number(p.y))) return 'unknown';
        }

        const wrist = landmarks[0];
        const palmSizeSq = distSq(wrist, landmarks[9]) + 1e-6;
        
        // 判定指尖是否远离手腕（即手指伸出）
        // 比较：指尖到手腕的距离 vs 指根到手腕的距离
        const isFingerExtended = (tipIdx, pipIdx) => {
            const tip = distSq(landmarks[tipIdx], wrist);
            const pip = distSq(landmarks[pipIdx], wrist);
            return tip > pip * 1.12;
        };

        const indexExtended = isFingerExtended(8, 6);
        const middleExtended = isFingerExtended(12, 10);
        const ringExtended = isFingerExtended(16, 14);
        const pinkyExtended = isFingerExtended(20, 18);

        const isFingerFolded = (tipIdx, mcpIdx) => {
            return distSq(landmarks[tipIdx], landmarks[mcpIdx]) < palmSizeSq * 0.42;
        };
        const indexFolded = isFingerFolded(8, 5);
        const middleFolded = isFingerFolded(12, 9);
        const ringFolded = isFingerFolded(16, 13);
        const pinkyFolded = isFingerFolded(20, 17);
        const foldedCount = [indexFolded, middleFolded, ringFolded, pinkyFolded].filter(Boolean).length;

        const thumbTip = landmarks[4];
        const thumbMcp = landmarks[2];
        const thumbExtended = distSq(thumbTip, wrist) > distSq(thumbMcp, wrist) * 1.08;

        if (this.gestureConfig.allowOk) {
            const thumbIndexDist = distSq(landmarks[4], landmarks[8]);
            if (thumbIndexDist < 0.006 && middleExtended && ringExtended && pinkyExtended) {
                return 'ok';
            }
        }

        if (this.gestureConfig.allowLike) {
            const thumbUp = thumbTip.y < thumbMcp.y - 0.02;
            if (thumbExtended && thumbUp && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
                return 'like';
            }
        }

        // ✌️ 剪刀: 食指和中指伸出，无名指和小指收回
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            return 'scissors';
        }
        
        // 🖐️ 布: 四指伸出（拇指可选）
        if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return 'paper';
        }
        
        // ✊ 石头: 手指收回/握拳（优先用“折叠”特征，容错更好）
        if (foldedCount >= 3 || (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended)) {
            return 'rock';
        }

        return 'unknown';
    }

    drawDebug(ctx, canvas) {
        if (!this.results || !this.results.multiHandLandmarks) return;
        
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (const landmarks of this.results.multiHandLandmarks) {
            if (!Array.isArray(landmarks) || landmarks.length < 2) continue;
            const p0 = landmarks[0];
            if (!p0 || !Number.isFinite(Number(p0.x)) || !Number.isFinite(Number(p0.y))) continue;
            try {
                if (this.debugStyle.glow) {
                    ctx.shadowBlur = 18;
                    ctx.shadowColor = this.debugStyle.connectorColor;
                } else {
                    ctx.shadowBlur = 0;
                }
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                    color: this.debugStyle.connectorColor,
                    lineWidth: 5
                });
                ctx.shadowBlur = 0;
                drawLandmarks(ctx, landmarks, {
                    color: this.debugStyle.landmarkColor,
                    lineWidth: 2
                });
            } catch {}
        }
        ctx.restore();
    }
}
