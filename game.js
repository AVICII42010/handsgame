import { HandDetector } from './hand-detection.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.statusElement = document.getElementById('gesture-status');
        this.finalScoreElement = document.getElementById('final-score');
        this.planetPercentElement = document.getElementById('planet-percent');
        this.rankTitleElement = document.getElementById('rank-title');
        this.comboDisplayElement = document.getElementById('combo-display');
        this.aiCoachElement = document.getElementById('ai-coach');
        this.repairSetupScreen = document.getElementById('repair-setup-screen');
        this.startScreen = document.getElementById('start-screen');
        this.gameInfo = document.getElementById('game-info');
        this.loadingScreen = document.getElementById('loading-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.aiSummaryElement = document.getElementById('ai-summary');
        this.finalRankNameElement = document.getElementById('final-rank-name');
        this.finalTotalEnergyElement = document.getElementById('final-total-energy');
        this.healthInput = document.getElementById('health-input');
        this.goalInput = document.getElementById('goal-input');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.aiPlanPreview = document.getElementById('ai-plan-preview');
        this.repairDiffWrap = document.getElementById('repair-difficulty');
        this.repairDiffNote = document.getElementById('repair-diff-note');
        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.lbBackdrop = document.getElementById('leaderboard-backdrop');
        this.lbPanel = document.getElementById('leaderboard-panel');
        this.lbCloseBtn = document.getElementById('lb-close-btn');
        this.lbControls = document.getElementById('lb-controls');
        this.lbList = document.getElementById('lb-list');
        this.lbSelf = document.getElementById('lb-self');
        this.lbToast = document.getElementById('lb-toast');
        this.cameraPermissionWrap = document.getElementById('camera-permission');
        this.cameraEnableBtn = document.getElementById('camera-enable-btn');
        this.cameraStatus = document.getElementById('camera-status');
        this.browserOpenTip = document.getElementById('browser-open-tip');
        this.touchDemoBtn = document.getElementById('touch-demo-btn');
        this.touchControls = document.getElementById('touch-controls');
        this.homeRankPlanet = document.getElementById('home-rank-planet');
        this.homeRankName = document.getElementById('home-rank-name');
        this.homeRankTitle = document.getElementById('home-rank-title');
        this.homeTotalEnergy = document.getElementById('home-total-energy');
        this.homeNextEnergy = document.getElementById('home-next-energy');
        this.homeRankSub = document.getElementById('home-rank-sub');
        this.rankmapBtn = document.getElementById('rankmap-btn');
        this.dailyRewardBtn = document.getElementById('daily-reward-btn');
        this.gestureStylePanel = document.getElementById('gesture-style-panel');
        this.gestureFrameColorInput = document.getElementById('gesture-frame-color');
        this.gestureStyleNote = document.getElementById('gesture-style-note');
        this.rankmapBackdrop = document.getElementById('rankmap-backdrop');
        this.rankmapPanel = document.getElementById('rankmap-panel');
        this.rankmapCloseBtn = document.getElementById('rankmap-close-btn');
        this.rankmapOrbits = document.getElementById('rankmap-orbits');
        this.rankmapInfo = document.getElementById('rankmap-info');
        this.rankupOverlay = document.getElementById('rankup-overlay');
        this.rankupPlanet = document.getElementById('rankup-planet');
        this.rankupTitle = document.getElementById('rankup-title');
        this.rankupSub = document.getElementById('rankup-sub');
        this.rankupCloseBtn = document.getElementById('rankup-close-btn');
        this.debugCanvas = document.getElementById('output_canvas');
        this.debugCtx = this.debugCanvas.getContext('2d');
        
        this.detector = new HandDetector();
        this.ua = String((navigator && navigator.userAgent) || '').toLowerCase();
        this.inputMode = 'camera';
        this.touchGesture = 'rock';
        this.score = 0;
        this.isGameOver = false;
        this.isPlaying = false;
        this.totalEnergy = 0; // 累计能量（用于星球点亮）
        
        this.runner = {
            x: 100,
            y: 0,
            width: 50,
            height: 80,
            color: '#3498db',
            jumpY: 0,
            frame: 0
        };
        
        this.obstacles = [];
        this.obstacleTypes = ['rock', 'paper', 'scissors'];
        this.obstacleIcons = {
            'rock': '✊',
            'paper': '🖐️',
            'scissors': '✌️',
            'like': '👍'
        };

        this.speed = 3; // 初始速度从 5 降到 3
        this.lastSpawnTime = 0;
        this.spawnInterval = 3000; // 初始间隔从 2000 增加到 3000ms
        this.combo = 0;
        this.maxCombo = 0;
        this.particles = [];
        this.fever = 0; // 0 to 100
        this.isFeverMode = false;
        this.level = 1;
        this.shield = 0; // 护盾持续时间
        this.slowMo = 0; // 减速持续时间
        this.isBossPhase = false;
        this.bossSequence = [];
        this.bossStep = 0;
        this.bossTimer = 0;
        this.nextMonsterAt = 15;
        this.monster = {
            hp: 0,
            maxHp: 0,
            gesture: 'rock',
            mistakes: 0,
            hitCooldownFrames: 0,
            introFrames: 0
        };
        this.gameMode = 'normal'; // 'normal' | 'challenge' | 'repair'
        this.repairDifficulty = 'easy';
        this.run = {
            normalCorrect: 0,
            energyGain: 0,
            promotionWin: false
        };
        this.runRank = 1;
        this.repair = {
            progress: 0,
            timeLeftFrames: 0,
            target: 'rock',
            holdFrames: 0,
            holdNeedFrames: 24,
            progressStep: 12.5,
            energyPerSuccess: 3,
            targetPool: ['rock', 'paper', 'scissors', 'like'],
            noProgressFrames: 0,
            lastProgressAt: 0,
            stats: {
                successes: 0,
                failures: 0,
                unknowns: 0,
                holdsCompleted: 0,
                startFrame: 0,
                endFrame: 0
            }
        };
        this.aiCoach = {
            enabled: false,
            messages: [],
            adjustments: [],
            lastShownFrame: 0
        };

        this.audioCtx = null;
        this.audio = {
            masterGain: null,
            musicGain: null,
            fxGain: null,
            compressor: null,
            noiseBuffer: null,
            track: {
                url: './waiting%20for%20love.mp3',
                arrayBuffer: null,
                buffer: null,
                decodePromise: null,
                source: null,
                gain: null,
                startTime: 0,
                bpm: 128,
                offsetSec: 0,
                playing: false
            },
            currentBgm: null,
            currentStop: null
        };

        this.bg = {
            w: 0,
            h: 0,
            stars: [],
            nebula: [],
            comets: [],
            sparkles: [],
            city: [],
            city2: [],
            cityW: 0,
            city2W: 0,
            cityScroll: 0,
            city2Scroll: 0,
            cityCanvas: null,
            city2Canvas: null,
            cityCanvasH: 0,
            city2CanvasH: 0,
            scanCanvas: null,
            scanH: 0,
            t: 0
        };
        this._idleRaf = null;
        this.rhythm = {
            lastBeat: -1,
            nextSpawnBeat: 0
        };

        this.lbState = {
            tab: 'today',
            totalMetric: 'bestScore'
        };
        const cfgMetric = this._storageGet('fp_lb_total_metric', 'bestScore');
        if (cfgMetric === 'totalEnergy' || cfgMetric === 'bestScore') this.lbState.totalMetric = cfgMetric;
        this.profile = this._getOrCreateProfile();
        this.bots = this._ensureBots();
        const stats = this._loadStats();
        this.totalEnergy = this._statGetTotalEnergy(stats);
        this._applyDebugStyleFromStats(stats);

        this.init();
    }

    _rankTable() {
        return [
            { rank: 1, name: '水星', minEnergy: 0, maxEnergy: 199, unlock: { type: 'initial' }, title: '水星旅人', tagline: '起航：点亮第一颗行星。' },
            { rank: 2, name: '金星', minEnergy: 200, maxEnergy: 499, unlock: { type: 'gamesPlayed', value: 3 }, title: '金星使者', tagline: '让光更接近你。' },
            { rank: 3, name: '地球', minEnergy: 500, maxEnergy: 999, unlock: { type: 'challengeWin', value: 1 }, title: '地球守护者', tagline: '你的节奏开始稳定。' },
            { rank: 4, name: '火星', minEnergy: 1000, maxEnergy: 1999, unlock: { type: 'syncCorrect', value: 50 }, title: '火星开拓者', tagline: '向外扩张，点亮新的轨道。' },
            { rank: 5, name: '木星', minEnergy: 2000, maxEnergy: 3999, unlock: { type: 'streakScore', value: 5, score: 60 }, title: '木星指挥官', tagline: '连续胜利，让能量奔涌。' },
            { rank: 6, name: '土星', minEnergy: 4000, maxEnergy: 6999, unlock: { type: 'leaderboardTop', value: 50 }, title: '土星环卫', tagline: '站上人群视野的轨道。' },
            { rank: 7, name: '天王星', minEnergy: 7000, maxEnergy: 9999, unlock: { type: 'repairAllDifficulty' }, title: '天王星修复师', tagline: '修复舱全难度已被点亮。' },
            { rank: 8, name: '海王星', minEnergy: 10000, maxEnergy: Infinity, unlock: { type: 'promotionMatch', wins: 3 }, title: '海王星引航者', tagline: '终极外环，星系为你发光。' }
        ];
    }

    _rankByEnergyOnly(totalEnergy) {
        const e = Number(totalEnergy) || 0;
        const table = this._rankTable();
        let r = 1;
        for (const it of table) {
            if (e >= it.minEnergy) r = Math.max(r, it.rank);
        }
        return Math.min(8, Math.max(1, r));
    }

    _rankMeta(rank) {
        const r = Math.min(8, Math.max(1, Math.floor(Number(rank) || 1)));
        const table = this._rankTable();
        return table.find(x => x.rank === r) || table[0];
    }

    _rankColors(rank) {
        const r = Math.min(8, Math.max(1, Math.floor(Number(rank) || 1)));
        const colors = {
            1: ['#9fb0c8', '#3f4a66'],
            2: ['#ffd35a', '#ff709f'],
            3: ['#4ad7ff', '#2ed573'],
            4: ['#ff4757', '#ff6b81'],
            5: ['#f1c40f', '#d35400'],
            6: ['#b08cff', '#6c5ce7'],
            7: ['#00ffd0', '#5080ff'],
            8: ['#2f3542', '#00fff0']
        };
        return colors[r] || colors[1];
    }

    _rankPlanetStyle(el, rank, locked, current) {
        if (!el) return;
        const [a, b] = this._rankColors(rank);
        const g = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.52) 0%, ${a} 28%, ${b} 62%, rgba(0,0,0,0.20) 100%)`;
        el.style.background = g;
        el.style.filter = locked ? 'grayscale(1)' : 'grayscale(0)';
        el.style.opacity = locked ? '0.55' : '1';
        el.style.boxShadow = current
            ? '0 0 0 1px rgba(255,211,90,0.30), 0 0 26px rgba(255,211,90,0.18), 0 0 46px rgba(0,255,240,0.12)'
            : '0 0 0 1px rgba(255,255,255,0.10), 0 0 18px rgba(0,255,240,0.10)';
    }

    _energyGainForRun(score, mode) {
        const s = Math.max(0, Math.floor(Number(score) || 0));
        const base = 20;
        const mult = mode === 'repair' ? 1.3 : (mode === 'challenge' ? 1.15 : 1);
        const bonus = Math.floor(s * 1.6 * mult);
        return base + bonus;
    }

    _isRunWin(mode, score, repairProgress) {
        if (mode === 'repair') return Number(repairProgress) >= 100;
        return Number(score) >= 60;
    }

    _unlockProgressText(rank, stats) {
        const s = this._normalizeStats(stats);
        if (rank === 2) {
            const cur = s.games_played || 0;
            return `完成任意3局：${cur}/3`;
        }
        if (rank === 3) {
            const cur = s.challenge_wins || 0;
            return `怪兽能量战胜利（单局≥30）：${Math.min(cur, 1)}/1`;
        }
        if (rank === 4) {
            const cur = s.sync_correct_total || 0;
            return `能量同步正确50次：${Math.min(cur, 50)}/50`;
        }
        if (rank === 5) {
            const cur = s.score60_streak || 0;
            return `连续5局得分>60：${Math.min(cur, 5)}/5`;
        }
        if (rank === 6) {
            return `排行榜进入前50：${s.leaderboard_top50 ? '已达成' : '未达成'}`;
        }
        if (rank === 7) {
            const d = s.repair_difficulties_done || {};
            const done = ['easy', 'normal', 'hard'].filter(k => !!d[k]).length;
            return `指尖修复舱全难度：${done}/3`;
        }
        if (rank === 8) {
            const wins = (s.promotion && Number.isFinite(Number(s.promotion.wins))) ? Math.floor(Number(s.promotion.wins)) : 0;
            return `晋级赛连续3局获胜：${Math.min(wins, 3)}/3`;
        }
        return '';
    }

    _statGetTotalEnergy(stats) {
        const v = Number(stats && (stats.total_energy ?? stats.totalEnergy));
        return Number.isFinite(v) ? v : 0;
    }

    _statSetTotalEnergy(stats, v) {
        const n = Math.max(0, Math.floor(Number(v) || 0));
        stats.total_energy = n;
        stats.totalEnergy = n;
    }

    _statGetCurrentRank(stats) {
        const v = Number(stats && (stats.current_rank ?? stats.currentRank));
        const r = Number.isFinite(v) ? Math.floor(v) : 1;
        return Math.min(8, Math.max(1, r));
    }

    _statSetCurrentRank(stats, v) {
        const r = Math.min(8, Math.max(1, Math.floor(Number(v) || 1)));
        stats.current_rank = r;
        stats.currentRank = r;
    }

    _normalizeStats(raw) {
        const s = (raw && typeof raw === 'object') ? raw : {};
        if (!Array.isArray(s.rank_up_history) && Array.isArray(s.rankUpHistory)) s.rank_up_history = s.rankUpHistory;
        if (!Array.isArray(s.rank_up_history)) s.rank_up_history = [];
        s.rankUpHistory = s.rank_up_history;

        if (s.total_energy == null && s.totalEnergy != null) s.total_energy = s.totalEnergy;
        if (s.totalEnergy == null && s.total_energy != null) s.totalEnergy = s.total_energy;
        this._statSetTotalEnergy(s, this._statGetTotalEnergy(s));

        if (s.current_rank == null && s.currentRank != null) s.current_rank = s.currentRank;
        if (s.currentRank == null && s.current_rank != null) s.currentRank = s.current_rank;
        this._statSetCurrentRank(s, this._statGetCurrentRank(s));

        s.bestScore = Number.isFinite(Number(s.bestScore)) ? Number(s.bestScore) : 0;
        s.todayBest = (s.todayBest && typeof s.todayBest === 'object') ? s.todayBest : {};

        s.games_played = Number.isFinite(Number(s.games_played)) ? Math.max(0, Math.floor(Number(s.games_played))) : (Number.isFinite(Number(s.gamesPlayed)) ? Math.max(0, Math.floor(Number(s.gamesPlayed))) : 0);
        s.gamesPlayed = s.games_played;

        s.challenge_wins = Number.isFinite(Number(s.challenge_wins)) ? Math.max(0, Math.floor(Number(s.challenge_wins))) : (Number.isFinite(Number(s.challengeWins)) ? Math.max(0, Math.floor(Number(s.challengeWins))) : 0);
        s.challengeWins = s.challenge_wins;

        s.sync_correct_total = Number.isFinite(Number(s.sync_correct_total)) ? Math.max(0, Math.floor(Number(s.sync_correct_total))) : (Number.isFinite(Number(s.syncCorrectTotal)) ? Math.max(0, Math.floor(Number(s.syncCorrectTotal))) : 0);
        s.syncCorrectTotal = s.sync_correct_total;

        s.score60_streak = Number.isFinite(Number(s.score60_streak)) ? Math.max(0, Math.floor(Number(s.score60_streak))) : (Number.isFinite(Number(s.score60Streak)) ? Math.max(0, Math.floor(Number(s.score60Streak))) : 0);
        s.score60Streak = s.score60_streak;

        s.repair_difficulties_done = (s.repair_difficulties_done && typeof s.repair_difficulties_done === 'object') ? s.repair_difficulties_done : (s.repairDifficultiesDone && typeof s.repairDifficultiesDone === 'object' ? s.repairDifficultiesDone : {});
        s.repairDifficultiesDone = s.repair_difficulties_done;
        for (const k of ['easy', 'normal', 'hard']) {
            if (typeof s.repair_difficulties_done[k] !== 'boolean') s.repair_difficulties_done[k] = false;
        }

        s.leaderboard_top50 = (typeof s.leaderboard_top50 === 'boolean') ? s.leaderboard_top50 : (typeof s.leaderboardTop50 === 'boolean' ? s.leaderboardTop50 : false);
        s.leaderboardTop50 = s.leaderboard_top50;

        s.promotion = (s.promotion && typeof s.promotion === 'object') ? s.promotion : {};
        if (typeof s.promotion.active !== 'boolean') s.promotion.active = false;
        if (!Number.isFinite(Number(s.promotion.wins))) s.promotion.wins = 0;
        s.promotion.wins = Math.max(0, Math.floor(Number(s.promotion.wins)));

        s.last_daily_reward = (typeof s.last_daily_reward === 'string' && s.last_daily_reward) ? s.last_daily_reward : (typeof s.lastDailyReward === 'string' ? s.lastDailyReward : '');
        s.lastDailyReward = s.last_daily_reward;

        s.unlocked_titles = Array.isArray(s.unlocked_titles) ? s.unlocked_titles : (Array.isArray(s.unlockedTitles) ? s.unlockedTitles : []);
        s.unlockedTitles = s.unlocked_titles;

        s.gesture_style = (s.gesture_style && typeof s.gesture_style === 'object') ? s.gesture_style : (s.gestureStyle && typeof s.gestureStyle === 'object' ? s.gestureStyle : {});
        s.gestureStyle = s.gesture_style;
        if (typeof s.gesture_style.frameColor !== 'string' || !s.gesture_style.frameColor) s.gesture_style.frameColor = '#00FF00';
        if (typeof s.gesture_style.glow !== 'boolean') s.gesture_style.glow = false;

        return s;
    }

    _applyDebugStyleFromStats(stats) {
        const s = this._normalizeStats(stats);
        const rank = this._statGetCurrentRank(s);
        const frameColor = (s.gesture_style && s.gesture_style.frameColor) ? String(s.gesture_style.frameColor) : '#00FF00';
        const glow = !!(s.gesture_style && s.gesture_style.glow);
        this.detector.setDebugStyle({
            connectorColor: frameColor,
            landmarkColor: '#FF0000',
            glow: rank >= 4 ? glow : false
        });
        if (this.gestureFrameColorInput) this.gestureFrameColorInput.value = this._normalizeHexColor(frameColor) || '#00ff00';
    }

    _normalizeHexColor(c) {
        const s = String(c || '').trim();
        if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
        if (/^#[0-9a-fA-F]{3}$/.test(s)) {
            return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
        }
        return '';
    }

    // 输赢逻辑判定
    checkGestureMatch(playerGesture, obstacle) {
        if (this.gameMode === 'normal') {
            return playerGesture === obstacle.type;
        } else {
            // 挑战模式逻辑
            const rules = {
                'rock': { win: 'paper', lose: 'scissors' },
                'paper': { win: 'scissors', lose: 'rock' },
                'scissors': { win: 'rock', lose: 'paper' }
            };
            
            const targetRule = rules[obstacle.type];
            if (!targetRule) return false;

            if (obstacle.condition === 'win') {
                return playerGesture === targetRule.win;
            } else {
                return playerGesture === targetRule.lose;
            }
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: color,
                size: Math.random() * 5 + 2
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }

    initAudio() {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => {});

        if (!this.audio.masterGain) {
            const ctx = this.audioCtx;
            this.audio.masterGain = ctx.createGain();
            this.audio.musicGain = ctx.createGain();
            this.audio.fxGain = ctx.createGain();
            this.audio.compressor = ctx.createDynamicsCompressor();

            this.audio.masterGain.gain.value = 0.9;
            this.audio.musicGain.gain.value = 0.32;
            this.audio.fxGain.gain.value = 0.85;

            this.audio.musicGain.connect(this.audio.compressor);
            this.audio.fxGain.connect(this.audio.compressor);
            this.audio.compressor.connect(this.audio.masterGain);
            this.audio.masterGain.connect(ctx.destination);

            this.audio.noiseBuffer = this._createNoiseBuffer();
        }
    }

    async _preloadTrack() {
        if (this.audio.track.arrayBuffer) return;
        try {
            const res = await fetch(this.audio.track.url);
            this.audio.track.arrayBuffer = await res.arrayBuffer();
        } catch {}
    }

    async _ensureTrackDecoded() {
        if (!this.audio.track.arrayBuffer) return null;
        if (this.audio.track.buffer) return this.audio.track.buffer;
        if (this.audio.track.decodePromise) return await this.audio.track.decodePromise;
        if (!this.audioCtx) return null;
        const ctx = this.audioCtx;
        this.audio.track.decodePromise = (async () => {
            try {
                const buf = await ctx.decodeAudioData(this.audio.track.arrayBuffer.slice(0));
                this.audio.track.buffer = buf;
                this.audio.track.offsetSec = this._estimateFirstBeatOffset(buf);
                return buf;
            } catch {
                return null;
            }
        })();
        return await this.audio.track.decodePromise;
    }

    _estimateFirstBeatOffset(buffer) {
        try {
            const sr = buffer.sampleRate;
            const data = buffer.getChannelData(0);
            const maxSec = Math.min(12, buffer.duration);
            const hop = 1024;
            const win = 2048;
            const n = Math.floor((maxSec * sr - win) / hop);
            if (n <= 10) return 0;
            const env = new Float32Array(n);
            let sum = 0;
            for (let i = 0; i < n; i++) {
                const start = i * hop;
                let e = 0;
                for (let j = 0; j < win; j += 16) {
                    const v = data[start + j] || 0;
                    e += v * v;
                }
                e = Math.sqrt(e / (win / 16));
                env[i] = e;
                sum += e;
            }
            const mean = sum / n;
            let vsum = 0;
            for (let i = 0; i < n; i++) {
                const d = env[i] - mean;
                vsum += d * d;
            }
            const std = Math.sqrt(vsum / n);
            const thr = mean + std * 2.6;
            const minIdx = Math.floor((0.35 * sr) / hop);
            for (let i = minIdx; i < n; i++) {
                if (env[i] > thr) return (i * hop) / sr;
            }
        } catch {}
        return 0;
    }

    async _startTrack() {
        this.initAudio();
        const ctx = this.audioCtx;
        const buf = await this._ensureTrackDecoded();
        if (!buf || !this.audio.musicGain) return false;

        this._stopTrack();

        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        src.connect(g);
        g.connect(this.audio.musicGain);
        const t = ctx.currentTime;
        const startAt = Math.max(0, this.audio.track.offsetSec || 0);
        src.start(t, startAt);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.9, t + 0.35);

        this.audio.track.source = src;
        this.audio.track.gain = g;
        this.audio.track.startTime = t - startAt;
        this.audio.track.playing = true;
        this.rhythm.lastBeat = -1;
        this.rhythm.nextSpawnBeat = 0;
        return true;
    }

    _stopTrack() {
        const ctx = this.audioCtx;
        const src = this.audio.track.source;
        const g = this.audio.track.gain;
        if (g && ctx) {
            const t = ctx.currentTime;
            try {
                g.gain.cancelScheduledValues(t);
                g.gain.setValueAtTime(g.gain.value, t);
                g.gain.linearRampToValueAtTime(0.0001, t + 0.18);
            } catch {}
        }
        if (src && ctx) {
            try { src.stop(ctx.currentTime + 0.2); } catch {}
            try { src.disconnect(); } catch {}
        }
        if (g) {
            try { g.disconnect(); } catch {}
        }
        this.audio.track.source = null;
        this.audio.track.gain = null;
        this.audio.track.playing = false;
    }

    _songBeatFloat() {
        if (!this.audioCtx || !this.audio.track.playing) return null;
        const bpm = this.audio.track.bpm || 128;
        const t = this.audioCtx.currentTime - (this.audio.track.startTime || 0);
        return (t * bpm) / 60;
    }

    playSound(freq, type, duration) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.audio.fxGain || this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    _mtof(m) {
        return 440 * Math.pow(2, (m - 69) / 12);
    }

    _createNoiseBuffer() {
        const ctx = this.audioCtx;
        const sr = ctx.sampleRate;
        const seconds = 1;
        const buffer = ctx.createBuffer(1, sr * seconds, sr);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    }

    _makeDrive(amount) {
        const ctx = this.audioCtx;
        const ws = ctx.createWaveShaper();
        const n = 1024;
        const curve = new Float32Array(n);
        const k = Math.max(0.0001, amount);
        for (let i = 0; i < n; i++) {
            const x = (i * 2) / (n - 1) - 1;
            curve[i] = Math.tanh(k * x);
        }
        ws.curve = curve;
        ws.oversample = '4x';
        return ws;
    }

    _startSequencer({ bpm, stepsPerBeat, onStep }) {
        const ctx = this.audioCtx;
        const spb = Math.max(1, stepsPerBeat || 4);
        const stepDur = (60 / Math.max(40, bpm)) / spb;
        let step = 0;
        let nextTime = ctx.currentTime + 0.05;
        const lookahead = 0.16;
        const intervalMs = 25;

        const tick = () => {
            const now = ctx.currentTime;
            while (nextTime < now + lookahead) {
                onStep(step, nextTime, stepDur);
                step = (step + 1) % (spb * 4);
                nextTime += stepDur;
            }
        };
        tick();
        const id = window.setInterval(tick, intervalMs);
        return () => window.clearInterval(id);
    }

    _hitKick(time, dest, intensity) {
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const base = 55;
        const top = 150 + (intensity || 0) * 120;
        osc.frequency.setValueAtTime(top, time);
        osc.frequency.exponentialRampToValueAtTime(base, time + 0.09);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.9, time + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.18);
    }

    _hitSnare(time, dest, intensity) {
        const ctx = this.audioCtx;
        const src = ctx.createBufferSource();
        src.buffer = this.audio.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1400 + (intensity || 0) * 700, time);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.55, time + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
        src.connect(hp);
        hp.connect(gain);
        gain.connect(dest);
        src.start(time);
        src.stop(time + 0.13);
    }

    _hitHat(time, dest, open) {
        const ctx = this.audioCtx;
        const src = ctx.createBufferSource();
        src.buffer = this.audio.noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(8200, time);
        bp.Q.setValueAtTime(8, time);
        const gain = ctx.createGain();
        const dur = open ? 0.09 : 0.03;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(open ? 0.16 : 0.12, time + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        src.connect(bp);
        bp.connect(gain);
        gain.connect(dest);
        src.start(time);
        src.stop(time + dur + 0.01);
    }

    _hitBass(time, dest, midi, dur, drive) {
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(260, time);
        lp.Q.setValueAtTime(1.4, time);
        osc.type = 'square';
        osc.frequency.setValueAtTime(this._mtof(midi), time);
        g.gain.setValueAtTime(0.0001, time);
        g.gain.exponentialRampToValueAtTime(0.42, time + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, time + (dur || 0.12));
        osc.connect(lp);
        lp.connect(g);
        if (drive) {
            const ws = this._makeDrive(drive);
            g.connect(ws);
            ws.connect(dest);
            osc.start(time);
            osc.stop(time + (dur || 0.12) + 0.02);
            return;
        }
        g.connect(dest);
        osc.start(time);
        osc.stop(time + (dur || 0.12) + 0.02);
    }

    _hitLead(time, dest, midi, dur) {
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(420, time);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(this._mtof(midi), time);
        g.gain.setValueAtTime(0.0001, time);
        g.gain.exponentialRampToValueAtTime(0.12, time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, time + (dur || 0.18));
        osc.connect(hp);
        hp.connect(g);
        g.connect(dest);
        osc.start(time);
        osc.stop(time + (dur || 0.18) + 0.03);
    }

    _buildBgm(state) {
        const ctx = this.audioCtx;
        const trackGain = ctx.createGain();
        trackGain.gain.value = 0.0001;

        const bus = ctx.createGain();
        bus.gain.value = 1;

        let driveNode = null;
        let chainIn = bus;
        if (state === 'fever') {
            driveNode = this._makeDrive(2.8);
            chainIn.connect(driveNode);
            driveNode.connect(trackGain);
        } else {
            chainIn.connect(trackGain);
        }
        trackGain.connect(this.audio.musicGain);

        const set = (target, secs) => {
            const t = ctx.currentTime;
            trackGain.gain.cancelScheduledValues(t);
            trackGain.gain.setValueAtTime(trackGain.gain.value, t);
            trackGain.gain.linearRampToValueAtTime(target, t + (secs || 0.25));
        };

        const root = {
            menu: 50,
            repair_setup: 50,
            repair_train: 50,
            sync_run: 45,
            challenge_run: 43,
            boss: 41,
            fever: 41
        }[state] || 45;

        const scale = [0, 3, 5, 7, 10];
        const seq = {
            menu: { bpm: 92, hats: 0.15 },
            repair_setup: { bpm: 88, hats: 0.12 },
            repair_train: { bpm: 104, hats: 0.18 },
            sync_run: { bpm: 128, hats: 0.38 },
            challenge_run: { bpm: 136, hats: 0.46 },
            boss: { bpm: 146, hats: 0.62 },
            fever: { bpm: 164, hats: 0.9 }
        }[state] || { bpm: 120, hats: 0.3 };

        const kick16 = {
            menu: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            repair_setup: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            repair_train: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,1,0,0],
            sync_run: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
            challenge_run: [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0],
            boss: [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0],
            fever: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,1,0,0]
        }[state] || [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0];

        const snare16 = {
            menu: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            repair_setup: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            repair_train: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            sync_run: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            challenge_run: [0,0,0,0, 1,0,0,0, 0,0,0,1, 1,0,0,0],
            boss: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
            fever: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0]
        }[state] || [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];

        const bass16 = {
            menu: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            repair_setup: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            repair_train: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            sync_run: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            challenge_run: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            boss: [1,0,0,0, 0,0,0,1, 1,0,0,0, 0,0,1,0],
            fever: [1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,1,0]
        }[state] || [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0];

        const stopSeq = this._startSequencer({
            bpm: seq.bpm,
            stepsPerBeat: 4,
            onStep: (step, time, stepDur) => {
                const s16 = step % 16;

                if (kick16[s16]) this._hitKick(time, chainIn, state === 'fever' ? 0.9 : (state === 'boss' ? 0.55 : 0.25));
                if (snare16[s16]) this._hitSnare(time, chainIn, state === 'fever' ? 0.75 : (state === 'boss' ? 0.55 : 0.3));

                const hatChance = seq.hats;
                if (Math.random() < hatChance) this._hitHat(time, chainIn, state === 'fever' ? (s16 % 4 === 2) : false);

                if (bass16[s16]) {
                    const note = root + (s16 >= 8 ? 12 : 0);
                    this._hitBass(time, chainIn, note, state === 'fever' ? 0.14 : 0.12, state === 'fever' ? 2.2 : (state === 'boss' ? 1.0 : 0));
                }

                if (state === 'menu' || state === 'repair_setup' || state === 'repair_train') {
                    if (s16 % 4 === 0) {
                        const idx = ((Math.floor(step / 4) + (state === 'repair_train' ? 1 : 0)) % scale.length);
                        this._hitLead(time + 0.01, chainIn, root + 24 + scale[idx], state === 'repair_train' ? 0.22 : 0.28);
                    }
                } else if (state === 'sync_run' || state === 'challenge_run') {
                    if (s16 % 8 === 6) this._hitLead(time + stepDur * 0.5, chainIn, root + 24 + scale[(s16 / 2) % scale.length], 0.14);
                } else if (state === 'boss' || state === 'fever') {
                    if (s16 % 4 === 3) this._hitLead(time + 0.005, chainIn, root + 19 + (state === 'fever' ? 12 : 0), 0.11);
                }
            }
        });

        set(0.85, 0.22);
        return {
            gain: trackGain,
            stop: () => {
                try { stopSeq(); } catch {}
                try { driveNode && driveNode.disconnect(); } catch {}
                try { trackGain.disconnect(); } catch {}
                try { bus.disconnect(); } catch {}
            },
            fadeOut: (secs) => {
                const t = ctx.currentTime;
                trackGain.gain.cancelScheduledValues(t);
                trackGain.gain.setValueAtTime(trackGain.gain.value, t);
                trackGain.gain.linearRampToValueAtTime(0.0001, t + (secs || 0.25));
            }
        };
    }

    _desiredBgmState() {
        if (this.isGameOver) return 'gameover';
        if (this.isPlaying) {
            return 'mp3';
        }
        if (!this.startScreen.classList.contains('hidden')) return 'menu';
        if (!this.repairSetupScreen.classList.contains('hidden')) return 'repair_setup';
        return 'menu';
    }

    _applyBgmState(next) {
        this.initAudio();
        const ctx = this.audioCtx;
        if (next === this.audio.currentBgm) return;

        if (this.audio.currentBgm === 'mp3' && next !== 'mp3') {
            this._stopTrack();
        }

        if (next === 'mp3') {
            const prevBgm = this.audio.currentBgm;
            const prevStop = this.audio.currentStop;
            const prevTrack = this.audio.currentTrack;
            this.audio.currentBgm = next;
            this.audio.currentStop = null;
            this.audio.currentTrack = null;
            this._startTrack().then((ok) => {
                if (!ok) {
                    this.audio.currentBgm = prevBgm;
                    this.audio.currentStop = prevStop;
                    this.audio.currentTrack = prevTrack;
                    return;
                }
                if (prevTrack && prevTrack.fadeOut) {
                    try { prevTrack.fadeOut(0.22); } catch {}
                }
                if (prevStop) {
                    window.setTimeout(() => { try { prevStop(); } catch {} }, 260);
                }
            });
            return;
        }

        if (this.audio.currentStop && this.audio.currentBgm !== 'gameover') {
            try {
                if (this.audio.currentTrack && this.audio.currentTrack.fadeOut) this.audio.currentTrack.fadeOut(0.22);
            } catch {}
            const stopOld = this.audio.currentStop;
            window.setTimeout(() => { try { stopOld(); } catch {} }, 260);
        }

        if (next === 'gameover') {
            this.audio.currentBgm = next;
            this.audio.currentStop = null;
            this.audio.currentTrack = null;
            return;
        }

        const track = this._buildBgm(next);
        this.audio.currentTrack = track;
        this.audio.currentStop = track.stop;
        this.audio.currentBgm = next;

        const t = ctx.currentTime;
        track.gain.gain.cancelScheduledValues(t);
        track.gain.gain.setValueAtTime(0.0001, t);
        track.gain.gain.linearRampToValueAtTime(0.85, t + 0.26);
    }

    _syncBgm() {
        this._applyBgmState(this._desiredBgmState());
    }

    _safeJsonParse(raw, fallback) {
        if (!raw) return fallback;
        try {
            const v = JSON.parse(raw);
            return v == null ? fallback : v;
        } catch {
            return fallback;
        }
    }

    _storageGet(key, fallback) {
        try {
            return this._safeJsonParse(localStorage.getItem(key), fallback);
        } catch {
            return fallback;
        }
    }

    _storageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }

    _todayKey() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    _hash32(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    _escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    _avatarDataUri(name, seed) {
        const h = (this._hash32(String(seed || name || 'x')) % 360);
        const bg = `hsl(${h}, 70%, 46%)`;
        const fg = 'rgba(255,255,255,0.95)';
        const text = (String(name || '星').trim() || '星').slice(0, 2);
        const svg =
            `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
            `<defs><radialGradient id="g" cx="30%" cy="25%" r="80%"><stop offset="0%" stop-color="rgba(255,255,255,0.28)"/><stop offset="60%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>` +
            `<rect width="96" height="96" rx="22" fill="${bg}"/>` +
            `<rect width="96" height="96" rx="22" fill="url(#g)"/>` +
            `<text x="48" y="58" text-anchor="middle" font-family="Segoe UI, Arial" font-size="34" font-weight="900" fill="${fg}">${this._escapeHtml(text)}</text>` +
            `</svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    _getOrCreateProfile() {
        const key = 'fp_profile_v1';
        const p = this._storageGet(key, null);
        if (p && p.id && p.nickname && p.avatar) return p;
        const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + String(Math.floor(Math.random() * 1e9));
        const nickname = `游客${String(id).slice(-4)}`;
        const avatar = this._avatarDataUri(nickname, id);
        const next = { id, nickname, avatar };
        this._storageSet(key, next);
        return next;
    }

    _loadStats() {
        const s = this._storageGet('fp_stats_v1', {});
        if (!s || typeof s !== 'object') return this._normalizeStats({});
        return this._normalizeStats(s);
    }

    _saveStats(next) {
        this._storageSet('fp_stats_v1', this._normalizeStats(next || {}));
    }

    _ensureBots() {
        const key = 'fp_bots_v1';
        const existing = this._storageGet(key, null);
        if (Array.isArray(existing) && existing.length >= 120) return existing;
        const names = ['星尘跑者', '霓虹守卫', '轨道旅人', '量子小队', '宇宙手势侠', '光子修复师', '银河工程师', '彗星追击者', '能量搬运工', '星门守护者', '电弧指挥官', '星环舞者', '极光研究员', '蓝焰玩家', '星球点灯人', '超频训练官', '暗物质搬砖', '星海探测员', '星云观察者', '闪光新星'];
        const bots = [];
        for (let i = 0; i < 160; i++) {
            const id = `bot_${i}_${this._hash32(String(i) + 'fp')}`;
            const base = names[i % names.length];
            const nickname = `${base}${String(i + 1).padStart(2, '0')}`;
            const avatar = this._avatarDataUri(nickname, id);
            const totalEnergy = 40 + (this._hash32(id) % 18000);
            const bestScore = 18 + (this._hash32(id + 'best') % 120);
            const isFriend = (this._hash32(id + 'f') % 100) < 35;
            bots.push({ id, nickname, avatar, totalEnergy, bestScore, isFriend });
        }
        this._storageSet(key, bots);
        return bots;
    }

    _topTitles(rank) {
        if (rank === 1) return '指尖大师';
        if (rank === 2) return '星球之光';
        if (rank === 3) return '能量先锋';
        return '';
    }

    _planetPercentFromEnergy(totalEnergy) {
        return Math.min(100, Math.floor((Number(totalEnergy) || 0) / 5));
    }

    _todayBestForPlayer(stats) {
        const day = this._todayKey();
        const map = stats && stats.todayBest && typeof stats.todayBest === 'object' ? stats.todayBest : {};
        const v = Number(map[day]);
        return Number.isFinite(v) ? v : 0;
    }

    _setTodayBestForPlayer(stats, score) {
        const day = this._todayKey();
        if (!stats.todayBest || typeof stats.todayBest !== 'object') stats.todayBest = {};
        stats.todayBest[day] = Math.max(Number(stats.todayBest[day]) || 0, Number(score) || 0);
    }

    _botsTodayBest(botId) {
        const day = this._todayKey();
        const h = this._hash32(`${botId}_${day}_today`);
        return 8 + (h % 130);
    }

    _buildLeaderboard(tab, metric) {
        const stats = this._loadStats();
        const totalEnergy = this._statGetTotalEnergy(stats);
        const planetPercent = this._planetPercentFromEnergy(totalEnergy);
        const bestScore = Number(stats.bestScore) || 0;
        const todayBest = this._todayBestForPlayer(stats);
        const selfRankTier = this._statGetCurrentRank(stats);

        const all = [];
        for (const b of this.bots || []) {
            const pp = this._planetPercentFromEnergy(b.totalEnergy);
            const tier = this._rankByEnergyOnly(Number(b.totalEnergy) || 0);
            const entry = {
                id: b.id,
                nickname: b.nickname,
                avatar: b.avatar,
                bestScore: Number(b.bestScore) || 0,
                totalEnergy: Number(b.totalEnergy) || 0,
                planetPercent: pp,
                todayBest: this._botsTodayBest(b.id),
                rankTier: tier,
                rankName: this._rankMeta(tier).name,
                rankTitle: this._rankMeta(tier).title,
                isSelf: false,
                isFriend: !!b.isFriend
            };
            all.push(entry);
        }

        all.push({
            id: this.profile.id,
            nickname: this.profile.nickname,
            avatar: this.profile.avatar,
            bestScore,
            totalEnergy,
            planetPercent,
            todayBest,
            rankTier: selfRankTier,
            rankName: this._rankMeta(selfRankTier).name,
            rankTitle: this._rankMeta(selfRankTier).title,
            isSelf: true,
            isFriend: true
        });

        let list = all;
        if (tab === 'friends') list = all.filter(e => e.isFriend);

        let sortKey = 'todayBest';
        if (tab === 'total') sortKey = (metric === 'totalEnergy') ? 'totalEnergy' : 'bestScore';
        if (tab === 'today') sortKey = 'todayBest';

        list.sort((a, b) => {
            const da = Number(a[sortKey]) || 0;
            const db = Number(b[sortKey]) || 0;
            if (db !== da) return db - da;
            const pa = Number(a.planetPercent) || 0;
            const pb = Number(b.planetPercent) || 0;
            if (pb !== pa) return pb - pa;
            return String(a.id).localeCompare(String(b.id));
        });

        const selfIndex = list.findIndex(e => e.id === this.profile.id);
        const selfRank = selfIndex >= 0 ? (selfIndex + 1) : null;
        return { list, selfRank, sortKey };
    }

    _renderLeaderboard() {
        if (!this.lbPanel || this.lbPanel.classList.contains('hidden')) return;
        const tab = this.lbState.tab;
        if (this.lbControls) {
            if (tab === 'total') this.lbControls.classList.remove('hidden');
            else this.lbControls.classList.add('hidden');
        }

        const metric = this.lbState.totalMetric;
        const data = this._buildLeaderboard(tab, metric);
        const top = data.list.slice(0, 20);

        const label = (tab === 'today') ? '今日最佳' : (tab === 'total' ? (metric === 'totalEnergy' ? '累计能量' : '最高单局') : '好友');
        const headerNote = (tab === 'friends') ? '（示例）' : '';

        const rows = top.map((e, idx) => {
            const r = idx + 1;
            const title = this._topTitles(r);
            const mainVal = (tab === 'today')
                ? `${Number(e.todayBest) || 0}`
                : (tab === 'total'
                    ? `${Number(metric === 'totalEnergy' ? e.totalEnergy : e.bestScore) || 0}`
                    : `${Number(e.todayBest) || 0}`);
            const sub = `星球 ${Number(e.planetPercent) || 0}%`;
            const badge = title ? `<span class="lb-badge">${this._escapeHtml(title)}</span>` : '';
            const tier = Number.isFinite(Number(e.rankTier)) ? Math.min(8, Math.max(1, Math.floor(Number(e.rankTier)))) : 1;
            const [a, b] = this._rankColors(tier);
            const g = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.52) 0%, ${a} 28%, ${b} 62%, rgba(0,0,0,0.20) 100%)`;
            const planetBadge = `<span class="lb-planet-badge" style="background:${this._escapeHtml(g)}" title="${this._escapeHtml(this._rankMeta(tier).name)}"></span>`;
            const tierBadge = `<span class="lb-tier" title="${this._escapeHtml(this._rankMeta(tier).title)}">${planetBadge}${this._escapeHtml(this._rankMeta(tier).name)}</span>`;
            const strong = e.isSelf ? ' style="box-shadow: 0 0 0 1px rgba(255,211,90,0.22), 0 10px 22px rgba(255,211,90,0.08);"' : '';
            return (
                `<div class="lb-row"${strong}>` +
                `<div class="lb-rank">${r}</div>` +
                `<img class="lb-avatar" src="${e.avatar}" alt="">` +
                `<div class="lb-name">${this._escapeHtml(e.nickname)}${tierBadge}${badge}</div>` +
                `<div class="lb-meta">${this._escapeHtml(label)}${headerNote}: ${mainVal}<div class="lb-sub">${this._escapeHtml(sub)}</div></div>` +
                `</div>`
            );
        }).join('');

        if (this.lbList) {
            const tip = (tab === 'friends') ? `<div class="lb-sub" style="padding: 0 6px 8px 6px;">好友排行需要抖音关系链支持，当前为示例数据。</div>` : '';
            this.lbList.innerHTML = tip + rows;
        }

        if (this.lbSelf) {
            const self = data.list.find(e => e.id === this.profile.id);
            if (!self) {
                this.lbSelf.innerHTML = '';
            } else {
                const rank = data.selfRank || '-';
                const mainVal = (tab === 'today')
                    ? `${Number(self.todayBest) || 0}`
                    : (tab === 'total'
                        ? `${Number(metric === 'totalEnergy' ? self.totalEnergy : self.bestScore) || 0}`
                        : `${Number(self.todayBest) || 0}`);
                const sub = `星球 ${Number(self.planetPercent) || 0}%`;
                const tier = Number.isFinite(Number(self.rankTier)) ? Math.min(8, Math.max(1, Math.floor(Number(self.rankTier)))) : 1;
                const [a, b] = this._rankColors(tier);
                const g = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.52) 0%, ${a} 28%, ${b} 62%, rgba(0,0,0,0.20) 100%)`;
                const planetBadge = `<span class="lb-planet-badge" style="background:${this._escapeHtml(g)}" title="${this._escapeHtml(this._rankMeta(tier).name)}"></span>`;
                const tierBadge = `<span class="lb-tier" title="${this._escapeHtml(this._rankMeta(tier).title)}">${planetBadge}${this._escapeHtml(this._rankMeta(tier).name)}</span>`;
                this.lbSelf.innerHTML =
                    `<div class="lb-row">` +
                    `<div class="lb-rank">${rank}</div>` +
                    `<img class="lb-avatar" src="${self.avatar}" alt="">` +
                    `<div class="lb-name">${this._escapeHtml(self.nickname)}${tierBadge}</div>` +
                    `<div class="lb-meta">我的: ${mainVal}<div class="lb-sub">${this._escapeHtml(sub)}</div></div>` +
                    `</div>`;
            }
        }
    }

    _openLeaderboard(tab) {
        this.lbState.tab = tab || 'today';
        if (this.lbBackdrop) this.lbBackdrop.classList.remove('hidden');
        if (this.lbPanel) this.lbPanel.classList.remove('hidden');
        if (this.lbPanel) {
            const tabs = this.lbPanel.querySelectorAll('.lb-tab');
            tabs.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === this.lbState.tab));
        }
        if (this.lbPanel) {
            const metrics = this.lbPanel.querySelectorAll('.lb-metric');
            metrics.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-metric') === this.lbState.totalMetric));
        }
        this._renderLeaderboard();
    }

    _closeLeaderboard() {
        if (this.lbBackdrop) this.lbBackdrop.classList.add('hidden');
        if (this.lbPanel) this.lbPanel.classList.add('hidden');
    }

    _showLbToast(text) {
        if (!this.lbToast) return;
        this.lbToast.innerText = text;
        this.lbToast.classList.remove('hidden');
        window.setTimeout(() => {
            if (!this.lbToast) return;
            this.lbToast.classList.add('hidden');
            this.lbToast.innerText = '';
        }, 2600);
    }

    _setTouchGesture(gesture) {
        if (!this.obstacleIcons[gesture]) return;
        this.touchGesture = gesture;
        if (this.touchControls) {
            this.touchControls.querySelectorAll('.touch-gesture-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.getAttribute('data-gesture') === gesture);
            });
        }
        if (this.inputMode === 'touch' && this.statusElement && this.isPlaying) {
            this.statusElement.innerText = this.translateGesture(gesture);
        }
    }

    _syncTouchGestureButtons() {
        if (!this.touchControls) return;
        const showLike = this.inputMode === 'touch' && this.gameMode === 'repair';
        const likeBtn = this.touchControls.querySelector('[data-gesture="like"]');
        if (likeBtn) likeBtn.classList.toggle('hidden', !showLike);
        if (!showLike && this.touchGesture === 'like') this.touchGesture = 'rock';
    }

    _setInputMode(mode) {
        this.inputMode = mode === 'touch' ? 'touch' : 'camera';
        if (this.touchControls) this.touchControls.classList.toggle('hidden', this.inputMode !== 'touch');
        this._syncTouchGestureButtons();
        if (this.inputMode === 'touch') this._setTouchGesture(this.touchGesture || 'rock');
    }

    _getCurrentGesture() {
        if (this.inputMode === 'touch') return this.touchGesture || 'rock';
        return this.detector.getGesture();
    }

    _isAndroid() {
        return /android/.test(this.ua || '');
    }

    _isDouyinWebView() {
        const ua = this.ua || '';
        return /aweme|douyin|news_article/.test(ua);
    }

    _browserOpenTipText() {
        if (!this._isAndroid() || !this._isDouyinWebView()) return '';
        return '当前为抖音内打开，部分安卓机型可能无法正常调起摄像头。若点击授权后仍无法开启，请点右上角“在浏览器打开”后再进入游戏。';
    }

    _renderBrowserOpenTip(text) {
        if (!this.browserOpenTip) return;
        const tip = text || this._browserOpenTipText();
        if (!tip) {
            this.browserOpenTip.classList.add('hidden');
            this.browserOpenTip.innerText = '';
            return;
        }
        this.browserOpenTip.classList.remove('hidden');
        this.browserOpenTip.innerText = tip;
    }

    _secureContextHint() {
        const host = String(location && location.hostname ? location.hostname : '');
        const local = host === 'localhost' || host === '127.0.0.1';
        if (window.isSecureContext === true) return '';
        if (local) return '';
        return '手机端访问需要 HTTPS 才能调用摄像头。可用 https 域名（如内网 https / 反向代理）或在手机浏览器打开已启用 https 的地址。';
    }

    _renderCameraPermissionUi() {
        if (!this.cameraPermissionWrap) return;
        const has = this.detector && typeof this.detector.hasStream === 'function' ? this.detector.hasStream() : !!(this.detector && this.detector.video && this.detector.video.srcObject);
        if (has) {
            this.cameraPermissionWrap.classList.add('hidden');
            this._renderBrowserOpenTip('');
            return;
        }

        const secureHint = this._secureContextHint();
        const noApi = !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia;
        this.cameraPermissionWrap.classList.remove('hidden');
        this._renderBrowserOpenTip();
        if (this.cameraStatus) {
            if (noApi) {
                this.cameraStatus.innerText = '当前浏览器不支持摄像头接口，请更换 Chrome、Safari 或升级系统后再试。';
            } else if (secureHint) {
                this.cameraStatus.innerText = secureHint;
            } else if (this._isAndroid() && this._isDouyinWebView()) {
                this.cameraStatus.innerText = '抖音内部分安卓机型可能无法直接调起摄像头。你可以先点击下方按钮尝试授权；若仍失败，请改用系统浏览器打开。';
            } else {
                this.cameraStatus.innerText = '开启摄像头后，可通过手势参与游戏。我们不会保存或上传任何画面内容；仅在你主动点击按钮或开始游戏后申请权限。';
            }
        }
    }

    async _ensureCameraBeforePlay() {
        const has = this.detector && typeof this.detector.hasStream === 'function' ? this.detector.hasStream() : !!(this.detector && this.detector.video && this.detector.video.srcObject);
        if (has) return true;
        try {
            await this.detector.requestCamera({ preferBack: false, silent: false, allowFallbackSwap: true });
            this._renderCameraPermissionUi();
            return true;
        } catch (err) {
            this._renderCameraPermissionUi();
            const name = err && err.name ? String(err.name) : '';
            if (name === 'NotAllowedError') {
                this._showLbToast('需要先允许摄像头权限，才能进行手势识别和开始游戏');
            } else if (name === 'NotFoundError') {
                this._showLbToast('未找到可用摄像头设备');
            } else if (String(err && err.message) === 'NotSecureContext') {
                this._showLbToast('当前地址不是 HTTPS，无法调用摄像头');
            } else if (this._isAndroid() && this._isDouyinWebView()) {
                const tip = '抖音内安卓摄像头调用失败，请点右上角“在浏览器打开”后再试';
                this._renderBrowserOpenTip(tip);
                this._showLbToast(tip);
            } else {
                this._showLbToast('摄像头启动失败，请检查权限、HTTPS 地址或设备状态');
            }
            return false;
        }
    }

    _openRankMap() {
        if (this.rankmapBackdrop) this.rankmapBackdrop.classList.remove('hidden');
        if (this.rankmapPanel) this.rankmapPanel.classList.remove('hidden');
        this._renderRankMapState();
        const stats = this._loadStats();
        const cur = this._statGetCurrentRank(stats);
        if (this.rankmapInfo) this.rankmapInfo.innerHTML = this._rankInfoHtml(cur, stats);
    }

    _closeRankMap() {
        if (this.rankmapBackdrop) this.rankmapBackdrop.classList.add('hidden');
        if (this.rankmapPanel) this.rankmapPanel.classList.add('hidden');
    }

    _hideRankup() {
        if (this.rankupOverlay) this.rankupOverlay.classList.add('hidden');
    }

    _showRankup(fromRank, toRank) {
        if (!this.rankupOverlay) return;
        const from = this._rankMeta(fromRank);
        const to = this._rankMeta(toRank);
        if (this.rankupTitle) this.rankupTitle.innerText = `恭喜晋级【${to.name}】！`;
        if (this.rankupSub) this.rankupSub.innerText = `距离太阳又近了一步！解锁称号：${to.title}`;
        if (this.rankupPlanet) this._rankPlanetStyle(this.rankupPlanet, to.rank, false, true);
        this.rankupOverlay.classList.remove('hidden');
        this.playSound(1200, 'square', 0.18);
        window.setTimeout(() => this._hideRankup(), 2600);
    }

    _renderHomeRank() {
        const stats = this._loadStats();
        const energy = this._statGetTotalEnergy(stats);
        const curRank = this._statGetCurrentRank(stats);
        const meta = this._rankMeta(curRank);
        const nextMeta = this._rankMeta(Math.min(8, curRank + 1));

        if (this.homeRankName) this.homeRankName.innerText = meta.name;
        if (this.homeRankTitle) this.homeRankTitle.innerText = meta.title;
        if (this.homeTotalEnergy) this.homeTotalEnergy.innerText = String(energy);
        if (this.homeNextEnergy) this.homeNextEnergy.innerText = String(nextMeta.minEnergy);
        if (this.homeRankSub) {
            const tip = curRank >= 8 ? '你已点亮外环尽头：海王星。' : this._unlockProgressText(curRank + 1, stats);
            this.homeRankSub.innerText = tip || meta.tagline;
        }
        if (this.homeRankPlanet) this._rankPlanetStyle(this.homeRankPlanet, curRank, false, true);

        if (this.gestureStylePanel) {
            if (curRank >= 4) this.gestureStylePanel.classList.remove('hidden');
            else this.gestureStylePanel.classList.add('hidden');
        }
        if (this.gestureStyleNote) {
            this.gestureStyleNote.innerText = curRank >= 4 ? '已解锁' : '火星以上可自定义';
        }

        if (this.dailyRewardBtn) {
            const can = this._canClaimDailyReward(stats);
            if (curRank >= 6 && can) this.dailyRewardBtn.classList.remove('hidden');
            else this.dailyRewardBtn.classList.add('hidden');
        }
    }

    _renderRankMap() {
        if (!this.rankmapOrbits) return;
        const table = this._rankTable();
        const center = 50;
        const baseR = 16;
        const step = 9.6;
        const angles = [220, 300, 25, 140, 70, 200, 330, 120].map(d => (d * Math.PI) / 180);
        const sun = `<div class="rankmap-sun" aria-label="太阳"></div>`;
        const orbits = table.map((it) => {
            const r = baseR + step * (it.rank - 1);
            const size = `${r * 2}%`;
            return `<div class="rankmap-orbit" style="width:${size};height:${size};"></div>`;
        }).join('');
        const planets = table.map((it) => {
            const ang = angles[it.rank - 1] || 0;
            const r = baseR + step * (it.rank - 1);
            const x = center + r * Math.cos(ang);
            const y = center + r * Math.sin(ang);
            return `<button class="rankmap-planet" data-rank="${it.rank}" style="left:${x}%;top:${y}%;" aria-label="${this._escapeHtml(it.name)}"></button>`;
        }).join('');
        this.rankmapOrbits.innerHTML = sun + orbits + planets;
        this.rankmapOrbits.querySelectorAll('.rankmap-planet').forEach((el) => {
            const r = Math.min(8, Math.max(1, Math.floor(Number(el.getAttribute('data-rank')) || 1)));
            el.addEventListener('mouseenter', () => {
                const stats = this._loadStats();
                if (this.rankmapInfo) this.rankmapInfo.innerHTML = this._rankInfoHtml(r, stats);
            });
            el.addEventListener('click', () => {
                const stats = this._loadStats();
                if (this.rankmapInfo) this.rankmapInfo.innerHTML = this._rankInfoHtml(r, stats);
            });
        });
        this._renderRankMapState();
    }

    _renderRankMapState() {
        if (!this.rankmapOrbits) return;
        const stats = this._loadStats();
        const curRank = this._statGetCurrentRank(stats);
        this.rankmapOrbits.querySelectorAll('.rankmap-planet').forEach((el) => {
            const r = Math.min(8, Math.max(1, Math.floor(Number(el.getAttribute('data-rank')) || 1)));
            const locked = r > curRank;
            const current = r === curRank;
            el.classList.toggle('locked', locked);
            el.classList.toggle('current', current);
            this._rankPlanetStyle(el, r, locked, current);
        });
    }

    _rankInfoHtml(rank, stats) {
        const s = this._normalizeStats(stats);
        const meta = this._rankMeta(rank);
        const energy = this._statGetTotalEnergy(s);
        const curRank = this._statGetCurrentRank(s);
        const [a, b] = this._rankColors(meta.rank);
        const g = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.52) 0%, ${a} 28%, ${b} 62%, rgba(0,0,0,0.20) 100%)`;
        const energyText = meta.rank === 8 ? `${meta.minEnergy}+` : `${meta.minEnergy} - ${meta.maxEnergy}`;
        const progress = this._unlockProgressText(meta.rank, s);
        const achieved = rank <= curRank;
        const note = achieved ? '已点亮' : '未点亮';
        const reward = `称号：${meta.title}`;
        const extra = meta.rank === 3 ? '判定：怪兽能量战单局得分≥30算胜利' : (meta.rank === 8 ? '晋级赛判定：普通/怪兽单局得分≥60；修复舱完成100%算胜利' : '');
        return (
            `<div style="display:flex;align-items:center;gap:12px;">` +
            `<div style="width:44px;height:44px;border-radius:16px;flex:none;background:${this._escapeHtml(g)};box-shadow:0 0 0 1px rgba(255,255,255,0.12),0 0 18px rgba(0,255,240,0.10);"></div>` +
            `<div style="flex:1;min-width:0;"><div style="font-weight:900;letter-spacing:0.5px;">${this._escapeHtml(meta.name)} <span style="opacity:0.7;font-weight:800;">· ${note}</span></div>` +
            `<div style="opacity:0.8;margin-top:4px;">能量区间：${this._escapeHtml(energyText)}</div>` +
            `<div style="opacity:0.8;margin-top:4px;">当前总能量：${this._escapeHtml(String(energy))}</div>` +
            `</div>` +
            `</div>` +
            `<div style="margin-top:12px;font-weight:900;">晋级条件</div>` +
            `<div style="opacity:0.82;margin-top:6px;line-height:1.5;">${this._escapeHtml(progress || '无')}</div>` +
            `${extra ? `<div style="opacity:0.7;margin-top:8px;line-height:1.5;">${this._escapeHtml(extra)}</div>` : ''}` +
            `<div style="margin-top:12px;font-weight:900;">奖励预览</div>` +
            `<div style="opacity:0.82;margin-top:6px;line-height:1.5;">${this._escapeHtml(reward)}</div>`
        );
    }

    _canClaimDailyReward(stats) {
        const s = this._normalizeStats(stats);
        const day = this._todayKey();
        return String(s.last_daily_reward || '') !== day;
    }

    _claimDailyReward() {
        const stats = this._loadStats();
        const curRank = this._statGetCurrentRank(stats);
        if (curRank < 6) return;
        if (!this._canClaimDailyReward(stats)) return;
        const bonus = 180 + Math.max(0, curRank - 6) * 40;
        const energy = this._statGetTotalEnergy(stats);
        this._statSetTotalEnergy(stats, energy + bonus);
        stats.last_daily_reward = this._todayKey();
        stats.lastDailyReward = stats.last_daily_reward;
        this._saveStats(stats);
        this.totalEnergy = this._statGetTotalEnergy(stats);
        this._renderHomeRank();
        this._renderRankMapState();
        this._renderLeaderboard();
        this._showLbToast(`🎁 段位奖励已领取：+${bonus} 能量`);
    }

    _saveGestureStyleFromUi() {
        const stats = this._loadStats();
        const curRank = this._statGetCurrentRank(stats);
        if (curRank < 4) return;
        const c = this._normalizeHexColor(this.gestureFrameColorInput ? this.gestureFrameColorInput.value : '');
        if (!c) return;
        stats.gesture_style = stats.gesture_style && typeof stats.gesture_style === 'object' ? stats.gesture_style : {};
        stats.gesture_style.frameColor = c.toUpperCase();
        stats.gesture_style.glow = true;
        this._saveStats(stats);
        this._applyDebugStyleFromStats(stats);
        this._showLbToast('已更新识别框特效');
    }

    setRepairDifficulty(diff) {
        const d = (diff === 'easy' || diff === 'normal' || diff === 'hard') ? diff : 'easy';
        this.repairDifficulty = d;
        this._storageSet('fp_repair_diff', d);
        this._renderRepairDifficultyUi();
    }

    _getRepairDifficulty() {
        const v = this._storageGet('fp_repair_diff', 'easy');
        return (v === 'easy' || v === 'normal' || v === 'hard') ? v : 'easy';
    }

    _repairDifficultyPreset(diff) {
        const d = (diff === 'easy' || diff === 'normal' || diff === 'hard') ? diff : 'easy';
        if (d === 'easy') return { key: 'easy', name: '简单', holdNeedFrames: 18, timeSeconds: 70, progressStep: 14, energyPerSuccess: 3, note: '简单：更容易点亮进度' };
        if (d === 'normal') return { key: 'normal', name: '标准', holdNeedFrames: 24, timeSeconds: 60, progressStep: 12.5, energyPerSuccess: 3, note: '标准：平衡节奏与准确' };
        return { key: 'hard', name: '困难', holdNeedFrames: 30, timeSeconds: 55, progressStep: 10, energyPerSuccess: 4, note: '困难：更稳更快，点亮更慢' };
    }

    _renderRepairDifficultyUi() {
        if (!this.repairDiffWrap) return;
        this.repairDifficulty = this._getRepairDifficulty();
        const btns = Array.from(this.repairDiffWrap.querySelectorAll('.difficulty-btn'));
        btns.forEach((btn) => {
            const d = btn.getAttribute('data-diff') || 'easy';
            const on = d === this.repairDifficulty;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        const preset = this._repairDifficultyPreset(this.repairDifficulty);
        if (this.repairDiffNote) this.repairDiffNote.innerText = preset ? preset.note : '';
    }

    _ensureBackground() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (!w || !h) return;
        if (this.bg.w === w && this.bg.h === h && this.bg.stars.length) return;
        this.bg.w = w;
        this.bg.h = h;
        this.bg.t = 0;
        this.bg.stars = [];
        this.bg.nebula = [];
        this.bg.comets = [];
        this.bg.sparkles = [];
        this.bg.city = [];
        this.bg.city2 = [];
        this.bg.cityScroll = 0;
        this.bg.city2Scroll = 0;
        this.bg.cityCanvas = null;
        this.bg.city2Canvas = null;
        this.bg.cityCanvasH = 0;
        this.bg.city2CanvasH = 0;
        this.bg.scanCanvas = null;
        this.bg.scanH = 0;

        const starCount = Math.max(70, Math.min(140, Math.floor((w * h) * 0.00006)));
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h * 0.78;
            const r = Math.random() * 1.6 + 0.3;
            const a = Math.random() * 0.65 + 0.08;
            const tw = Math.random() * 0.025 + 0.006;
            const ph = Math.random() * Math.PI * 2;
            this.bg.stars.push({ x, y, r, a, tw, ph });
        }

        const nebulaCount = 3;
        for (let i = 0; i < nebulaCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h * 0.7;
            const r = Math.random() * (Math.min(w, h) * 0.35) + Math.min(w, h) * 0.18;
            const hue = Math.floor(Math.random() * 360);
            const a = Math.random() * 0.12 + 0.04;
            const vx = (Math.random() - 0.5) * 0.06;
            const vy = (Math.random() - 0.5) * 0.04;
            this.bg.nebula.push({ x, y, r, hue, a, vx, vy });
        }

        const sparkleCount = Math.max(14, Math.min(28, Math.floor((w * h) * 0.000012)));
        for (let i = 0; i < sparkleCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h * 0.82;
            const r = Math.random() * 1.4 + 0.6;
            const a = Math.random() * 0.35 + 0.12;
            const ph = Math.random() * Math.PI * 2;
            const vy = -(Math.random() * 0.18 + 0.06);
            const vx = (Math.random() - 0.5) * 0.08;
            this.bg.sparkles.push({ x, y, r, a, ph, vx, vy });
        }

        const makeCityLayer = (count, minW, maxW, minH, maxH, baseY) => {
            const list = [];
            let x = 0;
            for (let i = 0; i < count; i++) {
                const bw = Math.random() * (maxW - minW) + minW;
                const bh = Math.random() * (maxH - minH) + minH;
                const shade = Math.random() * 0.18 + 0.06;
                const lights = Math.random() * 0.7 + 0.2;
                const seed = Math.floor(Math.random() * 2147483647);
                list.push({ x, w: bw, h: bh, shade, lights, baseY, seed });
                x += bw;
            }
            return { list, totalW: x };
        };

        const baseY = Math.floor(h * 0.72);
        const l1 = makeCityLayer(28, 40, 110, 60, 240, baseY);
        const l2 = makeCityLayer(38, 24, 80, 40, 180, baseY + 16);
        this.bg.city = l1.list;
        this.bg.cityW = l1.totalW;
        this.bg.city2 = l2.list;
        this.bg.city2W = l2.totalW;
        this._renderCityCaches();
        this._renderScanlines();
    }

    _renderScanlines() {
        const h = 256;
        const c = document.createElement('canvas');
        c.width = 2;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        for (let y = 0; y < h; y++) {
            const mod = y % 6;
            const a = mod === 0 ? 0.22 : (mod === 1 ? 0.06 : 0);
            if (a <= 0) continue;
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fillRect(0, y, c.width, 1);
        }
        this.bg.scanCanvas = c;
        this.bg.scanH = h;
    }

    _renderCityCaches() {
        const buildLayer = (list, totalW) => {
            const c = document.createElement('canvas');
            const w = Math.max(1, Math.ceil(totalW));
            const maxH = list.reduce((m, b) => Math.max(m, b.h), 0);
            const h = Math.max(1, Math.ceil(maxH + 30));
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');

            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.globalAlpha = 1;
            for (const b of list) {
                const x = b.x;
                const y = h - b.h;
                ctx.fillStyle = `rgba(0,0,0,${0.48 + b.shade})`;
                ctx.fillRect(x, y, b.w, b.h);

                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                ctx.fillRect(x, h - 4, b.w, 4);

                const wx = Math.max(2, Math.floor(b.w / 18));
                const wy = Math.max(2, Math.floor(b.h / 22));
                const padX = (b.w - wx * 6) / 2;
                const padY = 12;
                let r = (b.seed ^ 0x9e3779b9) >>> 0;
                const next = () => {
                    r = (r * 1664525 + 1013904223) >>> 0;
                    return r / 4294967296;
                };
                for (let yy = 0; yy < wy; yy++) {
                    for (let xx = 0; xx < wx; xx++) {
                        if (next() < 0.45 * b.lights) continue;
                        ctx.globalAlpha = 0.22 + next() * 0.18;
                        ctx.fillStyle = 'rgba(255,255,255,1)';
                        ctx.fillRect(x + padX + xx * 6, y + padY + yy * 10, 2.2, 4.2);
                    }
                }
                ctx.globalAlpha = 1;
            }
            ctx.restore();
            return { canvas: c, h };
        };

        const l1 = buildLayer(this.bg.city, this.bg.cityW);
        const l2 = buildLayer(this.bg.city2, this.bg.city2W);
        this.bg.cityCanvas = l1.canvas;
        this.bg.cityCanvasH = l1.h;
        this.bg.city2Canvas = l2.canvas;
        this.bg.city2CanvasH = l2.h;
    }

    _spawnComet(theme) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const y = Math.random() * h * 0.5;
        const x = w + 120;
        const vx = -(Math.random() * 5 + 6);
        const vy = (Math.random() * 0.8 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
        const life = 1;
        const len = (theme === 'fever' ? 220 : 140) + Math.random() * 120;
        const hue = theme === 'fever' ? 18 : (theme === 'boss' ? 300 : 210);
        this.bg.comets.push({ x, y, vx, vy, life, len, hue });
    }

    _updateBackground(theme, speedScale) {
        this._ensureBackground();
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (!w || !h) return;
        const t = this.runner.frame;
        this.bg.t = t;

        for (const n of this.bg.nebula) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < -n.r) n.x = w + n.r;
            if (n.x > w + n.r) n.x = -n.r;
            if (n.y < -n.r) n.y = h * 0.7 + n.r;
            if (n.y > h * 0.7 + n.r) n.y = -n.r;
        }

        const sp = theme === 'fever' ? 1.4 : (theme === 'boss' ? 1.15 : 1);
        for (const s of this.bg.sparkles) {
            s.x += s.vx * sp;
            s.y += s.vy * sp;
            if (s.y < -30) s.y = h + 30;
            if (s.x < -30) s.x = w + 30;
            if (s.x > w + 30) s.x = -30;
        }

        const spd = (this.speed || 0) * (Number.isFinite(speedScale) ? speedScale : 1);
        const px1 = Math.max(0.2, Math.min(2.6, spd * 0.12));
        const px2 = Math.max(0.15, Math.min(2.2, spd * 0.08));
        this.bg.cityScroll = (this.bg.cityScroll + px1) % Math.max(1, this.bg.cityW);
        this.bg.city2Scroll = (this.bg.city2Scroll + px2) % Math.max(1, this.bg.city2W);

        if (this.bg.comets.length < 3) {
            const p = theme === 'fever' ? 0.06 : (theme === 'boss' ? 0.03 : 0.012);
            if (Math.random() < p) this._spawnComet(theme);
        }
        for (let i = this.bg.comets.length - 1; i >= 0; i--) {
            const c = this.bg.comets[i];
            c.x += c.vx;
            c.y += c.vy;
            c.life -= theme === 'fever' ? 0.018 : 0.012;
            if (c.x < -c.len || c.y < -100 || c.y > h + 100 || c.life <= 0) this.bg.comets.splice(i, 1);
        }
    }

    _themeKey() {
        if (this.gameMode === 'repair') return 'repair';
        if (this.isBossPhase) return 'boss';
        if (this.isFeverMode) return 'fever';
        if (this.gameMode === 'challenge') return 'challenge';
        return 'normal';
    }

    _themeColors(key) {
        if (key === 'fever') {
            return { top: '#25002a', bottom: '#030015', accent: 'rgba(0, 255, 240, 0.85)', glow: 'rgba(255, 211, 90, 0.90)', hue: 300 };
        }
        if (key === 'boss') {
            return { top: '#140022', bottom: '#02000a', accent: 'rgba(0, 255, 240, 0.78)', glow: 'rgba(180, 120, 255, 0.85)', hue: 285 };
        }
        if (key === 'repair') {
            return { top: '#061a3a', bottom: '#00000a', accent: 'rgba(0, 255, 240, 0.80)', glow: 'rgba(120, 190, 255, 0.85)', hue: 210 };
        }
        if (key === 'challenge') {
            return { top: '#090018', bottom: '#00000a', accent: 'rgba(0, 255, 240, 0.70)', glow: 'rgba(255, 112, 170, 0.78)', hue: 320 };
        }
        const hue = (this.score * 2) % 360;
        return { top: `hsl(${(hue + 210) % 360}, 60%, 16%)`, bottom: '#00000a', accent: 'rgba(0, 255, 240, 0.68)', glow: 'rgba(255, 211, 90, 0.70)', hue: (hue + 210) % 360 };
    }

    _drawStar(x, y, r, rot, fill, stroke, alpha) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot || 0);
        ctx.globalAlpha = Number.isFinite(alpha) ? alpha : 1;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI) / 5;
            const rr = (i % 2 === 0) ? r : r * 0.45;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawHudFrame(key) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const c = this._themeColors(key);

        ctx.save();
        ctx.globalAlpha = 0.25;
        const vg = ctx.createRadialGradient(w * 0.5, h * 0.52, Math.min(w, h) * 0.25, w * 0.5, h * 0.52, Math.min(w, h) * 0.78);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = c.accent;
        const pad = 22;
        const len = Math.min(120, Math.floor(Math.min(w, h) * 0.18));
        const corners = [
            [pad, pad, 1, 1],
            [w - pad, pad, -1, 1],
            [pad, h - pad, 1, -1],
            [w - pad, h - pad, -1, -1]
        ];
        for (const [x, y, sx, sy] of corners) {
            ctx.beginPath();
            ctx.moveTo(x, y + sy * len);
            ctx.lineTo(x, y);
            ctx.lineTo(x + sx * len, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawHoloGrid(key, hy) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const c = this._themeColors(key);
        const vpX = w * 0.52;
        const vpY = h * 0.18;
        const baseY = Math.min(h, hy + 120);
        const left = -w * 0.08;
        const right = w * 1.08;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1;

        const cols = 10;
        for (let i = 0; i <= cols; i++) {
            const t = i / cols;
            const x = left + (right - left) * t;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(vpX, vpY);
            ctx.stroke();
        }

        const rows = 9;
        for (let i = 0; i <= rows; i++) {
            const t = i / rows;
            const y = baseY - t * (baseY - vpY);
            const k = (y - vpY) / (baseY - vpY);
            const xl = vpX + (left - vpX) * k;
            const xr = vpX + (right - vpX) * k;
            ctx.globalAlpha = 0.10 + 0.12 * (1 - t);
            ctx.beginPath();
            ctx.moveTo(xl, y);
            ctx.lineTo(xr, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    _drawScanlines(key) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (!this.bg.scanCanvas) return;
        const c = this._themeColors(key);
        const yOff = ((this.bg.t * 0.55) % this.bg.scanH);
        ctx.save();
        ctx.globalAlpha = key === 'fever' ? 0.16 : 0.12;
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(this.bg.scanCanvas, 0, yOff, this.bg.scanCanvas.width, this.bg.scanH - yOff, 0, 0, w, h * ((this.bg.scanH - yOff) / this.bg.scanH));
        if (yOff > 0) {
            ctx.drawImage(this.bg.scanCanvas, 0, 0, this.bg.scanCanvas.width, yOff, 0, h * ((this.bg.scanH - yOff) / this.bg.scanH), w, h * (yOff / this.bg.scanH));
        }
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = c.accent;
        const bandY = (Math.sin(this.bg.t * 0.01) * 0.5 + 0.5) * h * 0.55;
        ctx.fillRect(0, bandY, w, 2);
        ctx.restore();
    }

    _drawStickers(key) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const t = this.bg.t;
        const bob = Math.sin(t * 0.02) * 6;
        this._drawStar(w * 0.12, h * 0.22 + bob, 18, t * 0.01, 'rgba(255, 211, 90, 0.95)', 'rgba(255,255,255,0.55)', 0.95);
        this._drawStar(w * 0.90, h * 0.18 - bob, 14, -t * 0.012, 'rgba(255, 211, 90, 0.92)', 'rgba(255,255,255,0.55)', 0.92);
    }

    _drawOrbits(key, hy) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const c = this._themeColors(key);
        const cx = w * 0.73;
        const cy = hy - h * 0.22;
        const r = Math.min(w, h) * 0.30;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = c.accent;
        ctx.shadowBlur = 18;
        ctx.shadowColor = c.accent;
        ctx.lineWidth = 2;
        const wobble = Math.sin(this.bg.t * 0.008) * 0.08;
        for (let i = 0; i < 3; i++) {
            const rr = r * (0.78 + i * 0.18);
            ctx.beginPath();
            ctx.ellipse(cx, cy, rr, rr * (0.62 + wobble), (0.55 + i * 0.22), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        const starCount = key === 'fever' ? 4 : 3;
        for (let i = 0; i < starCount; i++) {
            const ang = this.bg.t * (0.006 + i * 0.0015) + i * 2.1;
            const rr = r * (0.82 + i * 0.12);
            const x = cx + Math.cos(ang) * rr;
            const y = cy + Math.sin(ang) * rr * 0.62;
            const s = key === 'fever' ? 16 : 14;
            this._drawStar(x, y, s, ang, 'rgba(255, 211, 90, 0.95)', 'rgba(255,255,255,0.65)', 0.92);
        }
    }

    _drawRoadEnergy(key, roadTop, roadBottom) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const c = this._themeColors(key);
        const baseY = roadTop + 34;
        const spanY = Math.max(60, Math.min(160, roadBottom - roadTop - 60));
        const t = this.runner.frame;
        const count = key === 'fever' ? 22 : 14;
        const speed = key === 'fever' ? 2.2 : 1.2;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 18;
        ctx.shadowColor = c.accent;
        for (let i = 0; i < count; i++) {
            const phase = (t * 0.02 * speed + i * 0.7) % 1;
            const x = w - phase * (w + 240);
            const y = baseY + (i % 6) * (spanY / 6) + Math.sin(t * 0.03 + i) * 6;
            const r = (key === 'fever' ? 3.2 : 2.6) + (i % 3) * 0.6;
            ctx.globalAlpha = 0.18 + (i % 4) * 0.05;
            ctx.fillStyle = c.accent;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            if (i % 4 === 0) {
                ctx.globalAlpha *= 0.55;
                ctx.strokeStyle = c.glow;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(x, y, r + 6 + (t % 10) * 0.15, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();

        if (key === 'fever') {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.22;
            ctx.strokeStyle = c.glow;
            ctx.lineWidth = 2;
            const cx = w * 0.42;
            const cy = roadTop + 70;
            const rr = Math.min(w, h) * 0.18;
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * Math.PI * 2 + t * 0.015;
                ctx.beginPath();
                ctx.arc(cx, cy, rr, a, a + 0.18);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    _drawBackdrop(key, horizonY) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const c = this._themeColors(key);
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, c.top);
        grd.addColorStop(1, c.bottom);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const n of this.bg.nebula) {
            const g = ctx.createRadialGradient(n.x, n.y, n.r * 0.15, n.x, n.y, n.r);
            g.addColorStop(0, `hsla(${(n.hue + c.hue) % 360}, 85%, 60%, ${n.a})`);
            g.addColorStop(1, `hsla(${(n.hue + c.hue) % 360}, 85%, 30%, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#ffffff';
        for (const s of this.bg.stars) {
            const tw = Math.sin(this.bg.t * s.tw + s.ph) * 0.4 + 0.6;
            ctx.globalAlpha = s.a * tw;
            if (s.r < 1.05) {
                ctx.fillRect(s.x, s.y, 1, 1);
            } else {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 16;
        ctx.shadowColor = c.accent;
        for (const sp of this.bg.sparkles) {
            const tw = Math.sin(this.bg.t * 0.03 + sp.ph) * 0.45 + 0.55;
            ctx.globalAlpha = sp.a * tw;
            ctx.fillStyle = c.accent;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const cm of this.bg.comets) {
            ctx.strokeStyle = `hsla(${cm.hue}, 95%, 65%, ${Math.max(0, cm.life) * 0.6})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(cm.x, cm.y);
            ctx.lineTo(cm.x + cm.len * 0.9, cm.y - cm.vy * 18);
            ctx.stroke();
        }
        ctx.restore();

        const hy = Number.isFinite(horizonY) ? horizonY : Math.floor(h * 0.72);
        const planetX = w * 0.82;
        const planetY = hy - h * 0.25;
        const pr = Math.min(w, h) * 0.22;
        ctx.save();
        const pg = ctx.createRadialGradient(planetX - pr * 0.25, planetY - pr * 0.25, pr * 0.1, planetX, planetY, pr);
        pg.addColorStop(0, `hsla(${(c.hue + 40) % 360}, 90%, 60%, 0.35)`);
        pg.addColorStop(0.6, `hsla(${(c.hue + 180) % 360}, 80%, 35%, 0.10)`);
        pg.addColorStop(1, `hsla(${(c.hue + 220) % 360}, 70%, 20%, 0)`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(planetX, planetY, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this._drawOrbits(key, hy);
        this._drawHoloGrid(key, hy);

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1;
        const beamCount = key === 'fever' ? 10 : 7;
        const sway = Math.sin(this.bg.t * 0.01) * 40;
        for (let i = 0; i < beamCount; i++) {
            const x0 = (i / beamCount) * w + sway;
            ctx.beginPath();
            ctx.moveTo(x0, 0);
            ctx.lineTo(x0 - w * 0.22, hy);
            ctx.stroke();
        }
        ctx.restore();

        const drawStrip = (canvas, stripH, scroll, alpha, tintHue, tintAlpha) => {
            if (!canvas) return;
            const sw = canvas.width;
            const sh = canvas.height;
            if (!sw || !sh) return;
            const x0 = -((scroll % sw) + sw) % sw;
            const y0 = hy - sh;
            ctx.save();
            ctx.globalAlpha = alpha;
            for (let x = x0; x < w; x += sw) ctx.drawImage(canvas, x, y0);
            ctx.globalAlpha = alpha * (tintAlpha || 0.18);
            ctx.fillStyle = `hsla(${tintHue}, 95%, 65%, 1)`;
            ctx.fillRect(0, hy - stripH, w, stripH);
            ctx.restore();
        };

        drawStrip(this.bg.city2Canvas, 28, this.bg.city2Scroll, key === 'boss' ? 0.26 : 0.20, (c.hue + 180) % 360, 0.12);
        drawStrip(this.bg.cityCanvas, 40, this.bg.cityScroll, key === 'boss' ? 0.34 : 0.28, (c.hue + 40) % 360, 0.16);

        ctx.save();
        const glow = ctx.createRadialGradient(w * 0.22, hy + 10, 10, w * 0.22, hy + 10, Math.min(w, h) * 0.45);
        glow.addColorStop(0, c.glow);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = key === 'fever' ? 0.35 : 0.22;
        ctx.fillStyle = glow;
        ctx.fillRect(0, hy - 40, w, h - hy + 60);
        ctx.restore();

        if (key === 'fever') {
            ctx.save();
            ctx.globalAlpha = 0.32;
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1.2;
            const centerX = w * 0.35;
            const centerY = h * 0.35;
            for (let i = 0; i < 28; i++) {
                const ang = (i / 28) * Math.PI * 2 + (this.bg.t * 0.002);
                const r1 = Math.min(w, h) * 0.12;
                const r2 = r1 + Math.min(w, h) * 0.34;
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(ang) * r1, centerY + Math.sin(ang) * r1);
                ctx.lineTo(centerX + Math.cos(ang) * r2, centerY + Math.sin(ang) * r2);
                ctx.stroke();
            }
            ctx.restore();
        }

        this._drawHudFrame(key);
        this._drawStickers(key);
        this._drawScanlines(key);
    }

    _startIdleLoop() {
        if (this._idleRaf) return;
        const loop = () => {
            if (this.isPlaying) {
                this._idleRaf = null;
                return;
            }
            this.runner.frame++;
            const key = !this.startScreen.classList.contains('hidden')
                ? 'normal'
                : (!this.repairSetupScreen.classList.contains('hidden') ? 'repair' : 'normal');
            this._updateBackground(key, 0.75);
            this._drawBackdrop(key, Math.floor(this.canvas.height * 0.72));
            this._idleRaf = requestAnimationFrame(loop);
        };
        this._idleRaf = requestAnimationFrame(loop);
    }

    async init() {
        // 设置画布大小
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 绑定按钮
        document.getElementById('normal-mode-btn').addEventListener('click', async () => {
            this._setInputMode('camera');
            this.gameMode = 'normal';
            this._syncTouchGestureButtons();
            const ok = await this._ensureCameraBeforePlay();
            if (!ok) return;
            this.start();
        });
        document.getElementById('challenge-mode-btn').addEventListener('click', async () => {
            this._setInputMode('camera');
            this.gameMode = 'challenge';
            this._syncTouchGestureButtons();
            const ok = await this._ensureCameraBeforePlay();
            if (!ok) return;
            this.start();
        });
        document.getElementById('repair-mode-btn').addEventListener('click', async () => {
            this._setInputMode('camera');
            this.gameMode = 'repair';
            this._syncTouchGestureButtons();
            await this._ensureCameraBeforePlay();
            this.openRepairSetup();
        });
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
        document.getElementById('ai-back-btn').addEventListener('click', () => this.goHome());
        document.getElementById('ai-skip-btn').addEventListener('click', async () => {
            this.aiCoach.enabled = false;
            this.aiPlanPreview.classList.add('hidden');
            if (this.inputMode !== 'touch') {
                const ok = await this._ensureCameraBeforePlay();
                if (!ok) return;
            }
            this.startRepairWithPlan(this.defaultRepairPlan());
        });
        document.getElementById('ai-start-btn').addEventListener('click', async () => {
            const cached = this.getCachedRepairPlan();
            if (this.inputMode !== 'touch') {
                const ok = await this._ensureCameraBeforePlay();
                if (!ok) return;
            }
            this.startRepairWithPlan(cached || this.defaultRepairPlan());
        });
        document.getElementById('ai-generate-btn').addEventListener('click', async () => {
            await this.generateRepairPlan();
        });

        if (this.cameraEnableBtn) this.cameraEnableBtn.addEventListener('click', async () => {
            await this._ensureCameraBeforePlay();
        });

        if (this.touchDemoBtn) this.touchDemoBtn.addEventListener('click', () => {
            this._setInputMode('touch');
            this.gameMode = 'normal';
            this._syncTouchGestureButtons();
            this.start();
        });

        if (this.touchControls) {
            this.touchControls.querySelectorAll('.touch-gesture-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    this._setTouchGesture(btn.getAttribute('data-gesture') || 'rock');
                });
            });
        }

        if (this.repairDiffWrap) {
            const btns = Array.from(this.repairDiffWrap.querySelectorAll('.difficulty-btn'));
            btns.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const diff = btn.getAttribute('data-diff') || 'easy';
                    this.setRepairDifficulty(diff);
                    btns.forEach(b => {
                        const on = b === btn;
                        b.classList.toggle('active', on);
                        b.setAttribute('aria-selected', on ? 'true' : 'false');
                    });
                });
            });
        }

        if (this.leaderboardBtn) {
            this.leaderboardBtn.addEventListener('click', () => this._openLeaderboard('today'));
        }
        if (this.lbCloseBtn) this.lbCloseBtn.addEventListener('click', () => this._closeLeaderboard());
        if (this.lbBackdrop) this.lbBackdrop.addEventListener('click', () => this._closeLeaderboard());
        if (this.lbPanel) {
            this.lbPanel.querySelectorAll('.lb-tab').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const tab = btn.getAttribute('data-tab') || 'today';
                    this.lbState.tab = tab;
                    this.lbPanel.querySelectorAll('.lb-tab').forEach(b => b.classList.toggle('active', b === btn));
                    this._renderLeaderboard();
                });
            });
            this.lbPanel.querySelectorAll('.lb-metric').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const m = btn.getAttribute('data-metric') || 'bestScore';
                    this.lbState.totalMetric = m;
                    this._storageSet('fp_lb_total_metric', m);
                    this.lbPanel.querySelectorAll('.lb-metric').forEach(b => b.classList.toggle('active', b === btn));
                    this._renderLeaderboard();
                });
            });
        }

        if (this.rankmapBtn) this.rankmapBtn.addEventListener('click', () => this._openRankMap());
        if (this.rankmapCloseBtn) this.rankmapCloseBtn.addEventListener('click', () => this._closeRankMap());
        if (this.rankmapBackdrop) this.rankmapBackdrop.addEventListener('click', () => this._closeRankMap());

        if (this.rankupCloseBtn) this.rankupCloseBtn.addEventListener('click', () => this._hideRankup());
        if (this.rankupOverlay) this.rankupOverlay.addEventListener('click', (e) => {
            if (e && e.target === this.rankupOverlay) this._hideRankup();
        });

        if (this.dailyRewardBtn) this.dailyRewardBtn.addEventListener('click', () => this._claimDailyReward());
        if (this.gestureFrameColorInput) this.gestureFrameColorInput.addEventListener('input', () => this._saveGestureStyleFromUi());
        
        this._preloadTrack();

        // 初始化手势识别
        try {
            await this.detector.init();
        } catch (err) {
            const msg = err && err.message ? String(err.message) : '';
            if (msg.includes('MediaPipeHandsLoadFailed') || msg.includes('ScriptLoadFailed')) {
                this._showLbToast('手势识别模型加载失败，请检查网络，或改用系统浏览器打开');
            } else {
                this._showLbToast('手势识别初始化失败，请刷新后重试');
            }
        }
        
        // 加载完成，显示开始界面
        this.loadingScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
        this._renderHomeRank();
        this._renderRankMap();
        this._renderCameraPermissionUi();
        this._startIdleLoop();
        this._renderLeaderboard();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.runner.y = this.canvas.height - 150;
        
        // 调试画布同步视频比例
        this.debugCanvas.width = 640;
        this.debugCanvas.height = 480;
        this._ensureBackground();
    }

    start() {
        this.initAudio();
        this.startScreen.classList.add('hidden');
        this.repairSetupScreen.classList.add('hidden');
        this.gameInfo.classList.remove('hidden');
        this.isPlaying = true;
        this.isGameOver = false;
        this.score = 0;
        this.run.normalCorrect = 0;
        this.run.energyGain = 0;
        this.run.promotionWin = false;
        this.combo = 0;
        this.fever = 0;
        this.isFeverMode = false;
        document.getElementById('fever-container').classList.remove('fever-active');
        const stats = this._loadStats();
        const rank = this._statGetCurrentRank(stats);
        this.runRank = rank;
        const baseSpeed = this.gameMode === 'normal' ? 3.4 : 3;
        const boost = this.gameMode === 'challenge' ? (Math.max(0, rank - 1) * 0.12) : 0;
        this.speed = baseSpeed + boost;
        this.spawnInterval = 3000;
        this.obstacles = [];
        this.particles = [];
        this.scoreElement.innerText = '0';
        this.comboDisplayElement.innerText = '0';
        this.statusElement.innerText = '等待指令...';
        document.getElementById('fever-bar').style.width = `0%`;
        this.aiCoachElement.classList.add('hidden');
        this.aiCoachElement.innerText = 'AI教练：准备就绪';
        this.aiSummaryElement.classList.add('hidden');
        this.aiSummaryElement.innerText = '';
        this.isBossPhase = false;
        this.bossTimer = 0;
        this.nextMonsterAt = 15;
        this.monster.hp = 0;
        this.monster.maxHp = 0;
        this.monster.gesture = 'rock';
        this.monster.mistakes = 0;
        this.rhythm.lastBeat = -1;
        this.rhythm.nextSpawnBeat = 0;
        this.detector.setGestureConfig({
            allowLike: this.gameMode === 'repair',
            allowOk: false,
            minStableFrames: this.gameMode === 'repair' ? 2 : 2,
            unknownGraceFrames: this.gameMode === 'repair' ? 12 : 8
        });

        if (this.gameMode === 'repair') {
            this.isBossPhase = false;
            this.repair.progress = 0;
            if (!Number.isFinite(Number(this.repair.timeLeftFrames)) || this.repair.timeLeftFrames <= 0) this.repair.timeLeftFrames = 60 * 60;
            this.repair.holdFrames = 0;
            this.repair.target = this.pickRepairTarget('none');
            this.repair.noProgressFrames = 0;
            this.repair.lastProgressAt = 0;
            this.repair.stats.successes = 0;
            this.repair.stats.failures = 0;
            this.repair.stats.unknowns = 0;
            this.repair.stats.holdsCompleted = 0;
            this.repair.stats.startFrame = this.runner.frame;
            this.repair.stats.endFrame = 0;
            document.getElementById('fever-container').classList.add('fever-active');
            if (this.aiCoach.enabled) {
                this.aiCoachElement.classList.remove('hidden');
            }
        }

        this._setInputMode(this.inputMode);
        this.gameLoop();
        this.playSound(440, 'sine', 0.2);
        this._syncBgm();
    }

    restart() {
        this.gameOverScreen.classList.add('hidden');
        if (this.gameMode === 'repair') {
            this.openRepairSetup();
            return;
        }
        this.start();
    }

    goHome() {
        this.gameOverScreen.classList.add('hidden');
        this.gameInfo.classList.add('hidden');
        this.repairSetupScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
        this.isPlaying = false;
        this.isGameOver = false;
        // 清空画布
        this._startIdleLoop();
        this._syncBgm();
        this._closeLeaderboard();
        this._closeRankMap();
        this._hideRankup();
        this._renderHomeRank();
        this._renderCameraPermissionUi();
        if (this.touchControls) this.touchControls.classList.add('hidden');
    }

    openRepairSetup() {
        this.initAudio();
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.gameInfo.classList.add('hidden');
        this.repairSetupScreen.classList.remove('hidden');
        this.isPlaying = false;
        this.isGameOver = false;
        this._renderRepairDifficultyUi();
        const cached = this.getCachedRepairPlan();
        if (cached) {
            this.aiPlanPreview.classList.remove('hidden');
            this.aiPlanPreview.innerText = cached.summary || '已生成训练建议';
        } else {
            this.aiPlanPreview.classList.add('hidden');
            this.aiPlanPreview.innerText = '';
        }
        const apiKey = sessionStorage.getItem('deepseek_api_key') || '';
        if (apiKey && !this.apiKeyInput.value) this.apiKeyInput.value = apiKey;
        this._syncBgm();
        this._startIdleLoop();
        this._closeLeaderboard();
    }

    defaultRepairPlan() {
        return {
            summary: '默认方案：保持节奏，稳住动作即可点亮修复进度。',
            difficulty: {
                holdNeedFrames: 24,
                timeSeconds: 60,
                progressStep: 12.5,
                energyPerSuccess: 3,
                targetPool: ['rock', 'paper', 'scissors', 'like']
            },
            encouragement: [
                '做得很好，保持节奏。',
                '很好，手指更稳了。',
                '再坚持一下，你离点亮更近了。',
                '动作放慢一点，准确更重要。'
            ],
            adjustments: [
                '如果总是识别不到，试试让手掌更靠近摄像头并保持在画面中央。',
                '如果感觉太难，可以先用三种基础手势练熟，再加入👍。'
            ]
        };
    }

    setRepairPlan(plan) {
        const d = (plan && plan.difficulty) ? plan.difficulty : {};
        const holdNeedFrames = Number(d.holdNeedFrames);
        const timeSeconds = Number(d.timeSeconds);
        const progressStep = Number(d.progressStep);
        const energyPerSuccess = Number(d.energyPerSuccess);
        const pool = Array.isArray(d.targetPool) ? d.targetPool : null;

        this.repair.holdNeedFrames = Number.isFinite(holdNeedFrames) ? Math.min(60, Math.max(10, holdNeedFrames)) : 24;
        this.repair.timeLeftFrames = Number.isFinite(timeSeconds) ? Math.min(120, Math.max(20, timeSeconds)) * 60 : 60 * 60;
        this.repair.progressStep = Number.isFinite(progressStep) ? Math.min(25, Math.max(5, progressStep)) : 12.5;
        this.repair.energyPerSuccess = Number.isFinite(energyPerSuccess) ? Math.min(10, Math.max(1, energyPerSuccess)) : 3;
        this.repair.targetPool = pool && pool.length ? pool.filter(g => this.obstacleIcons[g]) : ['rock', 'paper', 'scissors', 'like'];

        const preset = this._repairDifficultyPreset(this.repairDifficulty);
        if (preset) {
            this.repair.holdNeedFrames = preset.holdNeedFrames;
            this.repair.timeLeftFrames = preset.timeSeconds * 60;
            this.repair.progressStep = preset.progressStep;
            this.repair.energyPerSuccess = preset.energyPerSuccess;
        }

        this.aiCoach.enabled = true;
        this.aiCoach.messages = Array.isArray(plan.encouragement) ? plan.encouragement.filter(Boolean).slice(0, 12) : [];
        this.aiCoach.adjustments = Array.isArray(plan.adjustments) ? plan.adjustments.filter(Boolean).slice(0, 12) : [];
        this.aiCoach.lastShownFrame = 0;
    }

    getCachedRepairPlan() {
        const raw = localStorage.getItem('repair_plan_v1');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    cacheRepairPlan(plan) {
        try {
            localStorage.setItem('repair_plan_v1', JSON.stringify(plan));
        } catch {}
    }

    async callDeepSeek(apiKey, payload) {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(txt || `HTTP ${res.status}`);
        }
        return await res.json();
    }

    extractJson(text) {
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first >= 0 && last > first) {
            const slice = text.slice(first, last + 1);
            return JSON.parse(slice);
        }
        return JSON.parse(text);
    }

    async generateRepairPlan() {
        const health = (this.healthInput.value || '').trim();
        const goal = (this.goalInput.value || '').trim();
        const apiKey = (this.apiKeyInput.value || '').trim();

        if (apiKey) sessionStorage.setItem('deepseek_api_key', apiKey);

        if (!apiKey) {
            const plan = this.defaultRepairPlan();
            this.cacheRepairPlan(plan);
            this.aiPlanPreview.classList.remove('hidden');
            this.aiPlanPreview.innerText = '未填写 API Key，已使用默认训练建议。';
            return;
        }

        const userProfile = {
            health: health || '未填写',
            goal: goal || '未填写',
            currentMode: '指尖修复舱',
            availableGestures: ['rock', 'paper', 'scissors', 'like'],
            constraints: {
                sessionSeconds: 60,
                keepFun: true,
                avoidMedicalTone: true
            }
        };

        const system = '你是抖音小游戏《指尖星球》的AI教练。用轻松、鼓励、游戏化的语气。只输出JSON，不要Markdown，不要多余文字。';
        const prompt = {
            task: '为指尖修复舱生成个性化训练建议、鼓励话术与难度调整建议，并给出初始难度参数。',
            outputSchema: {
                summary: 'string',
                difficulty: {
                    holdNeedFrames: 'number (10-60)',
                    timeSeconds: 'number (20-120)',
                    progressStep: 'number (5-25)',
                    energyPerSuccess: 'number (1-10)',
                    targetPool: 'array of strings from [rock,paper,scissors,like]'
                },
                encouragement: 'array of short strings',
                adjustments: 'array of short strings'
            },
            userProfile
        };

        try {
            const data = await this.callDeepSeek(apiKey, {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: JSON.stringify(prompt) }
                ],
                temperature: 0.7
            });

            const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                ? data.choices[0].message.content
                : '';
            const plan = this.extractJson(content);
            if (!plan || typeof plan !== 'object') throw new Error('invalid plan');

            this.cacheRepairPlan(plan);
            this.aiPlanPreview.classList.remove('hidden');
            this.aiPlanPreview.innerText = plan.summary || '训练建议已生成。';
        } catch {
            const plan = this.defaultRepairPlan();
            this.cacheRepairPlan(plan);
            this.aiPlanPreview.classList.remove('hidden');
            this.aiPlanPreview.innerText = 'AI 生成失败，已回退到默认训练建议。';
        }
    }

    startRepairWithPlan(plan) {
        this.setRepairPlan(plan);
        this.gameMode = 'repair';
        this._syncTouchGestureButtons();
        this.start();
        if (plan && plan.summary) {
            this.aiCoachElement.classList.remove('hidden');
            this.aiCoachElement.innerText = `AI教练：${plan.summary}`;
        }
    }

    pickRepairTarget(prev) {
        const pool = this.repair.targetPool && this.repair.targetPool.length ? this.repair.targetPool : ['rock', 'paper', 'scissors', 'like'];
        const candidates = pool.filter(g => g !== prev);
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    updateRepairMode() {
        this.updateParticles();

        this.repair.timeLeftFrames--;
        if (this.repair.timeLeftFrames <= 0) {
            this.gameOver();
            return;
        }

        const playerGesture = this._getCurrentGesture();
        const isCorrect = playerGesture === this.repair.target;
        const isKnownGesture = !!this.obstacleIcons[playerGesture];
        if (playerGesture === 'unknown' || playerGesture === 'none') {
            this.repair.stats.unknowns++;
        } else if (isKnownGesture && !isCorrect) {
            this.repair.stats.failures++;
        }

        if (isCorrect) {
            this.repair.holdFrames++;
            if (this.repair.holdFrames >= this.repair.holdNeedFrames) {
                this.repair.holdFrames = 0;
                this.repair.progress = Math.min(100, this.repair.progress + this.repair.progressStep);
                this.score += this.repair.energyPerSuccess;
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.repair.stats.successes++;
                this.repair.stats.holdsCompleted++;
                this.scoreElement.innerText = this.score;
                this.comboDisplayElement.innerText = this.combo;
                document.getElementById('fever-bar').style.width = `${this.repair.progress}%`;
                this.createParticles(this.canvas.width / 2, this.canvas.height / 2, '#2ed573');
                this.playSound(800 + this.combo * 20, 'sine', 0.12);
                this.repair.noProgressFrames = 0;
                this.repair.lastProgressAt = 0;

                if (this.repair.progress >= 100) {
                    this.gameOver();
                    return;
                }

                this.repair.target = this.pickRepairTarget(this.repair.target);
            }
        } else {
            this.repair.holdFrames = 0;
            this.repair.noProgressFrames++;
        }

        const seconds = Math.ceil(this.repair.timeLeftFrames / 60);
        this.statusElement.innerText = `🛰️ 修复指令：${this.obstacleIcons[this.repair.target]}  剩余 ${seconds}s`;

        if (this.aiCoach.enabled) {
            const frame = this.runner.frame;
            if (this.repair.progress >= 75 && this.aiCoach.lastShownFrame < 1) {
                this.aiCoachElement.innerText = `AI教练：${this.pickCoachMessage(0)}`;
                this.aiCoach.lastShownFrame = 1;
            } else if (this.repair.progress >= 50 && this.aiCoach.lastShownFrame < 2) {
                this.aiCoachElement.innerText = `AI教练：${this.pickCoachMessage(1)}`;
                this.aiCoach.lastShownFrame = 2;
            } else if (this.repair.progress >= 25 && this.aiCoach.lastShownFrame < 3) {
                this.aiCoachElement.innerText = `AI教练：${this.pickCoachMessage(2)}`;
                this.aiCoach.lastShownFrame = 3;
            } else if (frame - this.aiCoach.lastShownFrame > 360) {
                this.aiCoachElement.innerText = `AI教练：${this.pickCoachMessage(3)}`;
                this.aiCoach.lastShownFrame = frame;
            }

            if (this.repair.noProgressFrames > 300) {
                this.repair.noProgressFrames = 0;
                this.repair.holdNeedFrames = Math.max(10, this.repair.holdNeedFrames - 2);
                const tip = this.pickAdjustmentTip();
                if (tip) this.aiCoachElement.innerText = `AI教练：${tip}`;
            }
        }
    }

    pickCoachMessage(seed) {
        const list = this.aiCoach.messages && this.aiCoach.messages.length ? this.aiCoach.messages : this.defaultRepairPlan().encouragement;
        const idx = Math.abs((this.score + this.combo + seed) % list.length);
        return list[idx];
    }

    pickAdjustmentTip() {
        const list = this.aiCoach.adjustments && this.aiCoach.adjustments.length ? this.aiCoach.adjustments : this.defaultRepairPlan().adjustments;
        if (!list.length) return '';
        const idx = Math.abs((this.score + this.combo) % list.length);
        return list[idx];
    }

    spawnObstacle() {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        const condition = Math.random() > 0.5 ? 'win' : 'lose'; // 仅用于挑战模式
        
        this.obstacles.push({
            x: this.canvas.width,
            y: this.runner.y - 20,
            width: 80,
            height: 80,
            type: type,
            condition: condition,
            passed: false
        });
    }

    spawnObstacleWithX(x) {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        const condition = Math.random() > 0.5 ? 'win' : 'lose';
        this.obstacles.push({
            x: x,
            y: this.runner.y - 20,
            width: 80,
            height: 80,
            type: type,
            condition: condition,
            passed: false
        });
    }

    update() {
        if (!this.isPlaying || this.isGameOver) return;

        if (this.gameMode === 'repair') {
            this.updateRepairMode();
            return;
        }

        if (this.gameMode === 'normal' && !this.isBossPhase && !this.isFeverMode && this.score >= this.nextMonsterAt) {
            this.startBossPhase();
            this.nextMonsterAt += 15;
        }

        if (this.isBossPhase) {
            this.updateBossPhase();
            return;
        }

        // 角色动画
        this.runner.frame++;
        this.runner.jumpY = Math.sin(this.runner.frame * 0.2) * 5;

        // 技能持续时间更新
        if (this.shield > 0) this.shield--;
        if (this.slowMo > 0) this.slowMo--;

        // 增加速度 (Fever Mode 速度更快, SlowMo 减慢)
        let targetSpeed = this.isFeverMode ? 6.6 : 3 + (this.score * 0.05);
        if (this.slowMo > 0) targetSpeed *= 0.4;
        this.speed += (targetSpeed - this.speed) * 0.05;

        // 更新粒子
        this.updateParticles();

        // Fever 槽衰减
        if (this.isFeverMode) {
            this.fever -= 0.2;
            if (this.fever <= 0) {
                this.isFeverMode = false;
                document.getElementById('fever-container').classList.remove('fever-active');
                this._syncBgm();
            }
        }
        document.getElementById('fever-bar').style.width = `${this.fever}%`;

        const beat = this._songBeatFloat();
        if (Number.isFinite(beat) && this.gameMode !== 'repair') {
            const beatIdx = Math.floor(beat);
            if (beatIdx > this.rhythm.lastBeat) {
                this.rhythm.lastBeat = beatIdx;
                const bpm = this.audio.track.bpm || 128;
                const secPerBeat = 60 / bpm;
                const travelBeats = this.isFeverMode ? 3 : (this.score < 10 ? 8 : (this.score < 25 ? 7 : 6));
                let intervalBeats = this.isFeverMode ? 2 : (this.score < 10 ? 8 : (this.score < 25 ? 6 : 4));
                if (this.gameMode === 'challenge') {
                    const tier = Math.floor(Math.max(0, (this.runRank || 1) - 1) / 3);
                    intervalBeats = Math.max(1, intervalBeats - 1 - tier);
                }
                if (this.slowMo > 0) intervalBeats = Math.min(10, intervalBeats + 2);

                if (this.rhythm.nextSpawnBeat <= 0) this.rhythm.nextSpawnBeat = beatIdx + 2;
                if (beatIdx >= this.rhythm.nextSpawnBeat) {
                    const pxPerSec = Math.max(60, this.speed * 60);
                    const dist = pxPerSec * (travelBeats * secPerBeat);
                    this.spawnObstacleWithX(Math.max(this.canvas.width, this.runner.x + this.runner.width + dist + 260));
                    this.rhythm.nextSpawnBeat = beatIdx + intervalBeats;
                }
            }
        } else if (this.gameMode !== 'repair') {
            const now = Date.now();
            const currentSpawnInterval = this.isFeverMode ? 800 : Math.max(1200, 3000 - (this.score * 20));
            if (now - this.lastSpawnTime > currentSpawnInterval) {
                this.spawnObstacle();
                this.lastSpawnTime = now;
            }
        }

        // 更新障碍物
        const currentGesture = this._getCurrentGesture();
        this.statusElement.innerText = this.translateGesture(currentGesture);

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.speed;

            // 碰撞检测
            const distance = obs.x - (this.runner.x + this.runner.width);
            
            if (distance < 150 && distance > -50 && !obs.passed) {
                const isMatch = this.checkGestureMatch(currentGesture, obs);
                
                if (isMatch || this.isFeverMode || this.shield > 0) {
                    obs.passed = true;
                    if (this.gameMode === 'normal' && isMatch) this.run.normalCorrect++;
                    this.score += this.isFeverMode ? 2 : 1;
                    this.combo++;
                    this.maxCombo = Math.max(this.maxCombo, this.combo);
                    
                    if (this.shield > 0 && currentGesture !== obs.type) {
                        this.shield = Math.max(0, this.shield - 100); // 护盾抵消伤害
                    }

                    // 增加 Fever 值
                    if (!this.isFeverMode) {
                        this.fever = Math.min(100, this.fever + 10);
                        if (this.fever >= 100) {
                            this.isFeverMode = true;
                            document.getElementById('fever-container').classList.add('fever-active');
                            this.playSound(1200, 'square', 0.5);
                            this._syncBgm();
                        }
                    }

                    this.scoreElement.innerText = this.score;
                    this.comboDisplayElement.innerText = this.combo;
                    this.createParticles(obs.x + obs.width/2, obs.y + obs.height/2, '#2ed573');
                    this.runner.color = '#2ed573';
                    this.playSound(880 + this.combo * 20, 'sine', 0.1);
                    setTimeout(() => this.runner.color = '#3498db', 200);
                } else if (distance < 0) {
                    this.gameOver();
                }
            }

            if (obs.x < -100) {
                if (!obs.passed) {
                    this.gameOver();
                }
                this.obstacles.splice(i, 1);
            }
        }
    }

    startBossPhase() {
        this.isBossPhase = true;
        this.bossTimer = 60 * 20;
        this.obstacles = [];
        const baseHp = 3;
        const extraHp = Math.min(5, Math.floor(this.score / 30));
        this.monster.maxHp = baseHp + extraHp;
        this.monster.hp = this.monster.maxHp;
        this.monster.mistakes = 0;
        this.monster.hitCooldownFrames = 60;
        this.monster.introFrames = 60 * 3;
        this.monster.requiredHoldFrames = 10;
        this.monster.holdFrames = 0;
        this.monster.gesture = this.obstacleTypes[Math.floor(Math.random() * 3)];
        this.playSound(200, 'sawtooth', 1);
        this.statusElement.innerText = '👾 怪兽来袭！先看作战提示';
        this._syncBgm();
    }

    updateBossPhase() {
        if (this.monster.introFrames > 0) {
            this.monster.introFrames--;
            const introSeconds = Math.ceil(this.monster.introFrames / 60);
            const winMap = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
            const required = winMap[this.monster.gesture] || 'rock';
            this.statusElement.innerText = `你需要快速伸出右边所示手势以战胜怪兽 ${introSeconds}s`;
            if (this.monster.introFrames === 0) {
                this.monster.hitCooldownFrames = 30;
                this.statusElement.innerText = `👾 怪兽出 ${this.obstacleIcons[this.monster.gesture]}  你要出 ${this.obstacleIcons[required]}`;
            }
            return;
        }

        this.bossTimer--;
        if (this.bossTimer <= 0) {
            this.gameOver();
            return;
        }

        const currentGesture = this._getCurrentGesture();
        const seconds = Math.ceil(this.bossTimer / 60);

        if (this.monster.hitCooldownFrames > 0) {
            this.monster.hitCooldownFrames--;
            const winMap = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
            const required = winMap[this.monster.gesture] || 'rock';
            this.statusElement.innerText = `👾 怪兽出 ${this.obstacleIcons[this.monster.gesture]}  你要出 ${this.obstacleIcons[required]}  剩余 ${seconds}s`;
            return;
        }

        if (currentGesture !== 'rock' && currentGesture !== 'paper' && currentGesture !== 'scissors') {
            this.monster.holdFrames = 0;
            this.statusElement.innerText = `👾 怪兽出 ${this.obstacleIcons[this.monster.gesture]}  你要出能赢它的手势！  剩余 ${seconds}s`;
            return;
        }

        const winMap = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
        const loseMap = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
        const required = winMap[this.monster.gesture] || 'rock';

        if (currentGesture === required) {
            this.monster.holdFrames++;
            if (this.monster.holdFrames < this.monster.requiredHoldFrames) {
                this.statusElement.innerText = `👾 怪兽出 ${this.obstacleIcons[this.monster.gesture]}  你要出 ${this.obstacleIcons[required]}  （保持一下）剩余 ${seconds}s`;
                return;
            }
            this.monster.holdFrames = 0;
            this.monster.hp -= 1;
            this.score += 2;
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.scoreElement.innerText = this.score;
            this.comboDisplayElement.innerText = this.combo;
            this.createParticles(this.canvas.width / 2, this.canvas.height / 2, '#f1c40f');
            this.playSound(1100 + this.combo * 20, 'sine', 0.12);
            this.monster.gesture = this.obstacleTypes[Math.floor(Math.random() * 3)];
            this.monster.hitCooldownFrames = 35;

            if (this.monster.hp <= 0) {
                this.isBossPhase = false;
                this.fever = Math.min(100, this.fever + 50);
                document.getElementById('fever-bar').style.width = `${this.fever}%`;
                this.statusElement.innerText = '👾 怪兽被击退！继续收集能量！';
                this.playSound(600, 'square', 0.25);
                this._syncBgm();
            }
        } else if (currentGesture === loseMap[this.monster.gesture]) {
            this.monster.holdFrames++;
            if (this.monster.holdFrames < this.monster.requiredHoldFrames) {
                this.statusElement.innerText = `👾 注意：现在会输给怪兽！把手势换成 ${this.obstacleIcons[required]}  剩余 ${seconds}s`;
                return;
            }
            this.monster.holdFrames = 0;
            this.monster.mistakes++;
            this.combo = 0;
            this.comboDisplayElement.innerText = this.combo;
            this.playSound(140, 'sawtooth', 0.18);
            this.createParticles(this.canvas.width / 2, this.canvas.height / 2, '#ff4757');
            this.monster.hitCooldownFrames = 40;
            if (this.monster.mistakes >= 3) {
                this.gameOver();
                return;
            }
        } else {
            this.monster.holdFrames = 0;
        }
        const nextRequired = winMap[this.monster.gesture] || 'rock';
        this.statusElement.innerText = `👾 怪兽出 ${this.obstacleIcons[this.monster.gesture]}  你要出 ${this.obstacleIcons[nextRequired]}  剩余 ${seconds}s`;
    }

    translateGesture(gesture) {
        const map = {
            'rock': '✊ 石头',
            'paper': '🖐️ 布',
            'scissors': '✌️ 剪刀',
            'like': '👍 点赞',
            'none': '🫳 请伸出手',
            'unknown': '🤔 识别中...'
        };
        return map[gesture] || gesture;
    }

    drawShield(x, y, w, h) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const r = 70;
        const g = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
        g.addColorStop(0, 'rgba(241, 196, 15, 0.10)');
        g.addColorStop(0.6, 'rgba(241, 196, 15, 0.22)');
        g.addColorStop(1, 'rgba(241, 196, 15, 0)');
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = 'rgba(241, 196, 15, 0.85)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawRunner(x, y) {
        const ctx = this.ctx;
        const w = this.runner.width;
        const h = this.runner.height;
        const base = this.isFeverMode ? '#f1c40f' : this.runner.color;
        const sway = Math.sin(this.runner.frame * 0.25);

        ctx.save();

        for (let i = 0; i < 5; i++) {
            const t = i / 5;
            ctx.globalAlpha = 0.12 * (1 - t);
            ctx.fillStyle = this.isFeverMode ? 'rgba(241,196,15,0.9)' : 'rgba(52,152,219,0.9)';
            ctx.beginPath();
            ctx.arc(x - 10 - i * 10, y + h * 0.6 + sway * 3, 14 - i * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.shadowBlur = this.isFeverMode ? 30 : 18;
        ctx.shadowColor = this.isFeverMode ? 'rgba(241,196,15,0.8)' : 'rgba(52,152,219,0.6)';

        const body = ctx.createLinearGradient(x, y, x + w, y + h);
        body.addColorStop(0, 'rgba(255,255,255,0.18)');
        body.addColorStop(0.15, base);
        body.addColorStop(1, 'rgba(0,0,0,0.22)');

        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 16);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 16);
        ctx.stroke();

        const visorY = y + 18;
        const visorH = 20;
        const visor = ctx.createLinearGradient(x, visorY, x + w, visorY + visorH);
        visor.addColorStop(0, 'rgba(10,10,30,0.85)');
        visor.addColorStop(1, 'rgba(52,152,219,0.35)');
        ctx.fillStyle = visor;
        ctx.beginPath();
        ctx.roundRect(x + 8, visorY, w - 16, visorH, 10);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.roundRect(x + 12, visorY + 4, 10, 4, 4);
        ctx.fill();

        ctx.strokeStyle = this.isFeverMode ? 'rgba(255, 71, 87, 0.9)' : 'rgba(155, 89, 182, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.55, y - 6);
        ctx.lineTo(x + w * 0.55, y + 6);
        ctx.stroke();
        ctx.fillStyle = this.isFeverMode ? 'rgba(255, 71, 87, 0.9)' : 'rgba(155, 89, 182, 0.9)';
        ctx.beginPath();
        ctx.arc(x + w * 0.55, y - 10, 5, 0, Math.PI * 2);
        ctx.fill();

        const footSwing = Math.sin(this.runner.frame * 0.35);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.roundRect(x + 6, y + h - 10, 16, 10, 6);
        ctx.roundRect(x + w - 22, y + h - 10, 16, 10, 6);
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.roundRect(x + 8 + footSwing * 1.5, y + h - 6, 12, 6, 4);
        ctx.roundRect(x + w - 20 - footSwing * 1.5, y + h - 6, 12, 6, 4);
        ctx.fill();

        ctx.restore();
    }

    drawObstacle(obs) {
        const ctx = this.ctx;
        const x = obs.x;
        const y = obs.y;
        const w = obs.width;
        const h = obs.height;

        let c = obs.passed ? '#2ed573' : '#ff4757';
        if (this.gameMode === 'challenge' && !obs.passed) {
            c = obs.condition === 'win' ? '#2ed573' : '#ff4757';
        }

        ctx.save();

        const pole = ctx.createLinearGradient(x, 0, x + 10, 0);
        pole.addColorStop(0, 'rgba(255,255,255,0.12)');
        pole.addColorStop(0.5, 'rgba(255,255,255,0.04)');
        pole.addColorStop(1, 'rgba(0,0,0,0.18)');
        ctx.fillStyle = pole;
        ctx.fillRect(x + w / 2 - 6, 0, 12, y);

        ctx.shadowBlur = this.isFeverMode ? 32 : 18;
        ctx.shadowColor = c;

        const outer = ctx.createLinearGradient(x, y, x + w, y + h);
        outer.addColorStop(0, 'rgba(255,255,255,0.10)');
        outer.addColorStop(0.18, c);
        outer.addColorStop(1, 'rgba(0,0,0,0.25)');

        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 14);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 12);
        ctx.stroke();

        ctx.fillStyle = 'rgba(10, 10, 30, 0.45)';
        ctx.beginPath();
        ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 10);
        ctx.fill();

        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;
        const scan = (this.runner.frame * (this.isFeverMode ? 8 : 3)) % 16;
        for (let i = 0; i < 5; i++) {
            const yy = y + 16 + i * 12 + scan;
            ctx.beginPath();
            ctx.moveTo(x + 10, yy);
            ctx.lineTo(x + w - 10, yy);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.obstacleIcons[obs.type], x + w / 2, y + 56);

        if (this.gameMode === 'challenge' && !obs.passed) {
            ctx.font = 'bold 16px Arial';
            const label = obs.condition === 'win' ? '绿色：赢' : '红色：输';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(label, x + w / 2, y + 78);
        }

        if (!obs.passed) {
            const dist = Math.max(0, Math.floor((x - this.runner.x) / 10));
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.fillText(`${dist}m`, x + w / 2, y - 10);
        }

        ctx.restore();
    }

    draw() {
        const themeKey = this._themeKey();
        this._updateBackground(themeKey, themeKey === 'fever' ? 1.35 : 1);
        // 绘制调试手势
        this.detector.drawDebug(this.debugCtx, this.debugCanvas);

        if (this.gameMode === 'repair') {
            this.drawRepairMode();
            return;
        }

        if (this.isBossPhase) {
            this.drawBossPhase();
            return;
        }

        const groundY = this.runner.y + this.runner.height;
        const roadTop = groundY + 10;
        const roadBottom = this.canvas.height;
        this._drawBackdrop(themeKey, roadTop);
        const road = this.ctx.createLinearGradient(0, roadTop, 0, roadBottom);
        if (this.isFeverMode) {
            road.addColorStop(0, 'rgba(192,57,43,0.95)');
            road.addColorStop(1, 'rgba(47,53,66,1)');
        } else {
            road.addColorStop(0, 'rgba(44,62,80,0.95)');
            road.addColorStop(1, 'rgba(10,10,26,1)');
        }
        this.ctx.fillStyle = road;
        this.ctx.fillRect(0, roadTop, this.canvas.width, roadBottom - roadTop);
        this._drawRoadEnergy(themeKey, roadTop, roadBottom);

        this.ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        this.ctx.lineWidth = 2;
        const stripe = (this.runner.frame * (this.isFeverMode ? 14 : 6)) % 60;
        for (let x = -100; x < this.canvas.width + 200; x += 120) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + stripe, roadTop + 20);
            this.ctx.lineTo(x + 60 + stripe, roadTop + 20);
            this.ctx.stroke();
        }
        
        
        // 绘制粒子
        this.drawParticles();

        // 画角色
        const rx = this.runner.x;
        const ry = this.runner.y + this.runner.jumpY;
        
        // 绘制护盾
        if (this.shield > 0) {
            this.drawShield(rx, ry, this.runner.width, this.runner.height);
        }
        this.drawRunner(rx, ry);

        // 画障碍物
        this.obstacles.forEach(obs => this.drawObstacle(obs));

        // UI 提示
        if (this.isFeverMode) {
            this.drawText('FEVER MODE!', this.canvas.width/2, 150, 'bold 60px Arial', '#fff');
        } else if (this.slowMo > 0) {
            this.drawText('TIME WARP...', this.canvas.width/2, 150, 'bold 40px Arial', '#3498db');
        }
    }

    drawRepairMode() {
        this._drawBackdrop('repair', Math.floor(this.canvas.height * 0.72));

        this.ctx.strokeStyle = 'rgba(155, 89, 182, 0.25)';
        for (let i = 0; i < 16; i++) {
            this.ctx.beginPath();
            const y = (i * 80 + (this.repair.timeLeftFrames % 80));
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2 + 40;

        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.15)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
        this.ctx.lineWidth = 10;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 140, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * (this.repair.progress / 100));
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🛰️ 指尖修复舱', cx, 120);

        this.ctx.font = 'bold 90px Arial';
        this.ctx.fillText(this.obstacleIcons[this.repair.target], cx, cy + 30);

        const holdPct = Math.min(1, this.repair.holdFrames / this.repair.holdNeedFrames);
        this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
        this.ctx.fillRect(cx - 120, cy + 110, 240, 10);
        this.ctx.fillStyle = 'rgba(46, 213, 115, 0.9)';
        this.ctx.fillRect(cx - 120, cy + 110, 240 * holdPct, 10);

        this.drawParticles();
    }

    drawBossPhase() {
        this._drawBackdrop('boss', Math.floor(this.canvas.height * 0.72));

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2 + 20;
        const winMap = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
        const required = winMap[this.monster.gesture] || 'rock';

        if (this.monster.introFrames > 0) {
            const introSeconds = Math.ceil(this.monster.introFrames / 60);
            this.drawText('战斗提示', cx, 110, 'bold 54px Arial', '#f1c40f');
            this.drawText('你需要快速伸出右边所示手势以战胜怪兽', cx, 180, 'bold 28px Arial', '#ffffff');
            this.drawText(`${introSeconds}s`, cx, 240, 'bold 64px Arial', '#2ed573');

            this.ctx.font = 'bold 72px Arial';
            this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.obstacleIcons[this.monster.gesture], cx - 110, cy + 30);
            this.ctx.font = 'bold 52px Arial';
            this.ctx.fillText('→', cx, cy + 24);
            this.ctx.font = 'bold 72px Arial';
            this.ctx.fillText(this.obstacleIcons[required], cx + 110, cy + 30);

            this.drawText('左边是怪兽手势，右边是你要快速做出的克制手势', cx, cy + 110, '22px Arial', 'rgba(255,255,255,0.78)');
            this.drawText('3秒后开始正式战斗', cx, cy + 155, '22px Arial', 'rgba(241,196,15,0.95)');
            return;
        }

        this.drawText('👾 怪兽来袭！', cx, 110, 'bold 52px Arial', '#e74c3c');
        this.drawText(`倒计时 ${(this.bossTimer/60).toFixed(1)}s`, cx, 160, '28px Arial', 'rgba(255,255,255,0.9)');

        const hpPct = this.monster.maxHp > 0 ? (this.monster.hp / this.monster.maxHp) : 0;
        this.ctx.fillStyle = 'rgba(255,255,255,0.18)';
        this.ctx.fillRect(cx - 160, 190, 320, 14);
        this.ctx.fillStyle = 'rgba(231, 76, 60, 0.95)';
        this.ctx.fillRect(cx - 160, 190, 320 * hpPct, 14);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        this.ctx.strokeRect(cx - 160, 190, 320, 14);

        this.ctx.shadowBlur = 28;
        this.ctx.shadowColor = 'rgba(231, 76, 60, 0.8)';
        this.ctx.font = '140px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('👾', cx, cy - 20);
        this.ctx.shadowBlur = 0;

        this.ctx.font = 'bold 64px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(this.obstacleIcons[this.monster.gesture], cx - 90, cy + 90);
        this.ctx.font = 'bold 44px Arial';
        this.ctx.fillText('→', cx, cy + 86);
        this.ctx.font = 'bold 64px Arial';
        this.ctx.fillText(this.obstacleIcons[required], cx + 90, cy + 90);

        this.drawText('提示：怪兽出左边，你要出右边（赢过它）', cx, cy + 150, '20px Arial', 'rgba(255,255,255,0.75)');
        if (this.monster.mistakes > 0) {
            this.drawText(`失误 ${this.monster.mistakes}/3`, cx, cy + 185, '18px Arial', 'rgba(255, 255, 255, 0.65)');
        }
    }

    drawText(text, x, y, font, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y);
    }

    getRank(score) {
        if (score >= 100) return '🌟 指尖之神';
        if (score >= 60) return '👑 星球守护者';
        if (score >= 30) return '⚡ 能量工程师';
        if (score >= 15) return '🔧 指尖修复员';
        return '🌱 新手守护者';
    }

    async generatePostRepairFeedback() {
        const apiKey = (sessionStorage.getItem('deepseek_api_key') || '').trim();
        if (!this.aiCoach.enabled || !apiKey) return null;

        const stats = this.repair.stats;
        const durationSeconds = stats.startFrame ? Math.max(1, Math.round((stats.endFrame - stats.startFrame) / 60)) : 60;
        const accuracy = (stats.successes + stats.failures) > 0 ? Math.round((stats.successes / (stats.successes + stats.failures)) * 100) : 0;
        const completion = Math.round(this.repair.progress);

        const health = (this.healthInput && this.healthInput.value ? this.healthInput.value : '').trim();
        const goal = (this.goalInput && this.goalInput.value ? this.goalInput.value : '').trim();

        const system = '你是抖音小游戏《指尖星球》的AI教练。语气轻松、鼓励、游戏化。只输出JSON，不要Markdown，不要多余文字。';
        const prompt = {
            task: '根据本局训练表现生成复盘建议，并给出下一局难度调整建议（更易/更难）。',
            performance: {
                score: this.score,
                completionPercent: completion,
                durationSeconds,
                successes: stats.successes,
                failures: stats.failures,
                unknowns: stats.unknowns,
                accuracyPercent: accuracy,
                holdNeedFrames: this.repair.holdNeedFrames,
                progressStep: this.repair.progressStep
            },
            userInput: {
                health: health || '未填写',
                goal: goal || '未填写'
            },
            outputSchema: {
                summary: 'string (一句话鼓励+复盘)',
                tips: 'array of short strings (2-4条)',
                nextDifficulty: {
                    holdNeedFrames: 'number (10-60)',
                    progressStep: 'number (5-25)',
                    targetPool: 'array from [rock,paper,scissors,like]'
                }
            }
        };

        try {
            const data = await this.callDeepSeek(apiKey, {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: JSON.stringify(prompt) }
                ],
                temperature: 0.7
            });
            const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                ? data.choices[0].message.content
                : '';
            const feedback = this.extractJson(content);
            if (!feedback || typeof feedback !== 'object') return null;
            return feedback;
        } catch {
            return null;
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        this.combo = 0;

        const prevStats = this._loadStats();
        const prevTodayBest = this._todayBestForPlayer(prevStats);
        const prevBestScore = Number(prevStats.bestScore) || 0;
        const prevTotalEnergy = this._statGetTotalEnergy(prevStats);
        const prevRank = this._statGetCurrentRank(prevStats);

        const energyGain = this._energyGainForRun(this.score, this.gameMode);
        this.run.energyGain = energyGain;
        this.totalEnergy = prevTotalEnergy + energyGain;

        const nextStats = this._normalizeStats({
            ...prevStats,
            todayBest: (prevStats && typeof prevStats.todayBest === 'object' && prevStats.todayBest) ? { ...prevStats.todayBest } : {}
        });
        this._statSetTotalEnergy(nextStats, this.totalEnergy);
        nextStats.bestScore = Math.max(prevBestScore, this.score);
        this._setTodayBestForPlayer(nextStats, this.score);

        nextStats.games_played = (nextStats.games_played || 0) + 1;
        nextStats.gamesPlayed = nextStats.games_played;

        if (this.gameMode === 'normal') {
            nextStats.sync_correct_total = (nextStats.sync_correct_total || 0) + (this.run.normalCorrect || 0);
            nextStats.syncCorrectTotal = nextStats.sync_correct_total;
        }

        if (this.score > 60) nextStats.score60_streak = (nextStats.score60_streak || 0) + 1;
        else nextStats.score60_streak = 0;
        nextStats.score60Streak = nextStats.score60_streak;

        if (this.gameMode === 'challenge' && this.score >= 30) {
            nextStats.challenge_wins = (nextStats.challenge_wins || 0) + 1;
            nextStats.challengeWins = nextStats.challenge_wins;
        }

        if (this.gameMode === 'repair') {
            const completed = this.repair && Number(this.repair.progress) >= 100;
            if (completed) {
                nextStats.repair_difficulties_done = nextStats.repair_difficulties_done && typeof nextStats.repair_difficulties_done === 'object' ? nextStats.repair_difficulties_done : {};
                nextStats.repair_difficulties_done[this.repairDifficulty] = true;
                nextStats.repairDifficultiesDone = nextStats.repair_difficulties_done;
            }
        }

        const unlockMet = (targetRank) => {
            const r = Math.min(8, Math.max(1, Math.floor(Number(targetRank) || 1)));
            if (r <= 1) return true;
            if (r === 2) return (nextStats.games_played || 0) >= 3;
            if (r === 3) return (nextStats.challenge_wins || 0) >= 1;
            if (r === 4) return (nextStats.sync_correct_total || 0) >= 50;
            if (r === 5) return (nextStats.score60_streak || 0) >= 5;
            if (r === 6) return !!nextStats.leaderboard_top50;
            if (r === 7) {
                const d = nextStats.repair_difficulties_done || {};
                return !!d.easy && !!d.normal && !!d.hard;
            }
            return true;
        };

        const energyNow = this._statGetTotalEnergy(nextStats);
        const betterThan = (this.bots || []).filter(b => (Number(b.totalEnergy) || 0) > energyNow).length;
        const selfRankEnergy = 1 + betterThan;
        nextStats.leaderboard_top50 = selfRankEnergy <= 50;
        nextStats.leaderboardTop50 = nextStats.leaderboard_top50;
        let curRank = this._statGetCurrentRank(nextStats);
        let rankUpFrom = curRank;
        let rankUpTo = curRank;

        for (let i = 0; i < 10; i++) {
            const target = curRank + 1;
            if (target > 8) break;
            const meta = this._rankMeta(target);
            if (energyNow < meta.minEnergy) break;
            if (target === 8) {
                if (curRank < 7) break;
                if (!nextStats.promotion) nextStats.promotion = { active: false, wins: 0 };
                if (typeof nextStats.promotion.active !== 'boolean') nextStats.promotion.active = false;
                if (!Number.isFinite(Number(nextStats.promotion.wins))) nextStats.promotion.wins = 0;
                nextStats.promotion.active = true;
                const win = this._isRunWin(this.gameMode, this.score, this.repair ? this.repair.progress : 0);
                this.run.promotionWin = win;
                nextStats.promotion.wins = win ? (Math.floor(Number(nextStats.promotion.wins)) + 1) : 0;
                if (nextStats.promotion.wins >= 3) {
                    nextStats.promotion.active = false;
                    nextStats.promotion.wins = 0;
                    curRank = 8;
                    rankUpTo = 8;
                }
                break;
            }
            if (!unlockMet(target)) break;
            curRank = target;
            rankUpTo = curRank;
            const t = new Date().toISOString();
            nextStats.rank_up_history.push({ time: t, from: curRank - 1, to: curRank, total_energy: energyNow });
            nextStats.rankUpHistory = nextStats.rank_up_history;
            if (Array.isArray(nextStats.unlocked_titles)) {
                const title = this._rankMeta(curRank).title;
                if (title && !nextStats.unlocked_titles.includes(title)) nextStats.unlocked_titles.push(title);
                nextStats.unlockedTitles = nextStats.unlocked_titles;
            }
        }

        this._statSetCurrentRank(nextStats, curRank);

        this._saveStats(nextStats);

        const finalStats = this._loadStats();
        this.totalEnergy = this._statGetTotalEnergy(finalStats);
        const finalRank = this._statGetCurrentRank(finalStats);
        const planetPercent = this._planetPercentFromEnergy(this.totalEnergy);

        this.finalScoreElement.innerText = String(energyGain);
        if (this.finalTotalEnergyElement) this.finalTotalEnergyElement.innerText = String(this.totalEnergy);
        if (this.finalRankNameElement) this.finalRankNameElement.innerText = this._rankMeta(finalRank).name;
        this.planetPercentElement.innerText = planetPercent;
        this.rankTitleElement.innerText = `称号：${this.getRank(this.score)}（段位：${this._rankMeta(finalRank).title}）`;

        this.gameOverScreen.classList.remove('hidden');
        this.playSound(100, 'sawtooth', 0.5);
        this._syncBgm();

        const improvedToday = this.score > prevTodayBest;
        const improvedBest = this.score > prevBestScore;
        const improvedTotal = this.totalEnergy > prevTotalEnergy;
        if (improvedToday || improvedBest || improvedTotal) {
            const todayLb = this._buildLeaderboard('today', 'bestScore');
            const totalLb = this._buildLeaderboard('total', this.lbState.totalMetric);
            const todayRank = todayLb.selfRank || null;
            const totalRank = totalLb.selfRank || null;

            if (improvedToday && todayRank && todayRank <= 3) {
                const title = this._topTitles(todayRank);
                this._showLbToast(`🎉 恭喜登上今日榜第${todayRank}名，获得称号：${title}`);
            } else if ((improvedBest || improvedTotal) && totalRank && totalRank <= 3) {
                const title = this._topTitles(totalRank);
                this._showLbToast(`🎉 恭喜登上总榜第${totalRank}名，获得称号：${title}`);
            }
        }

        this._renderLeaderboard();
        this._renderHomeRank();
        this._renderRankMapState();
        if (rankUpTo > rankUpFrom && rankUpTo !== prevRank) this._showRankup(rankUpFrom, rankUpTo);
        if (finalStats.promotion && finalStats.promotion.active) {
            this._showLbToast(`晋级赛进行中：${this._unlockProgressText(8, finalStats)}`);
        }

        if (this.gameMode === 'repair') {
            this.repair.stats.endFrame = this.runner.frame;
            this.aiSummaryElement.classList.add('hidden');
            this.aiSummaryElement.innerText = '';

            this.generatePostRepairFeedback().then((feedback) => {
                if (!feedback) return;
                const summary = feedback.summary ? String(feedback.summary) : '';
                const tips = Array.isArray(feedback.tips) ? feedback.tips.filter(Boolean).slice(0, 4) : [];
                const lines = [summary, ...tips.map(t => `- ${t}`)].filter(Boolean);
                if (lines.length) {
                    this.aiSummaryElement.classList.remove('hidden');
                    this.aiSummaryElement.innerText = `AI复盘：\n${lines.join('\n')}`;
                }

                const next = feedback.nextDifficulty || {};
                const cached = this.getCachedRepairPlan() || this.defaultRepairPlan();
                cached.summary = cached.summary || '';
                cached.difficulty = cached.difficulty || {};
                if (Number.isFinite(Number(next.holdNeedFrames))) cached.difficulty.holdNeedFrames = Number(next.holdNeedFrames);
                if (Number.isFinite(Number(next.progressStep))) cached.difficulty.progressStep = Number(next.progressStep);
                if (Array.isArray(next.targetPool) && next.targetPool.length) cached.difficulty.targetPool = next.targetPool;
                this.cacheRepairPlan(cached);
            });
        }
    }

    gameLoop() {
        if (!this.isPlaying) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 启动游戏
new Game();
