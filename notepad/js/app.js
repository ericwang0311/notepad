/**
 * 应用主逻辑
 * 功能：笔记CRUD、日历、富文本编辑、附件、提醒、导出
 */
const App = {
    notes: [],           notes: [],           // 笔记列表
    currentNote: null,   currentNote: null,   // 当前选中笔记
    currentDate: null,   // 当前选中日期（默认为空：列表显示全部，当日仅浅色标识）
    calendarYear: null,
    calendarMonth: null,
    reminderTimer: null,
    reminderSettings: { popup: true, sound: true, system: true },
    currentListTab: 'notes',  // notes/todos
    todoViewMode:'due',      // created()/due()/all()
    searchMode:'notes',      // notes()/todos()
    todoDetailTarget: null,   // {noteId, todoId}

    // 避免 stroke=currentColor 内联 CSS 冲突
    iconCreate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    iconDue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/></svg>',
    iconAll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',

    // stroke=currentColor CSS 图标
    settingIcons: {
        gear: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'/></svg>",
        key: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4'/></svg>",
        lock: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>",
        alarm: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='13' r='8'/><path d='M12 9v4l2 2'/><path d='M5 3 2 6'/><path d='m22 6-3-3'/></svg>",
        volume: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'/><path d='M15.54 8.46a5 5 0 0 1 0 7.07'/><path d='M19.07 4.93a10 10 0 0 1 0 14.14'/></svg>",
        bell: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg>",
        message: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/></svg>",
        monitor: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='3' width='20' height='14' rx='2' ry='2'/><line x1='8' y1='21' x2='16' y2='21'/><line x1='12' y1='17' x2='12' y2='21'/></svg>",
        save: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'/><polyline points='17 21 17 13 7 13 7 21'/><polyline points='7 3 7 8 15 8'/></svg>",
        chart: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>",
        mind: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg>",
        flow: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='8' height='8' x='3' y='3' rx='2'/><path d='M7 11v4a2 2 0 0 0 2 2h4'/><rect width='8' height='8' x='13' y='13' rx='2'/></svg>",
        code: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='16 18 22 12 16 6'/><polyline points='8 6 2 12 8 18'/></svg>",
        leaf: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/><path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/></svg>",
        palette: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='13.5' cy='6.5' r='.5'/><circle cx='17.5' cy='10.5' r='.5'/><circle cx='8.5' cy='7.5' r='.5'/><circle cx='4.5' cy='11.5' r='.5'/><path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z'/></svg>"},

    // ==================== 初始化 ====================
    async init() {
        this.initTableResizer();     // 表格行列拖动调整
        this.renderSettingIcons();   // this.renderSettingIcons();   // 渲染设置图标
        this.applyTheme();           // 应用全局主题（清新绿/炫酷现代）
        applyI18n();                 // 中英文文案（默认中文，记忆上次选择）
        updateLangBtn();             // 语言切换按钮文案
        await DB.init();
        const hasAccount = await DB.getMeta('verifyToken');
        if (!hasAccount) {
            this.showSetupModal();
            return;
        }
        // 免密模式
        if (localStorage.getItem('nopass_mode') === 'true') {
            const pwd = await this.getAutoUnlockPassword();
            if (pwd && await this.tryAutoUnlock(pwd)) {
                return;
            }
        }
        this.showLoginModal();
    },

    // 根据 data-icon 注入 SVG
    renderSettingIcons() {
        document.querySelectorAll('#settingsModal .s-icon[data-icon]').forEach(el => {
            const svg = this.settingIcons[el.dataset.icon];
            if (svg) el.innerHTML = svg;
        });
    },

    // ==================== 语言切换 ====================
    toggleLang() {
        try { localStorage.setItem('app_lang', getLang() === 'en' ? 'zh' : 'en'); } catch (e) { /* localStorage 不可用时仅当次生效 */ }
        this.refreshLangUI();
    },

    // 切换语言后全量刷新：静态文案 + 各动态列表重渲染
    refreshLangUI() {
        applyI18n();
        updateLangBtn();
        if (this.calendarYear != null) this.renderCalendar();
        this.renderNoteList();
        this.renderTodoList();
        this.renderSyncList();
        // 同步目录名由用户选择产生，不让 applyI18n 重置回“未选择”
        ['A', 'B'].forEach(side => {
            const el = document.getElementById('syncDir' + side + 'Name');
            if (!el) return;
            const h = this.syncDirs && this.syncDirs[side];
            el.textContent = h ? h.name : t('未选择');
            el.title = h ? h.name : '';
        });
    },

    // 自动解锁
    async tryAutoUnlock(pwd) {
        try {
            const saltB64 = await DB.getMeta('salt');
            const token = await DB.getMeta('verifyToken');
            const salt = CryptoManager.base64ToSalt(saltB64);
            await CryptoManager.init(pwd, salt);
            if (await CryptoManager.verifyPassword(token)) {
                document.getElementById('loginModal').style.display = 'none';
                await this.loadApp();
                return true;
            }
        } catch (e) { /* 忽略 */ }
        return false;
    },

    // 获取免密模式的密码（加密存储，不再明文）
    async getAutoUnlockPassword() {
        // 旧版明文存储：读取后立即迁移为加密存储
        const legacy = localStorage.getItem('saved_pwd');
        if (legacy) {
            try {
                let secret = localStorage.getItem('auto_unlock_secret');
                if (!secret) {
                    secret = CryptoManager.arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)));
                    localStorage.setItem('auto_unlock_secret', secret);
                }
                localStorage.setItem('wrapped_pwd', await CryptoManager.encryptWithPassword(secret, legacy));
                localStorage.removeItem('saved_pwd');
            } catch (e) { /* 迁移失败时保持现状 */ }
            return legacy;
        }
        const secret = localStorage.getItem('auto_unlock_secret');
        const wrapped = localStorage.getItem('wrapped_pwd');
        if (!secret || !wrapped) return null;
        try {
            return await CryptoManager.decryptWithPassword(secret, wrapped);
        } catch (e) {
            return null;
        }
    },

    // 首次 - 设置密码
    showSetupModal() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('loginTitle').textContent = t('设置密码');
        document.getElementById('loginDesc').textContent = t('首次使用请设置密码');
        document.getElementById('passwordInput2').style.display = 'block';
        document.getElementById('loginBtn').textContent = t('确认');
        document.getElementById('loginBtn').onclick = () => this.setupPassword();
    },

    // 登录 - 输入密码
    showLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('loginTitle').textContent = t('密码登录');
        document.getElementById('loginDesc').textContent = t('请输入密码');
        document.getElementById('passwordInput2').style.display = 'none';
        document.getElementById('loginBtn').textContent = t('解锁');
        document.getElementById('loginBtn').onclick = () => this.unlock();
    },

    async setupPassword() {
        const pwd = document.getElementById('passwordInput').value;
        const pwd2 = document.getElementById('passwordInput2').value;
        if (!pwd || pwd.length < 4) {
            this.showToast('密码至少4位', 'error');
            return;
        }
        if (pwd !== pwd2) {
            this.showToast('两次密码不一致', 'error');
            return;
        }
        await CryptoManager.init(pwd, null);
        const salt = CryptoManager.saltToBase64(CryptoManager.salt);
        const token = await CryptoManager.createVerifyToken();
        await DB.setMeta('salt', salt);
        await DB.setMeta('verifyToken', token);
        document.getElementById('loginModal').style.display = 'none';
        this.showToast('密码设置成功');
        await this.loadApp();
    },

    async unlock() {
        const pwd = document.getElementById('passwordInput').value;
        if (!pwd) { this.showToast('请输入密码', 'error'); return; }
        const saltB64 = await DB.getMeta('salt');
        const token = await DB.getMeta('verifyToken');
        const salt = CryptoManager.base64ToSalt(saltB64);
        await CryptoManager.init(pwd, salt);
        const valid = await CryptoManager.verifyPassword(token);
        if (!valid) {
            this.showToast('密码错误', 'error');
            return;
        }
        document.getElementById('loginModal').style.display = 'none';
        await this.loadApp();
    },

    async loadApp() {
        document.getElementById('appMain').style.display = 'flex';
        const now = new Date();
        this.calendarYear = now.getFullYear();
        this.calendarMonth = now.getMonth();
        this.currentDate = null;   // 默认不选中任何日期：笔记/待办列表显示全部，当日仅浅色标识
        await this.autoSyncDataFile();
        await this.autoSyncSqliteFile();
        await this.checkDataFilePermission();
        await this.loadNotes();
        this.checkStorageReminder();
        this.checkFirstUseStorage();
        this.renderCalendar();
        this.renderNoteList();
        this.updateStats();
        this.updateTodoBadge();
        this.startReminderCheck();
        this.loadReminderSettings();
        this.applyStatsRowVisibility();
        this.applyMapleBg();
        this.applyToolBtnVisibility();
        this.initFloatingToolbar();
        this.initImageResize();
        // 刷新后恢复到上次所在页面（思维导图/流程图/代码/目录比较），不回笔记页
        this.restoreLastView();
        // file:// 协议
        if ('Notification' in window && Notification.permission === 'default' && window.location.protocol !== 'file:') {
            Notification.requestPermission();
        }
    },

    // ====================  ====================
    updateStats() {
        const today = this.formatDate(new Date());
        const nowStr = this.getLocalNowStr();
        document.getElementById('statTotal').textContent = this.notes.length;
        document.getElementById('statToday').textContent = this.notes.filter(n => n.date === today).length;
        const pendingReminders = this.notes.filter(n => n.reminder && n.reminder > nowStr).length;
        document.getElementById('statReminder').textContent = pendingReminders;
        document.getElementById('reminderBadge').style.display = pendingReminders > 0 ? 'block' : 'none';
        const totalTodos = this.notes.reduce((sum, n) => sum + (n.todos ? n.todos.length : 0), 0);
        document.getElementById('statTodo').textContent = totalTodos;
    },

    // 手动 - 检查提醒
    checkRemindersNow() {
        this.checkReminders();
        const nowStr = this.getLocalNowStr();
        const pending = this.notes.filter(n => n.reminder && n.reminder > nowStr);
        if (pending.length > 0) {
            const next = pending.sort((a, b) => a.reminder.localeCompare(b.reminder))[0];
            this.showToast(`提醒：${next.title} - ${next.reminder.replace('T', ' ')}`);
        } else {
            this.showToast(t('当前无提醒'));
        }
    },

    // ==================== 数据加载 ====================
    async loadNotes() {
        const encryptedNotes = await DB.getAllNotes();
        this.notes = [];
        for (const enc of encryptedNotes) {
            try {
                const json = await CryptoManager.decrypt(enc.data);
                this.notes.push(JSON.parse(json));
            } catch (e) {
                console.error('解密失败:', e);
            }
        }
        this.notes.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        this.initSortOrder();
    },

    // 为缺少手动顺序的笔记初始化 sortOrder（仅内存，拖拽后统一持久化）
    initSortOrder() {
        let next = 1000;
        for (const n of this.notes) {
            if (typeof n.sortOrder === 'number') {
                if (n.sortOrder >= next) next = n.sortOrder + 1;
            }
        }
        for (const n of this.notes) {
            if (typeof n.sortOrder !== 'number') {
                n.sortOrder = next;
                next += 1000;
            }
        }
    },

    async saveNoteData(note) {
        const json = JSON.stringify(note);
        const encrypted = await CryptoManager.encrypt(json);
        await DB.saveNote({ id: note.id, date: note.date, data: encrypted });
        await this.bumpDataRev();
        this.scheduleDataFileExport();
        this.scheduleSqliteExport();
    },

    // ===== 数据版本号：本地每次增删改 +1，写入磁盘文件；自动同步时比较新旧，防止旧文件覆盖新本地（如权限失效期间的删除） =====
    async getDataRev() { return parseInt(await DB.getMeta('dataRev') || '0', 10) || 0; },

    async bumpDataRev() { const r = (await this.getDataRev()) + 1; await DB.setMeta('dataRev', String(r)); return r; },

    sqliteFileRev() {
        const s = SQLiteStore.db.prepare("SELECT value FROM meta WHERE key='dataRev'");
        let v = 0;
        if (s.step()) v = parseInt(s.get()[0], 10) || 0;
        s.free();
        return v;
    },

    // ==================== 数据文件存储 ====================
    // 把全部数据存为工程目录下的 JSON 文件（笔记内容本身已是密文）
    dataFileSupported() {
        return typeof window.showSaveFilePicker === 'function';
    },

    async getDataFileHandle() {
        try { return await DB.getMeta('dataFileHandle'); } catch (e) { return null; }
    },

    // 绑定数据文件：选择/创建文件并立即导出全部数据
    async bindDataFile() {
        if (!this.dataFileSupported()) { this.showToast('当前浏览器不支持，请使用导出下载功能', 'error'); return; }
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'notepad-data.json',
                types: [{ description: '记事本数据文件', accept: { 'application/json': ['.json'] } }]
            });
            await DB.setMeta('dataFileHandle', handle);
            await this.writeDataFile();
            this.updateDataFileUI();
            this.showToast('已绑定，之后每次保存会自动写入该文件');
        } catch (e) {
            if (e && e.name !== 'AbortError') this.showToast('绑定失败: ' + e.message, 'error');
        }
    },

    unbindDataFile() {
        DB.setMeta('dataFileHandle', null);
        this.updateDataFileUI();
        this.showToast('已取消绑定');
    },

    // 序列化全部数据
    async collectDataFilePayload() {
        const notes = await DB.getAllNotes();
        const attachments = (await DB.getAllAttachments()).map(att => ({
            ...att,
            data: CryptoManager.arrayBufferToBase64(att.data)
        }));
        const meta = {
            salt: await DB.getMeta('salt'),
            verifyToken: await DB.getMeta('verifyToken')
        };
        return { app: 'SecureNotepad', version: 1, exportedAt: new Date().toISOString(), rev: await this.getDataRev(), meta, notes, attachments };
    },

    // 写入已绑定的数据文件（需授权仍有效）
    async writeDataFile() {
        const handle = await this.getDataFileHandle();
        if (!handle) return false;
        try {
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') return false;
            const payload = await this.collectDataFilePayload();
            const w = await handle.createWritable();
            await w.write(JSON.stringify(payload));
            await w.close();
            return true;
        } catch (e) {
            console.warn('数据文件写入失败', e);
            return false;
        }
    },

    // 保存后防抖自动写入
    scheduleDataFileExport() {
        clearTimeout(this._dataFileTimer);
        this._dataFileTimer = setTimeout(async () => {
            const handle = await this.getDataFileHandle();
            if (!handle) return;
            const ok = await this.writeDataFile();
            if (!ok && !this._dataFileWarned) {
                this._dataFileWarned = true;
                this.showToast('数据文件写入失败（需重新授权），请点击“保存数据文件”重新授权', 'error');
            }
        }, 1500);
    },

    // 手动保存一份数据文件（未绑定时为下载）
    async exportDataFileNow() {
        const handle = await this.getDataFileHandle();
        if (handle) {
            if (await handle.requestPermission({ mode: 'readwrite' }) === 'granted' && await this.writeDataFile()) {
                this.showToast('已保存到数据文件');
                return;
            }
        }
        const payload = await this.collectDataFilePayload();
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'notepad-data.json';
        a.click();
        URL.revokeObjectURL(a.href);
        this.showToast('已导出数据文件');
    },

    // 从数据文件导入：优先用已绑定文件，否则选择文件
    async loadDataFile() {
        let file = null;
        const handle = await this.getDataFileHandle();
        if (handle) {
            const perm = await handle.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                try { file = await handle.getFile(); } catch (e) { file = null; }
            }
        }
        if (!file) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            file = await new Promise((resolve) => {
                let done = false;
                const finish = (f) => { if (!done) { done = true; resolve(f); } };
                input.onchange = () => finish(input.files && input.files[0] || null);
                // 对话框关闭（取消）时 window 重新获得焦点
                window.addEventListener('focus', () => setTimeout(() => finish(input.files && input.files[0] || null), 500), { once: true });
                input.click();
            });
        }
        if (!file) return;
        let payload;
        try {
            payload = JSON.parse(await file.text());
        } catch (e) {
            this.showToast('文件不是有效的数据文件', 'error');
            return;
        }
        if (!Array.isArray(payload.notes)) { this.showToast('文件不是有效的数据文件', 'error'); return; }
        if (!confirm(`将用数据文件覆盖当前数据：\n笔记 ${payload.notes.length} 条、附件 ${(payload.attachments || []).length} 个。\n继续吗？`)) return;
        // 覆盖导入：先清空再写入
        await DB._clear('notes');
        await DB._clear('attachments');
        for (const n of payload.notes) await DB.saveNote(n);
        for (const att of (payload.attachments || [])) {
            await DB.saveAttachment({ ...att, data: CryptoManager.base64ToArrayBuffer(att.data) });
        }
        if (payload.meta && payload.meta.salt) {
            await DB.setMeta('salt', payload.meta.salt);
            await DB.setMeta('verifyToken', payload.meta.verifyToken);
            this.showToast('数据已导入，请使用数据文件对应密码重新登录', 'error');
            setTimeout(() => location.reload(), 1600);
            return;
        }
        await this.loadNotes();
        this.renderNoteList();
        this.updateStats();
        this.updateTodoBadge();
        this.showToast('数据已导入');
    },

    // 启动时自动同步：若已绑定且授权仍有效，以数据文件为准
    async autoSyncDataFile() {
        try {
            const handle = await this.getDataFileHandle();
            if (!handle) return;
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') return;
            const file = await handle.getFile();
            if (file.size === 0) return;
            const payload = JSON.parse(await file.text());
            if (!Array.isArray(payload.notes)) return;
            const fileRev = parseInt(payload.rev || '0', 10) || 0;
            const localRev = await this.getDataRev();
            if (fileRev <= localRev) {
                // 本地不旧于文件：把本地写回文件（补上此前权限失效时未写成的增删改）
                await this.writeDataFile();
                return;
            }
            // 保护：空数据文件不得清空本地已有笔记
            if (payload.notes.length === 0 && (await DB.getAllNotes()).length > 0) return;
            await DB._clear('notes');
            await DB._clear('attachments');
            for (const n of payload.notes) await DB.saveNote(n);
            for (const att of (payload.attachments || [])) {
                await DB.saveAttachment({ ...att, data: CryptoManager.base64ToArrayBuffer(att.data) });
            }
            if (payload.meta && payload.meta.salt) {
                await DB.setMeta('salt', payload.meta.salt);
                await DB.setMeta('verifyToken', payload.meta.verifyToken);
            }
            await DB.setMeta('dataRev', String(fileRev));
        } catch (e) {
            console.warn('数据文件自动同步失败', e);
        }
    },

    // 启动时检查：已绑定磁盘文件（JSON/SQLite）但授权失效（浏览器重启后常见），显示醒目授权横幅
    async checkDataFilePermission() {
        const targets = [];
        const jsonHandle = await this.getDataFileHandle();
        if (jsonHandle) targets.push({ handle: jsonHandle, name: jsonHandle.name || 'notepad-data.json', sync: () => this.autoSyncDataFile() });
        const sqliteHandle = await this.getSqliteFileHandle();
        // 存储方案为浏览器存储时，SQLite 文件不参与自动同步/授权
        if (sqliteHandle && this.getStorageMode() === 'sqlite') targets.push({ handle: sqliteHandle, name: sqliteHandle.name || 'notepad-data.sqlite', sync: () => this.autoSyncSqliteFile() });
        // 目录句柄不在此处授权：按需（初始化时）再请求，避免一次操作弹两条浏览器授权条
        const pending = [];
        for (const t of targets) {
            try {
                if (await t.handle.queryPermission({ mode: 'readwrite' }) !== 'granted') pending.push(t);
            } catch (e) { /* 句柄失效，忽略 */ }
        }
        if (pending.length) this.showDataFileAuthBanner(pending);
    },

    // 启动提醒：有笔记但未绑定任何磁盘文件时，数据仅存于当前浏览器，提示一键初始化 SQLite 存储
    async checkStorageReminder() {
        try {
            // 首次使用有专属选择弹窗；明确选了浏览器存储则不再唠叨
            const mode = localStorage.getItem('storage_mode');
            if (!mode || mode === 'browser') return;
            if (document.getElementById('storageReminderBanner')) return;
            const jsonHandle = await this.getDataFileHandle();
            const sqliteHandle = await this.getSqliteFileHandle();
            if (jsonHandle || sqliteHandle) return;
            if (sessionStorage.getItem('storage_reminder_later') === '1') return;
            if ((await DB.getAllNotes()).length === 0) return;
            const bar = document.createElement('div');
            bar.id = 'storageReminderBanner';
            bar.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;align-items:center;gap:10px;background:#e0f2fe;border:1px solid #0ea5e9;color:#075989;padding:10px 14px;border-radius:8px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.15);max-width:92vw;flex-wrap:wrap;';
            bar.innerHTML = `<span>⚠️ <b>笔记目前仅存于此浏览器</b>，换浏览器或清理数据会丢失，建议存入磁盘文件。</span>
                <button style="background:#0ea5e9;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:13px;cursor:pointer;white-space:nowrap;">初始化 SQLite 存储</button>
                <button style="background:transparent;color:#075989;border:1px solid #0ea5e9;border-radius:6px;padding:5px 12px;font-size:13px;cursor:pointer;white-space:nowrap;">以后再说</button>`;
            const [initBtn, laterBtn] = bar.querySelectorAll('button');
            initBtn.onclick = async () => {
                await this.initSqliteFile();
                if (await this.getSqliteFileHandle()) bar.remove();
            };
            laterBtn.onclick = () => { sessionStorage.setItem('storage_reminder_later', '1'); bar.remove(); };
            document.body.appendChild(bar);
        } catch (e) { /* 提醒显示失败不影响主流程 */ }
    },

    showDataFileAuthBanner(pending) {
        if (document.getElementById('dataFileAuthBanner')) return;
        const names = pending.map(t => this.escapeHtml(t.name)).join('、');
        // 居中弹窗，与登录框同款布局/配色；授权对象为上次记住的目录/文件，无需重新查找
        const overlay = document.createElement('div');
        overlay.id = 'dataFileAuthBanner';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(45,55,72,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-box" style="max-width:400px;text-align:center;">
                <div style="width:64px;height:64px;margin:0 auto 14px;background:var(--teal-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8em;">🔐</div>
                <h2 style="margin-bottom:8px;font-size:1.25em;font-weight:700;">数据文件授权</h2>
                <p style="color:var(--text-light);font-size:0.88em;line-height:1.8;margin-bottom:20px;">
                    浏览器重启后磁盘写入权限已失效，需重新授权一次。<br>
                    将沿用上次的目录，无需重新查找：<br>
                    <b style="color:var(--teal);">${names}</b><br>
                    <span style="font-size:0.92em;color:var(--text-light);">点击后浏览器会再弹一条授权提示，点「允许」即可（浏览器安全确认，无法省略）</span>
                </p>
                <button class="btn btn-primary" id="authGrantBtn">授权并同步</button>
                <button class="btn" id="authLaterBtn" style="width:100%;margin-top:10px;background:var(--bg);color:var(--text-light);border:1.5px solid var(--border);">以后再说</button>
            </div>`;
        const doAuth = async () => {
            let anyGranted = false;
            for (const t of pending) {
                const perm = await t.handle.requestPermission({ mode: 'readwrite' });
                if (perm === 'granted') { await t.sync(); anyGranted = true; }
            }
            if (anyGranted) {
                await this.loadNotes();
                this.renderNoteList();
                this.updateStats();
                this.updateTodoBadge();
                overlay.remove();
                this.showToast('已授权，数据与数据文件同步完成');
            } else {
                this.showToast('未授权，数据目前仅保存在浏览器中', 'error');
            }
        };
        overlay.querySelector('#authGrantBtn').onclick = doAuth;
        overlay.querySelector('#authLaterBtn').onclick = () => {
            overlay.remove();
            this.showToast('未授权，数据目前仅保存在浏览器中', 'error');
        };
        document.body.appendChild(overlay);
    },

    // ==================== SQLite 文件存储 ====================
    async getSqliteFileHandle() {
        try { return await DB.getMeta('sqliteFileHandle'); } catch (e) { return null; }
    },

    async getSqliteDirHandle() {
        try { return await DB.getMeta('sqliteDirHandle'); } catch (e) { return null; }
    },

    // 初始化 SQLite 数据库：在所选目录的 data 子目录下创建 notepad.sqlite，写入当前数据并自动绑定
    async initSqliteFile() {
        if (!SQLiteStore.supported()) { this.showToast('当前浏览器不支持，请使用 Chrome/Edge', 'error'); return; }
        try {
            // 已绑定过数据库：初始化是幂等操作，直接沿用，不再弹任何确认
            const boundHandle = await this.getSqliteFileHandle();
            if (boundHandle) {
                this.updateDataFileUI();
                this.showToast(`已绑定 ${boundHandle.name}，无需重复初始化`);
                return;
            }
            // 目录授权记忆：仅首次初始化需选择一次保存目录，之后工具自动建库读写，无需再找文件
            let dirHandle = await this.getSqliteDirHandle();
            if (dirHandle && await dirHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                if (await dirHandle.requestPermission({ mode: 'readwrite' }) !== 'granted') dirHandle = null;
            }
            if (!dirHandle) {
                dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                await DB.setMeta('sqliteDirHandle', dirHandle);
            }
            const dataDir = await dirHandle.getDirectoryHandle('data', { create: true });
            const handle = await dataDir.getFileHandle('notepad.sqlite', { create: true });
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                await handle.requestPermission({ mode: 'readwrite' });
            }
            const file = await handle.getFile();
            if (file.size > 0) {
                // 记录位置找到已有数据库：本地为空时默认沿用文件数据（不弹窗）；本地也有数据时才询问，防误覆盖
                const localCount = (await DB.getAllNotes()).length;
                const useFile = localCount === 0 || !confirm(`该目录下 data/${handle.name} 已存在数据库文件。\n确定＝用当前本地数据覆盖；取消＝直接沿用文件里的数据`);
                if (useFile) {
                    await DB.setMeta('sqliteFileHandle', handle);
                    await SQLiteStore.open(new Uint8Array(await file.arrayBuffer()));
                    if (await SQLiteStore.pushToIndexedDB()) await this.loadNotes();
                    await DB.setMeta('dataRev', String(this.sqliteFileRev()));
                    this.applySettingsFromSqlite();
                    this.updateDataFileUI();
                    this.showToast(`已绑定已有数据库 data/${handle.name}`);
                    return;
                }
            }
            await DB.setMeta('sqliteFileHandle', handle);
            await SQLiteStore.open(null);
            await SQLiteStore.pullFromIndexedDB();
            await this.writeSqliteFile();
            this.updateDataFileUI();
            this.showToast(`SQLite 数据库已初始化（data/${handle.name}），每次保存自动写入`);
        } catch (e) {
            if (e && e.name !== 'AbortError') this.showToast('初始化失败: ' + e.message, 'error');
        }
    },

    // 更换绑定的 SQLite 文件：文件非空则以文件数据为准，空则写入当前数据
    async changeSqliteFile() {
        if (!SQLiteStore.supported()) { this.showToast('当前浏览器不支持，请使用 Chrome/Edge', 'error'); return; }
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'SQLite 数据文件', accept: { 'application/octet-stream': ['.sqlite', '.db'] } }]
            });
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                await handle.requestPermission({ mode: 'readwrite' });
            }
            await DB.setMeta('sqliteFileHandle', handle);
            const file = await handle.getFile();
            if (file.size > 0) {
                await SQLiteStore.open(new Uint8Array(await file.arrayBuffer()));
                if (await SQLiteStore.pushToIndexedDB()) await this.loadNotes();
                await DB.setMeta('dataRev', String(this.sqliteFileRev()));
                this.applySettingsFromSqlite();
            } else {
                await SQLiteStore.open(null);
                await SQLiteStore.pullFromIndexedDB();
                await this.writeSqliteFile();
            }
            this.updateSqliteUI();
            this.showToast(`已绑定 SQLite 文件：${handle.name}`);
        } catch (e) {
            if (e && e.name !== 'AbortError') this.showToast('绑定失败: ' + e.message, 'error');
        }
    },

    unbindSqliteFile() {
        DB.setMeta('sqliteFileHandle', null);
        this.updateSqliteUI();
        this.showToast('已取消 SQLite 绑定');
    },

    // ==================== 存储方案（浏览器存储 / SQLite 存储） ====================
    getStorageMode() {
        return localStorage.getItem('storage_mode') === 'sqlite' ? 'sqlite' : 'browser';
    },

    // 首次使用（未做过选择）弹窗提示选择存储方案，默认浏览器存储
    checkFirstUseStorage() {
        if (localStorage.getItem('storage_mode')) return;
        this.showStorageModeModal();
    },

    showStorageModeModal() {
        if (document.getElementById('storageModeModal')) return;
        const overlay = document.createElement('div');
        overlay.id = 'storageModeModal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(45,55,72,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-box" style="max-width:420px;text-align:center;">
                <div style="width:64px;height:64px;margin:0 auto 14px;background:var(--teal-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8em;">💾</div>
                <h2 style="margin-bottom:8px;font-size:1.25em;font-weight:700;">选择存储方案</h2>
                <p style="color:var(--text-light);font-size:0.88em;line-height:1.8;margin-bottom:20px;">
                    <b>浏览器存储</b>：数据仅存于当前浏览器，简单即用（默认）。<br>
                    <b>SQLite 存储</b>：数据以文件存入磁盘目录，清浏览器数据不丢、换浏览器可接管。<br>
                    <span style="font-size:0.92em;">之后可在 设置 → 数据存储 中随时修改。</span>
                </p>
                <button class="btn btn-primary" id="smBrowserBtn">浏览器存储（默认）</button>
                <button class="btn" id="smSqliteBtn" style="width:100%;margin-top:10px;background:var(--bg);color:var(--text);border:1.5px solid var(--border);">SQLite 存储</button>
            </div>`;
        overlay.querySelector('#smBrowserBtn').onclick = () => {
            localStorage.setItem('storage_mode', 'browser');
            overlay.remove();
            this.updateStorageModeUI();
            this.showToast('已使用浏览器存储');
        };
        overlay.querySelector('#smSqliteBtn').onclick = async () => {
            localStorage.setItem('storage_mode', 'sqlite');
            overlay.remove();
            await this.initSqliteFile();
            if (!(await this.getSqliteFileHandle())) {
                localStorage.setItem('storage_mode', 'browser');
                this.showToast('未选择目录，保持浏览器存储', 'error');
            }
            this.updateStorageModeUI();
            this.updateDataFileUI();
        };
        document.body.appendChild(overlay);
    },

    // 设置面板切换存储方案；SQLite 需绑定成功才生效，否则回退浏览器存储
    async setStorageMode(t) {
        if (t === this.getStorageMode()) return;
        if (t === 'sqlite') {
            localStorage.setItem('storage_mode', 'sqlite');
            await this.initSqliteFile();
            if (await this.getSqliteFileHandle()) {
                this.showToast('已切换 SQLite 存储');
            } else {
                localStorage.setItem('storage_mode', 'browser');
                this.showToast('未完成 SQLite 绑定，保持浏览器存储', 'error');
            }
        } else {
            localStorage.setItem('storage_mode', 'browser');
            this.showToast('已切换浏览器存储，SQLite 文件暂停同步');
        }
        this.updateStorageModeUI();
        this.updateDataFileUI();
    },

    updateStorageModeUI() {
        const m = this.getStorageMode();
        const b = document.getElementById('storageBrowserBtn'), s = document.getElementById('storageSqliteBtn');
        if (b) b.classList.toggle('selected', m === 'browser');
        if (s) s.classList.toggle('selected', m === 'sqlite');
    },

    // 写入已绑定的 SQLite 文件（需授权仍有效）
    async writeSqliteFile() {
        const handle = await this.getSqliteFileHandle();
        if (!handle) return false;
        try {
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') return false;
            if (!SQLiteStore.db) {
                const file = await handle.getFile();
                await SQLiteStore.open(file.size > 0 ? new Uint8Array(await file.arrayBuffer()) : null);
            }
            await SQLiteStore.pullFromIndexedDB();
            SQLiteStore.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('dataRev', ?)", [String(await this.getDataRev())]);
            const w = await handle.createWritable();
            await w.write(SQLiteStore.export());
            await w.close();
            return true;
        } catch (e) {
            console.warn('SQLite 文件写入失败', e);
            return false;
        }
    },

    // 保存后防抖自动写入 SQLite 文件
    scheduleSqliteExport() {
        if (this.getStorageMode() !== 'sqlite') return;
        clearTimeout(this._sqliteTimer);
        this._sqliteTimer = setTimeout(async () => {
            const handle = await this.getSqliteFileHandle();
            if (!handle) return;
            const ok = await this.writeSqliteFile();
            if (!ok && !this._sqliteWarned) {
                this._sqliteWarned = true;
                this.showToast('SQLite 文件写入失败（需重新授权），请重新绑定或点击授权横幅', 'error');
            }
        }, 1500);
    },

    // 启动时自动同步：比较版本号决定方向——文件更新则以文件为准，否则把本地写回文件
    async autoSyncSqliteFile() {
        try {
            if (this.getStorageMode() !== 'sqlite') return;
            const handle = await this.getSqliteFileHandle();
            if (!handle) return;
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') return;
            const file = await handle.getFile();
            if (file.size === 0) return;
            await SQLiteStore.open(new Uint8Array(await file.arrayBuffer()));
            const fileRev = this.sqliteFileRev();
            const localRev = await this.getDataRev();
            if (fileRev > localRev) {
                // 文件更新（如其他浏览器写入）：以文件为准导入
                const ok = await SQLiteStore.pushToIndexedDB();
                if (ok) await DB.setMeta('dataRev', String(fileRev));
                this.applySettingsFromSqlite();
                if (!ok) console.warn('SQLite 文件无笔记，跳过覆盖本地数据');
            } else {
                // 本地不旧于文件：把本地写回文件（补上此前未写成的增删改）
                await this.writeSqliteFile();
            }
        } catch (e) {
            console.warn('SQLite 自动同步失败', e);
        }
    },

    // 读取已绑定 SQLite 文件的表与数据量统计
    async getSqliteStats() {
        const handle = await this.getSqliteFileHandle();
        if (!handle) return null;
        const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        try {
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                return { name: esc(handle.name), authorized: false };
            }
            if (!SQLiteStore.db) {
                const file = await handle.getFile();
                if (file.size === 0) return { name: esc(handle.name), authorized: true, empty: true };
                await SQLiteStore.open(new Uint8Array(await file.arrayBuffer()));
            }
            const count = (t) => {
                const s = SQLiteStore.db.prepare(`SELECT COUNT(*) FROM ${t}`);
                let n = 0;
                if (s.step()) n = s.get()[0];
                s.free();
                return n;
            };
            return { name: esc(handle.name), authorized: true, notes: count('notes'), attachments: count('attachments'), meta: count('meta') };
        } catch (e) {
            return { name: esc(handle.name), error: true };
        }
    },

    // 手动备份：立即把当前数据写入已绑定文件；未绑定则转入初始化流程
    async backupSqliteNow() {
        const handle = await this.getSqliteFileHandle();
        if (!handle) { await this.initSqliteFile(); return; }
        const ok = await this.writeSqliteFile();
        if (ok) {
            const s = await this.getSqliteStats();
            this.showToast(`已备份到 ${handle.name}：笔记 ${s ? s.notes : 0} 条、附件 ${s ? s.attachments : 0} 个`);
        } else {
            this.showToast('备份失败：需重新授权，请点击顶部授权横幅', 'error');
        }
        this.updateSqliteUI();
    },

    // 清理重复笔记：按解密后的标题+正文分组，每组保留一条（待办多者优先，其次最早创建），删除其余
    async deduplicateNotes() {
        await this.loadNotes();
        const groups = new Map();
        for (const n of this.notes) {
            const key = (n.title || '') + '\u0001' + (n.content || '');
            if (key === '\u0001') continue;   // 空笔记不参与去重
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(n);
        }
        const dupGroups = [...groups.values()].filter(g => g.length > 1);
        if (!dupGroups.length) { this.showToast('未发现重复笔记'); return; }
        const remove = [];
        for (const g of dupGroups) {
            g.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            const keep = g.reduce((best, n) => ((n.todos || []).length > (best.todos || []).length ? n : best), g[0]);
            for (const n of g) if (n !== keep) remove.push(n);
        }
        if (!confirm(`发现 ${dupGroups.length} 组内容完全重复的笔记，多出 ${remove.length} 条。\n将保留每组一条（待办多者优先），删除其余。\n继续吗？`)) return;
        for (const n of remove) await DB.deleteNote(n.id);
        await this.bumpDataRev();
        await this.loadNotes();
        this.renderNoteList();
        this.updateStats();
        this.updateTodoBadge();
        this.scheduleSqliteExport();
        this.scheduleDataFileExport();
        this.showToast(`已清理 ${remove.length} 条重复笔记`);
    },

    // ===== 数据库配置：本地设置存入数据库文件 / 加载数据库文件时恢复设置（跨浏览器带走配置） =====
    SETTINGS_SYNC_KEYS: ['hide_stats', 'hide_maple_bg', 'hide_mind_tool', 'hide_flow_tool', 'hide_code_tool'],

    // 保存数据库配置：把当前显示类设置写入已绑定数据库文件（不含密码等敏感信息）
    async saveSettingsToSqlite() {
        const handle = await this.getSqliteFileHandle();
        if (!handle) { this.showToast('请先初始化或更换数据库', 'error'); return; }
        try {
            if (!SQLiteStore.db) await this.getSqliteStats();
            if (!SQLiteStore.db) { this.showToast('数据库未就绪', 'error'); return; }
            const cfg = {};
            for (const k of this.SETTINGS_SYNC_KEYS) {
                const v = localStorage.getItem(k);
                if (v !== null) cfg[k] = v;
            }
            SQLiteStore.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('appSettings', ?)", [JSON.stringify(cfg)]);
            await this.writeSqliteFile();
            this.showToast('配置已保存到数据库文件');
            this.updateSqliteUI();
        } catch (e) {
            this.showToast('保存配置失败: ' + e.message, 'error');
        }
    },

    // 加载数据库文件时，把文件中保存的配置恢复到本地并刷新界面
    applySettingsFromSqlite() {
        if (!SQLiteStore.db) return;
        try {
            const s = SQLiteStore.db.prepare("SELECT value FROM meta WHERE key='appSettings'");
            if (!s.step()) { s.free(); return; }
            const cfg = JSON.parse(s.get()[0]);
            s.free();
            for (const k of this.SETTINGS_SYNC_KEYS) {
                if (cfg[k] !== undefined) localStorage.setItem(k, cfg[k]);
            }
            this.applyStatsRowVisibility();
            this.applyMapleBg();
            this.applyToolBtnVisibility();
            if (document.getElementById('settingsModal').style.display !== 'none') {
                document.getElementById('showStatsToggle').checked = localStorage.getItem('hide_stats') !== 'true';
                this.syncMapleToggle();
                document.getElementById('showMindToggle').checked = localStorage.getItem('hide_mind_tool') !== 'true';
                document.getElementById('showFlowToggle').checked = localStorage.getItem('hide_flow_tool') !== 'true';
                document.getElementById('showCodeToggle').checked = localStorage.getItem('hide_code_tool') !== 'true';
            }
        } catch (e) { /* 配置恢复失败不影响数据加载 */ }
    },

    updateSqliteUI() {
        const status = document.getElementById('sqliteFileStatus');
        if (!status) return;
        this.getSqliteStats().then(s => {
            if (!s) { status.innerHTML = `${t('未绑定（当前仅存于浏览器）')}<br><span style="color:var(--text-light);font-size:0.9em;">${t('初始化时选择一次保存目录，之后工具自动创建数据库并读写')}</span>`; return; }
            if (s.error) { status.innerHTML = `${tf('类型：{type} · 文件：{name}', { type: t('SQLite 数据库'), name: s.name })}<br><span style="color:var(--text-light);font-size:0.9em;">${t('状态：异常，请重新绑定数据文件')}</span>`; return; }
            if (!s.authorized) { status.innerHTML = `${tf('类型：{type} · 文件：{name}', { type: t('SQLite 数据库'), name: s.name })}<br><span style="color:var(--text-light);font-size:0.9em;">${t('状态：需重新授权（见顶部横幅）')}</span>`; return; }
            if (s.empty) { status.innerHTML = `${tf('类型：{type} · 文件：{name}', { type: t('SQLite 数据库'), name: s.name })}<br><span style="color:var(--text-light);font-size:0.9em;">${t('状态：已联通（文件待写入）')}</span>`; return; }
            status.innerHTML = `${tf('类型：{type} · 文件：{name}', { type: t('SQLite 数据库'), name: s.name })}<br>
                <span style="color:var(--text-light);font-size:0.9em;">${tf('状态：已联通，每次保存自动写入 · 数据统计：笔记 {notes} 条 · 附件 {atts} 个 · 配置 {meta} 项', { notes: s.notes, atts: s.attachments, meta: s.meta })}</span>`;
        });
    },

    updateDataFileUI() {
        const status = document.getElementById('dataFileStatus');
        if (!status) return;
        const esc = n => String(n).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        (async () => {
            const sqliteHandle = await this.getSqliteFileHandle();
            // 已绑定 SQLite 但方案为浏览器存储：文件暂停同步
            if (sqliteHandle && this.getStorageMode() === 'browser') {
                status.innerHTML = `${tf('方案：浏览器存储 · SQLite 文件 {name} 已绑定但暂停同步', { name: esc(sqliteHandle.name) })}<br><span style="color:var(--text-light);font-size:0.9em;">${t('可在上方切换回 SQLite 存储恢复同步')}</span>`;
                return;
            }
            const jsonHandle = sqliteHandle ? null : await this.getDataFileHandle();
            const handle = sqliteHandle || jsonHandle;
            if (!handle) {
                status.innerHTML = `${t('未绑定（当前仅存于浏览器）')}<br><span style="color:var(--text-light);font-size:0.9em;">${t('初始化时选择一次保存目录，之后工具自动创建数据库并读写')}</span>`;
                return;
            }
            let state = t('已联通，每次保存自动写入');
            try {
                if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') state = t('需重新授权（见顶部横幅）');
            } catch (e) { state = t('状态异常'); }
            status.innerHTML = `${tf('类型：{type} · 文件：{name}', { type: sqliteHandle ? t('SQLite 数据库') : t('JSON 数据文件'), name: esc(handle.name) })}<br><span style="color:var(--text-light);font-size:0.9em;">${tf('状态：{state}', { state })}</span>`;
        })();
    },

    async createNote() {
        // 思维导图/流程图/代码编辑器模式下新建笔记：先切回笔记视图
        if (this.mindMode) this.toggleMindView();
        if (this.flowMode) this.toggleFlowView();
        if (this.codeMode) this.toggleCodeView();
        // 先保存当前笔记
        await this.flushCurrentNote();
        const note = {
            id:'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: t('新笔记'),
            content:'',
            date: this.currentDate || this.formatDate(new Date()),
            reminder: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sortOrder: Math.min(0, ...this.notes.map(n => typeof n.sortOrder === 'number' ? n.sortOrder : 1000)) - 1000,
            attachments: []
        };
        this.notes.unshift(note);
        await this.saveNoteData(note);
        this.currentNote = note;
        this.renderNoteList();
        this.renderEditor();
        this.renderCalendar();
        this.updateStats();
    },

    async deleteNote(id) {
        if (!confirm('确定删除此笔记？')) return;
        await DB.deleteNote(id);
        await this.bumpDataRev();
        this.scheduleDataFileExport();
        this.scheduleSqliteExport();
        this.notes = this.notes.filter(n => n.id !== id);
        if (this.currentNote && this.currentNote.id === id) {
            this.currentNote = null;
            this.renderEditor();
        }
        this.renderNoteList();
        this.renderCalendar();
        this.updateStats();
        this.updateTodoBadge();
        this.showToast('已删除');
    },

    async selectNote(id) {
        // 思维导图/流程图/代码编辑器模式下选中笔记：先切回笔记视图
        if (this.mindMode) this.toggleMindView();
        if (this.flowMode) this.toggleFlowView();
        if (this.codeMode) this.toggleCodeView();
        // 先保存当前
        await this.flushCurrentNote();
        this.currentNote = this.notes.find(n => n.id === id);
        // 高亮选中项
        document.querySelectorAll('.note-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
        });
        this.renderEditor();
    },

    // 同步 DOM 到数据
    syncEditorToNote() {
        if (!this.currentNote) return;
        this.currentNote.title = document.getElementById('noteTitle').value || '无标题';
        this.currentNote.content = document.getElementById('editorContent').innerHTML;
    },

    // 刷新/保存
    async flushCurrentNote() {
        if (!this.currentNote || !this._dirty) return;
        clearTimeout(this._saveTimer);
        this.syncEditorToNote();
        this.currentNote.updatedAt = new Date().toISOString();
        await this.saveNoteData(this.currentNote);
        this._dirty = false;
        this.renderEditorTime();
    },

    async updateCurrentNote() {
        if (!this.currentNote) return;
        this.syncEditorToNote();
        this.currentNote.updatedAt = new Date().toISOString();
        await this.saveNoteData(this.currentNote);
        this._dirty = false;
        this.renderNoteList();
        this.renderEditorTime();
        // 刷新待办列表
        if (this.currentListTab ==='todos') this.renderTodoList();
    },

    // ==================== 日历 ====================
    renderCalendar() {
        const year = this.calendarYear;
        const month = this.calendarMonth;
        document.getElementById('calendarTitle').textContent = calTitleText(year, month);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = this.formatDate(new Date());

        // 有笔记的日期
        const noteDates = new Set(this.notes.map(n => n.date));
        // 有提醒的日期
        const reminderDates = new Set(this.notes.filter(n => n.reminder).map(n => n.date));
        // 有 due 待办的日期
        const todoDates = new Set();
        for (const n of this.notes) {
            for (const t of (n.todos || [])) {
                if (t.due) todoDates.add(t.due.slice(0, 10));
            }
        }

        let html = calWeekdaysHtml();
        html += '<div class="cal-days">';

        for (let i = 0; i < firstDay; i++) {
            html += '<span class="cal-day empty"></span>';
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let cls = 'cal-day';
            if (dateStr === today) cls += ' today';
            if (dateStr === this.currentDate) cls += ' selected';
            if (noteDates.has(dateStr)) cls += ' has-note';
            if (reminderDates.has(dateStr)) cls += ' has-reminder';
            if (todoDates.has(dateStr)) cls += ' has-todo';
            html += `<span class="${cls}" onclick="App.onCalendarDayClick('${dateStr}')">${d}${todoDates.has(dateStr) ? '<i class="cal-todo-dot"></i>' : ''}</span>`;
        }
        html += '</div>';
        document.getElementById('calendarBody').innerHTML = html;
    },

    async onCalendarDayClick(dateStr) {
        // 再次点击已选中日期 → 取消选中，列表显示全部笔记
        if (dateStr === this.currentDate) {
            this.currentDate = null;
            this.renderCalendar();
            this.renderNoteList();
            this.renderTodoList();
            return;
        }
        this.currentDate = dateStr;
        this.renderCalendar();
        this.renderNoteList();
        this.renderTodoList();  // 刷新
        // 切换日期后自动选中该日期的第一篇笔记（按列表顺序：置顶 > 最后更新）
        const first = this.getSortedNotesForDate(dateStr)[0];
        if (first) await this.selectNote(first.id);
    },

    prevMonth() {
        this.calendarMonth--;
        if (this.calendarMonth < 0) { this.calendarMonth = 11; this.calendarYear--; }
        this.renderCalendar();
    },

    nextMonth() {
        this.calendarMonth++;
        if (this.calendarMonth > 11) { this.calendarMonth = 0; this.calendarYear++; }
        this.renderCalendar();
    },

    // ==================== 笔记列表 ====================
    // 排序 + 渲染
    getSortedNotesForDate(date) {
        // date 为空时显示全部笔记
        const filtered = date ? this.notes.filter(n => n.date === date) : [...this.notes];
        filtered.sort((a, b) => {
            // 置顶优先
            const pa = a.pinned ? 0 : 1;
            const pb = b.pinned ? 0 : 1;
            if (pa !== pb) return pa - pb;
            // 手动拖拽顺序优先
            if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number' && a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }
            // 按最后更新时间排序（最新在上），旧数据缺失时回退创建时间
            const ta = new Date(a.updatedAt || a.createdAt || 0);
            const tb = new Date(b.updatedAt || b.createdAt || 0);
            return tb - ta;
        });
        return filtered;
    },

    renderNoteList() {
        const filtered = this.getSortedNotesForDate(this.currentDate);
        const container = document.getElementById('noteList');
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-hint"><br></div>';
            return;
        }
        container.innerHTML = filtered.map(n => `
            <div class="note-item ${this.currentNote && this.currentNote.id === n.id ? 'active' : ''} ${n.pinned ? 'pinned' : ''}"
                 data-id="${n.id}"
                 draggable="true"
                 onclick="App.selectNote('${n.id}')"
                 ondragstart="App.onNoteDragStart(event, '${n.id}')"
                 ondragover="App.onNoteDragOver(event, '${n.id}')"
                 ondragleave="App.onNoteDragLeave(event, '${n.id}')"
                 ondrop="App.onNoteDrop(event, '${n.id}')"
                 ondragend="App.onNoteDragEnd()">
                <span class="drag-handle" title="${t('拖拽调整顺序')}">⠇</span>
                <div class="note-item-title" title="${this.escapeHtml(n.title).replace(/"/g, '&quot;')}">${this.escapeHtml(n.title)}</div>
                ${n.reminder ?`<span class="note-badge" title="${t('有提醒')}">⏰</span>` : ''}
                <button class="pin-btn ${n.pinned ? 'pinned' : ''}" onclick="event.stopPropagation();App.togglePin('${n.id}')" title="${n.pinned ? t('取消置顶') : t('置顶')}">📌</button>
            </div>
        `).join('');
    },

    // ==================== 拖拽排序 ====================
    onNoteDragStart(e, id) {
        this._dragNoteId = id;
        e.dataTransfer.effectAllowed = 'move';
        const el = document.querySelector(`.note-item[data-id="${id}"]`);
        if (el) setTimeout(() => el.classList.add('dragging'), 0);
    },

    onNoteDragOver(e, id) {
        if (!this._dragNoteId || this._dragNoteId === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const el = document.querySelector(`.note-item[data-id="${id}"]`);
        if (el) el.classList.add('drag-over');
    },

    onNoteDragLeave(e, id) {
        const el = document.querySelector(`.note-item[data-id="${id}"]`);
        if (el) el.classList.remove('drag-over');
    },

    async onNoteDrop(e, targetId) {
        e.preventDefault();
        const el = document.querySelector(`.note-item[data-id="${targetId}"]`);
        if (el) el.classList.remove('drag-over');
        await this.reorderNotes(this._dragNoteId, targetId);
    },

    onNoteDragEnd() {
        this._dragNoteId = null;
        document.querySelectorAll('.note-item.dragging, .note-item.drag-over').forEach(el => {
            el.classList.remove('dragging', 'drag-over');
        });
    },

    // 拖拽后重排：重新编号全部笔记并持久化
    async reorderNotes(dragId, targetId) {
        if (!dragId || !targetId || dragId === targetId) return;
        const visible = this.getSortedNotesForDate(this.currentDate);
        const dragIdx = visible.findIndex(n => n.id === dragId);
        const targetIdx = visible.findIndex(n => n.id === targetId);
        if (dragIdx < 0 || targetIdx < 0) return;
        const insertAfter = dragIdx < targetIdx;
        // 在全局顺序上执行移动
        const global = this.getSortedNotesForDate(null);
        const dragNote = global.find(n => n.id === dragId);
        const rest = global.filter(n => n.id !== dragId);
        const tIdx = rest.findIndex(n => n.id === targetId);
        if (tIdx < 0) return;
        rest.splice(insertAfter ? tIdx + 1 : tIdx, 0, dragNote);
        // 重新编号并持久化
        for (let i = 0; i < rest.length; i++) {
            rest[i].sortOrder = (i + 1) * 1000;
            await this.saveNoteData(rest[i]);
        }
        this.renderNoteList();
    },

    // 置顶/取消
    async togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        note.pinned = !note.pinned;
        await this.saveNoteData(note);
        this.renderNoteList();
        this.showToast(note.pinned ?'已置顶' : '已取消置顶');
    },

    // ==================== 列表切换 ====================
    // 笔记/待办 面板
    // 显示面板
    showListPanel(tab) {
        this.currentListTab = tab;
        document.getElementById('tabNotes').classList.toggle('active', tab === 'notes');
        document.getElementById('tabTodos').classList.toggle('active', tab === 'todos');
        document.getElementById('noteList').style.display = tab === 'notes' ? 'block' : 'none';
        document.getElementById('todoList').style.display = tab === 'todos' ? 'block' : 'none';
        // 切换按钮显示
        document.getElementById('newNoteBtn').style.display = tab === 'notes' ? '' : 'none';
    },

    switchListTab(tab) {
        this.showListPanel(tab);
        if (tab === 'todos') this.renderTodoList();
    },

    // 获取所有待办
    getAllTodos() {
        const all = [];
        for (const note of this.notes) {
            if (note.todos && note.todos.length) {
                for (const todo of note.todos) {
                    all.push({ noteId: note.id, noteTitle: note.title, todo });
                }
            }
        }
        // 排序
        all.sort((a, b) => {
            if (a.todo.done !== b.todo.done) return a.todo.done ? 1 : -1;
            return new Date(b.todo.createdAt) - new Date(a.todo.createdAt);
        });
        return all;
    },

    // 按日期/创建/全部 渲染
    renderTodoList() {
        const container = document.getElementById('todoList');
        const mode = this.todoViewMode || 'due';
        let html = `
            <div class="todo-view-toggle">
                <button class="todo-view-btn ${mode === 'created' ? 'active' : ''}" onclick="App.setTodoViewMode('created')"><span class="view-icon">${this.iconCreate}</span></button>
                <button class="todo-view-btn ${mode ==='due' ? 'active' : ''}" onclick="App.setTodoViewMode('due')"><span class="view-icon">${this.iconDue}</span></button>
                <button class="todo-view-btn ${mode ==='all' ? 'active' : ''}" onclick="App.setTodoViewMode('all')"><span class="view-icon">${this.iconAll}</span></button>
            </div>`;
        if (mode ==='created') html += this.renderCreatedView();
        else if (mode === 'due') html += this.renderDueView();
        else html += this.renderAllTodos();
        container.innerHTML = html;
    },

    // 设置视图模式
    setTodoViewMode(mode) {
        this.todoViewMode = mode;
        this.renderTodoList();
    },

    // 待办项 HTML
    todoItemHtml(noteId, noteTitle, todo) {
        const dueTag = todo.due ? `<span class="todo-due">${t('截止')} ${todo.due.replace('T', ' ')}</span>` : '';
        return `
            <div class="todo-item ${todo.done ? 'done' : ''}">
                <input type="checkbox" class="todo-check" ${todo.done ? 'checked' : ''} onchange="App.toggleTodo('${noteId}','${todo.id}')">
                <div class="todo-body">
                    <div class="todo-text" onclick="App.showTodoDetail('${noteId}','${todo.id}')" title="${this.escapeHtml(todo.text).replace(/"/g, '&quot;')}">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-source">${t('来自')} ${this.escapeHtml(noteTitle)} ${dueTag}</div>
                </div>
                <button class="todo-del" onclick="App.deleteTodo('${noteId}','${todo.id}')" title="${t('删除')}">✕</button>
            </div>`;
    },

    // 当日待办
    renderDueView() {
        const date = this.currentDate;
        const todos = [];
        for (const n of this.notes) {
            for (const t of (n.todos || [])) {
                if (t.due && (!date || t.due.slice(0, 10) === date)) todos.push({ noteId: n.id, noteTitle: n.title, todo: t });
            }
        }
        todos.sort((a, b) => {
            if (a.todo.done !== b.todo.done) return a.todo.done ? 1 : -1;
            return (a.todo.due ||'').localeCompare(b.todo.due || '');
        });
        if (todos.length === 0) {
            return `<div class="empty-hint"><br>${date ? t('当日无待办') : t('暂无待办')}</div>`;
        }
        return todos.map(x => this.todoItemHtml(x.noteId, x.noteTitle, x.todo)).join('');
    },

    // 当日创建
    renderCreatedView() {
        const date = this.currentDate;
        const todos = [];
        for (const n of this.notes) {
            for (const t of (n.todos || [])) {
                if (t.createdAt && (!date || this.formatDate(new Date(t.createdAt)) === date)) todos.push({ noteId: n.id, noteTitle: n.title, todo: t });
            }
        }
        todos.sort((a, b) => {
            if (a.todo.done !== b.todo.done) return a.todo.done ? 1 : -1;
            return new Date(b.todo.createdAt) - new Date(a.todo.createdAt);
        });
        if (todos.length === 0) {
            return `<div class="empty-hint">${date ? t('当日无创建') : t('暂无创建')}<br></div>`;
        }
        return todos.map(x => this.todoItemHtml(x.noteId, x.noteTitle, x.todo)).join('');
    },

    // 
    renderAllTodos() {
        const all = this.getAllTodos();
        if (all.length === 0) {
            return `<div class="empty-hint"><br>${t('暂无待办')}</div>`;
        }
        return all.map(x => this.todoItemHtml(x.noteId, x.noteTitle, x.todo)).join('');
    },

    // 获取编辑器选中文本
    getEditorSelectedText() {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return'';
        const range = sel.getRangeAt(0);
        const editor = document.getElementById('editorContent');
        if (!editor.contains(range.commonAncestorContainer)) return '';
        return sel.toString().trim();
    },

    // 生成待办
    // 选中文本或全文
    generateTodos() {
        if (!this.currentNote) { this.showToast('请先选择笔记', 'error'); return; }
        // 获取选中文本
        const selected = this.getEditorSelectedText();
        let raw;
        if (selected) {
            raw = selected;
        } else {
            const tmp = document.createElement('div');
            tmp.innerHTML = this.currentNote.content || '';
            raw = tmp.textContent || '';
        }
        const lines = raw.split(/\n+/).map(s => s.trim()).filter(s => s.length > 0);
        if (lines.length === 0) { this.showToast('内容为空', 'error'); return; }
        // 首行为标题
        const title = lines[0];
        const desc = lines.slice(1).join('\n');
        this.openTodoModal(title, desc);
    },

    // 弹窗 + 确认
    openTodoModal(title, desc) {
        this._pendingTodo = { title, desc };
        document.getElementById('todoPreviewCount').textContent = '1';
        document.getElementById('todoPreviewList').innerHTML = `
            <div class="todo-preview-item todo-preview-title">${this.escapeHtml(title)}</div>
            ${desc ? `<div class="todo-preview-desc">${this.escapeHtml(desc)}</div>` : ''}`;
        // 默认截止 09:00
        document.getElementById('todoDueInput').value = (this.currentDate || this.formatDate(new Date())) + 'T09:00';
        document.getElementById('todoModal').style.display = 'flex';
    },

    // 
    async confirmGenerateTodos() {
        const due = document.getElementById('todoDueInput').value;
        if (!due) { this.showToast('请选择截止时间', 'error'); return; }
        const pending = this._pendingTodo;
        if (!this.currentNote || !pending || !pending.title) { this.closeModal('todoModal'); return; }
        if (!this.currentNote.todos) this.currentNote.todos = [];
        // 跳过重复
        const existing = new Set(this.currentNote.todos.map(t => t.text));
        this.closeModal('todoModal');
        if (existing.has(pending.title)) { this.showToast('待办已存在'); return; }
        this.currentNote.todos.push({
            id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            text: pending.title,
            desc: pending.desc || '',
            done: false,
            due,
            createdAt: new Date().toISOString()
        });
        await this.saveNoteData(this.currentNote);
        this.updateTodoBadge();
        this.renderCalendar();   // 刷新日历
        this.renderTodoList();
        this.showToast('已添加 1 条待办');
    },

    // 切换完成状态
    async toggleTodo(noteId, todoId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        const todo = (note.todos || []).find(t => t.id === todoId);
        if (!todo) return;
        todo.done = !todo.done;
        await this.saveNoteData(note);
        this.renderTodoList();
        this.updateTodoBadge();
    },

    // 删除待办
    async deleteTodo(noteId, todoId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        note.todos = (note.todos || []).filter(t => t.id !== todoId);
        await this.saveNoteData(note);
        this.renderTodoList();
        this.renderCalendar();  // 刷新日历
        this.updateTodoBadge();
    },

    // 显示详情
    showTodoDetail(noteId, todoId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            // 笔记已删除
            this.showToast('笔记已删除', 'error');
            this.renderTodoList();
            return;
        }
        const todo = (note.todos || []).find(t => t.id === todoId);
        if (!todo) return;
        this.todoDetailTarget = { noteId, todoId };
        this.renderTodoDetail(note, todo);
        document.getElementById('todoDetailModal').style.display = 'flex';
    },

    // 渲染详情
    renderTodoDetail(note, todo) {
        const createdStr = todo.createdAt
            ? `${this.formatDate(new Date(todo.createdAt))} ${this.formatTime(todo.createdAt)}`
            : t('无');
        const dueStr = todo.due ? todo.due.replace('T', ' ') : t('无');
        const statusHtml = todo.done
            ? `<span class="todo-detail-status done">${t('已完成')}</span>`
            : `<span class="todo-detail-status pending">${t('未完成')}</span>`;
        document.getElementById('todoDetailText').textContent = todo.text;
        // 描述显示
        const descEl = document.getElementById('todoDetailDesc');
        if (todo.desc) {
            descEl.textContent = todo.desc;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }
        document.getElementById('todoDetailInfo').innerHTML = `
            <div class="todo-detail-row"><span class="todo-detail-label">${t('状态')}</span>${statusHtml}</div>
            <div class="todo-detail-row"><span class="todo-detail-label">${t('来源')}</span><span class="todo-detail-value">${t('来自')} ${this.escapeHtml(note.title)}</span></div>
            <div class="todo-detail-row"><span class="todo-detail-label">${t('截止')}</span><span class="todo-detail-value">${t('截止')} ${this.escapeHtml(dueStr)}</span></div>
            <div class="todo-detail-row"><span class="todo-detail-label">${t('创建')}</span><span class="todo-detail-value">${t('创建')} ${this.escapeHtml(createdStr)}</span></div>`;
        // 
        document.getElementById('todoDetailToggleBtn').textContent = todo.done ? t('标记未完成') : t('标记完成');
    },

    // 从详情切换
    async toggleTodoFromDetail() {
        if (!this.todoDetailTarget) return;
        const { noteId, todoId } = this.todoDetailTarget;
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        const todo = (note.todos || []).find(t => t.id === todoId);
        if (!todo) return;
        todo.done = !todo.done;
        await this.saveNoteData(note);
        this.renderTodoList();
        this.updateTodoBadge();
        this.renderTodoDetail(note, todo);  // 刷新详情
    },

    // 从详情删除
    async deleteTodoFromDetail() {
        if (!this.todoDetailTarget) return;
        const { noteId, todoId } = this.todoDetailTarget;
        await this.deleteTodo(noteId, todoId);
        this.closeModal('todoDetailModal');
        this.todoDetailTarget = null;
    },

    // 跳转来源笔记
    async jumpToSourceNote() {
        if (!this.todoDetailTarget) return;
        const { noteId } = this.todoDetailTarget;
        const note = this.notes.find(n => n.id === noteId);
        if (!note) { this.showToast('笔记不存在', 'error'); return; }
        this.closeModal('todoDetailModal');
        this.todoDetailTarget = null;
        this.showListPanel('notes');   // 切换面板
        await this.selectNote(noteId); // 跳转
    },

    // 更新待办角标
    updateTodoBadge() {
        const pending = this.getAllTodos().filter(x => !x.todo.done).length;
        const badge = document.getElementById('todoBadge');
        badge.textContent = pending;
        badge.style.display = pending > 0 ? 'inline-flex' : 'none';
        this.updateStats();  // 同步统计
    },

    // ==================== 编辑器 ====================
    renderEditor() {
        const editorPanel = document.getElementById('editorPanel');
        const emptyPanel = document.getElementById('emptyPanel');
        if (!this.currentNote) {
            editorPanel.style.display = 'none';
            emptyPanel.style.display = 'flex';
            return;
        }
        editorPanel.style.display = 'flex';
        emptyPanel.style.display = 'none';

        document.getElementById('noteTitle').value = this.currentNote.title;
        document.getElementById('editorContent').innerHTML = this.currentNote.content || '';
        this.clearEditorImageSelection(); // 清除图片选中
        document.getElementById('noteReminder').value = this.currentNote.reminder || '';
        this.renderEditorTime();
        this.renderAttachments();
    },

    // 编辑器右上角显示最后更新时间
    renderEditorTime() {
        const el = document.getElementById('noteUpdatedTime');
        if (!el) return;
        el.textContent = this.currentNote ? `${this.currentNote.date} ${this.formatTime(this.currentNote.updatedAt)}` : '';
    },

    // 执行命令
    execCmd(cmd, value) {
        document.getElementById('editorContent').focus();
        document.execCommand(cmd, false, value || null);
        this.updateCurrentNote();
    },

    // 保存选区
    saveEditorSelection() {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const editor = document.getElementById('editorContent');
            if (editor.contains(range.commonAncestorContainer)) {
                this._savedRange = range.cloneRange();
            }
        }
    },

    // 为选中文本插入超链接
    insertLink() {
        const editor = document.getElementById('editorContent');
        const range = this._savedRange;
        if (!range || range.collapsed || !editor.contains(range.commonAncestorContainer)) {
            this.showToast('请先选中要设置链接的文本', 'error');
            return;
        }
        // 检测选区是否已在链接内：已在链接内再次点击 = 移除链接
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentElement;
        const existingA = node && node.closest ? node.closest('a[href]') : null;
        if (existingA) {
            editor.focus();
            const sel = window.getSelection();
            const linkRange = document.createRange();
            linkRange.selectNodeContents(existingA);
            sel.removeAllRanges();
            sel.addRange(linkRange);
            document.execCommand('unlink');
            this.updateCurrentNote();
            this.showToast('链接已移除');
            return;
        }
        const url = prompt('请输入链接地址：', 'https://');
        if (url === null) return;
        editor.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        if (!url.trim()) { this.showToast('链接地址为空，未设置', 'error'); return; }
        document.execCommand('createLink', false, url.trim());
        editor.querySelectorAll('a[href]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
        this.updateCurrentNote();
        this.showToast('链接已添加');
    },

    // 为选中文本加注释（鼠标悬浮显示注释内容）
    insertAnnotation() {
        const editor = document.getElementById('editorContent');
        const range = this._savedRange;
        if (!range || range.collapsed || !editor.contains(range.commonAncestorContainer)) {
            this.showToast('请先选中要加注释的文本', 'error');
            return;
        }
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentElement;
        const existing = node && node.closest ? node.closest('span.note-annotation') : null;
        // 已在注释内再次点击 = 直接移除注释
        if (existing) {
            const parent = existing.parentNode;
            while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
            parent.removeChild(existing);
            parent.normalize();
            this.updateCurrentNote();
            this.showToast('注释已移除');
            return;
        }
        const note = prompt('请输入注释内容（鼠标悬浮显示）：', '');
        if (note === null) return;
        editor.focus();
        if (!note.trim()) { this.showToast('注释内容为空，未添加', 'error'); return; }
        const span = document.createElement('span');
        span.className = 'note-annotation';
        span.title = note.trim();
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try {
            range.surroundContents(span);
        } catch (e) {
            // 跨节点选区无法直接包围，改为提取后包裹
            span.appendChild(range.extractContents());
            range.insertNode(span);
        }
        this.showToast('注释已添加');
        this.updateCurrentNote();
    },

    // 插入图片：打开文件选择
    triggerImageInsert() {
        document.getElementById('editorImageInput').click();
    },

    // 选择图片后读取并插入编辑区
    onEditorImagePicked(e) {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('图片超过 5MB，请压缩后再插入', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const editor = document.getElementById('editorContent');
            editor.focus();
            const sel = window.getSelection();
            if (this._savedRange && editor.contains(this._savedRange.commonAncestorContainer)) {
                sel.removeAllRanges();
                sel.addRange(this._savedRange);
            } else {
                // 无有效选区时插入到内容末尾
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            document.execCommand('insertImage', false, reader.result);
            this.updateCurrentNote();
            this.showToast('图片已插入');
        };
        reader.readAsDataURL(file);
    },

    // 插入表格：可视化网格选择器
    toggleTablePicker(e) {
        e.stopPropagation();
        const pop = document.getElementById('tablePickerPopover');
        if (pop.classList.contains('open')) { this.hideTablePicker(); return; }
        // 只绑定一次外部点击关闭
        if (!this._pickerOutsideClick) {
            this._pickerOutsideClick = true;
            document.addEventListener('click', (ev) => {
                const p = document.getElementById('tablePickerPopover');
                if (p && p.classList.contains('open') && !p.contains(ev.target)) this.hideTablePicker();
            });
        }
        this.buildTablePickerGrid();
        pop.classList.add('open');
        // 固定坐标定位到表格按钮正下方（顶部工具栏与悬浮工具栏通用）
        const btnRect = e.currentTarget.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min(btnRect.left, window.innerWidth - pop.offsetWidth - 8)) + 'px';
        pop.style.top = (btnRect.bottom + 6) + 'px';
        this.highlightPickerSize(1, 1);
    },

    buildTablePickerGrid() {
        const grid = document.getElementById('tablePickerGrid');
        if (grid.dataset.built) return;
        for (let r = 1; r <= 10; r++) {
            for (let c = 1; c <= 10; c++) {
                const cell = document.createElement('div');
                cell.className = 'table-picker-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.onmouseenter = () => this.highlightPickerSize(r, c);
                cell.onclick = (ev) => { ev.stopPropagation(); this.pickTableSize(r, c); };
                grid.appendChild(cell);
            }
        }
        grid.dataset.built = '1';
    },

    highlightPickerSize(rows, cols) {
        document.querySelectorAll('#tablePickerGrid .table-picker-cell').forEach(el => {
            el.classList.toggle('sel', +el.dataset.r <= rows && +el.dataset.c <= cols);
        });
        document.getElementById('tablePickerLabel').textContent = `${rows} × ${cols}`;
    },

    hideTablePicker() {
        const pop = document.getElementById('tablePickerPopover');
        if (pop) pop.classList.remove('open');
    },

    pickTableSize(rows, cols) {
        this.hideTablePicker();
        this.insertTable(rows, cols);
    },

    insertTable(rows, cols) {
        rows = Math.max(1, Math.min(rows || 3, 30));
        cols = Math.max(1, Math.min(cols || 3, 12));
        const editor = document.getElementById('editorContent');
        editor.focus();
        const sel = window.getSelection();
        if (this._savedRange && editor.contains(this._savedRange.commonAncestorContainer)) {
            sel.removeAllRanges();
            sel.addRange(this._savedRange);
        } else {
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        let html = '<table>';
        for (let r = 0; r < rows; r++) {
            html += '<tr>';
            const tag = r === 0 ? 'th' : 'td';
            for (let c = 0; c < cols; c++) html += `<${tag}>&nbsp;</${tag}>`;
            html += '</tr>';
        }
        html += '</table><p><br></p>';
        document.execCommand('insertHTML', false, html);
        this.updateCurrentNote();
        this.showToast('表格已插入');
    },

    // ===== 表格行高/列宽拖动调整 =====
    initTableResizer() {
        const editor = document.getElementById('editorContent');
        if (!editor || editor.dataset.resizerReady) return;
        editor.dataset.resizerReady = '1';
        const EDGE = 5; // 边框吸附距离(px)
        const hitInfo = (e) => {
            const cell = e.target.closest && e.target.closest('td, th');
            if (!cell || !editor.contains(cell)) return null;
            const rect = cell.getBoundingClientRect();
            const nearRight = Math.abs(e.clientX - rect.right) <= EDGE;
            const nearBottom = Math.abs(e.clientY - rect.bottom) <= EDGE;
            if (!nearRight && !nearBottom) return null;
            // 表格右下角：整表等比缩放（优先于单列/单行）
            const table = cell.closest('table');
            const lastRow = table && table.rows[table.rows.length - 1];
            const isCorner = nearRight && nearBottom && lastRow &&
                lastRow.children[lastRow.children.length - 1] === cell;
            if (isCorner) return { cell, corner: true };
            return { cell, col: nearRight, row: nearBottom };
        };
        editor.addEventListener('mousemove', (e) => {
            if (this._resizingTable) return;
            const info = hitInfo(e);
            editor.style.cursor = !info ? '' : (info.corner ? 'nwse-resize' : (info.col ? 'col-resize' : 'row-resize'));
        });
        editor.addEventListener('mousedown', (e) => {
            const info = hitInfo(e);
            if (!info) return;
            e.preventDefault();
            e.stopPropagation();
            this.startTableResize(e, info);
        });
    },

    startTableResize(e, info) {
        const table = info.cell.closest('table');
        if (!table) return;
        this._resizingTable = true;
        const startX = e.clientX, startY = e.clientY;
        let targets = [], starts = [], rows = [], rowStarts = [], startW = 0;
        if (info.corner) {
            // 整表缩放：横纵独立（记录所有单元格宽度与所有行高）
            startW = table.offsetWidth;
            this._cornerStartH = table.offsetHeight;
            targets = Array.from(table.querySelectorAll('td, th'));
            starts = targets.map(c => c.offsetWidth);
            rows = Array.from(table.querySelectorAll('tr'));
            rowStarts = rows.map(tr => tr.offsetHeight);
        } else if (info.col) {
            // 目标列的所有单元格
            const colIdx = info.cell.cellIndex;
            table.querySelectorAll('tr').forEach(tr => {
                const cell = tr.children[colIdx];
                if (cell) targets.push(cell);
            });
            starts = targets.map(c => c.offsetWidth);
        } else {
            // 目标行
            const tr = info.cell.parentElement;
            targets = [tr];
            starts = [tr.offsetHeight];
        }
        const onMove = (ev) => {
            if (info.corner) {
                // 横纵独立缩放：横向拖只缩放所有列宽，纵向拖只缩放所有行高
                let kx = (startW + (ev.clientX - startX)) / startW;
                let ky = (this._cornerStartH + (ev.clientY - startY)) / this._cornerStartH;
                kx = Math.max(0.2, Math.min(kx, 5));
                ky = Math.max(0.2, Math.min(ky, 5));
                targets.forEach((c, i) => { c.style.width = Math.max(20, Math.round(starts[i] * kx)) + 'px'; });
                rows.forEach((tr, i) => { tr.style.height = Math.max(16, Math.round(rowStarts[i] * ky)) + 'px'; });
            } else if (info.col) {
                const dx = ev.clientX - startX;
                targets.forEach((c, i) => { c.style.width = Math.max(30, starts[i] + dx) + 'px'; });
            } else {
                const dy = ev.clientY - startY;
                targets[0].style.height = Math.max(20, starts[0] + dy) + 'px';
            }
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            this._resizingTable = false;
            document.getElementById('editorContent').style.cursor = '';
            this.updateCurrentNote();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    },

    // 颜色/高亮
    applyColor(cmd, value) {
        const editor = document.getElementById('editorContent');
        editor.focus();
        // 恢复选区
        if (this._savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this._savedRange);
        }
        // hiliteColor 需要 styleWithCSS
        if (cmd ==='hiliteColor') {
            document.execCommand('styleWithCSS', false, true);
        }
        document.execCommand(cmd, false, value);
        if (cmd === 'hiliteColor') {
            document.execCommand('styleWithCSS', false, false);
        }
        // 同步工具栏按钮上的颜色指示条
        if (cmd === 'foreColor') {
            const ind = document.getElementById('textColorInd');
            if (ind) ind.style.background = value;
        } else if (cmd === 'hiliteColor') {
            const ind = document.getElementById('bgColorInd');
            if (ind) ind.style.background = value;
        }
        this.updateCurrentNote();
    },

    // ==================== 颜色预设面板 ====================
    // 文字颜色预设：黑、灰、暗红、红、蓝、深紫、暗绿
    TEXT_COLOR_PRESETS: [
        { name: '黑色', color: '#000000' },
        { name: '灰色', color: '#718096' },
        { name: '暗红', color: '#9b2c2c' },
        { name: '红色', color: '#e53e3e' },
        { name: '蓝色', color: '#3182ce' },
        { name: '深紫', color: '#553c9a' },
        { name: '暗绿', color: '#276749' }
    ],
    // 高亮/背景色预设：荧光笔鲜艳配色（参考 Office 高亮色板）
    BG_COLOR_PRESETS: [
        { name: '荧光黄', color: '#ffff00' },
        { name: '荧光绿', color: '#00ff00' },
        { name: '荧光青', color: '#00ffff' },
        { name: '荧光粉', color: '#ff00ff' },
        { name: '荧光蓝', color: '#00bfff' },
        { name: '荧光橙', color: '#ffa500' },
        { name: '荧光红', color: '#ff6b6b' },
        { name: '无（取消高亮）', color: '#ffffff' }
    ],

    // 点击工具栏按钮：开关色板
    toggleColorPanel(kind, anchorEl) {
        if (this._colorPanel && this._colorPanelKind === kind) {
            this.hideColorPanel();
            return;
        }
        this.showColorPanel(kind, anchorEl);
    },

    // 显示预设色板；点“其它”才弹出完整颜色选择器
    showColorPanel(kind, anchorEl) {
        this.hideColorPanel();
        const isText = kind === 'text';
        const presets = isText ? this.TEXT_COLOR_PRESETS : this.BG_COLOR_PRESETS;
        const cmd = isText ? 'foreColor' : 'hiliteColor';
        const panel = document.createElement('div');
        panel.className = 'color-panel';
        panel.innerHTML = `<div class="color-panel-title">${isText ? '文字颜色' : '高亮颜色'}</div>
            <div class="color-panel-grid">
                ${presets.map(p => `<button class="color-swatch" style="background:${p.color}" title="${p.name}" data-c="${p.color}"></button>`).join('')}
                <button class="color-swatch-more" title="其它颜色">其它</button>
            </div>`;
        document.body.appendChild(panel);
        const r = anchorEl.getBoundingClientRect();
        panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - panel.offsetWidth - 8)) + 'px';
        panel.style.top = (r.bottom + 6) + 'px';
        panel.querySelectorAll('.color-swatch').forEach(btn => {
            btn.onclick = () => {
                this.applyColor(cmd, btn.dataset.c);
                this.hideColorPanel();
            };
        });
        panel.querySelector('.color-swatch-more').onclick = () => {
            this.hideColorPanel();
            const input = document.getElementById(isText ? 'textColorCustom' : 'bgColorCustom');
            input.onchange = () => {
                this.applyColor(cmd, input.value);
                input.onchange = null;
            };
            input.click();
        };
        this._colorPanel = panel;
        this._colorPanelKind = kind;
        // 延迟绑定外部点击关闭，避免本次点击立即关闭
        setTimeout(() => {
            this._colorPanelOutside = (e) => {
                if (panel.contains(e.target)) return;
                if (e.target.closest && e.target.closest('.color-toggle')) return;
                this.hideColorPanel();
            };
            document.addEventListener('mousedown', this._colorPanelOutside);
        }, 0);
    },

    hideColorPanel() {
        if (this._colorPanel) { this._colorPanel.remove(); this._colorPanel = null; }
        if (this._colorPanelOutside) {
            document.removeEventListener('mousedown', this._colorPanelOutside);
            this._colorPanelOutside = null;
        }
        this._colorPanelKind = null;
    },

    // ==================== 悬浮富文本工具栏 ====================
    // 克隆顶部富文本工具栏为左侧悬浮栏：可拖动、可收缩、默认展开
    initFloatingToolbar() {
        if (document.getElementById('floatingToolbar')) return;
        const src = document.querySelector('.editor-toolbar');
        if (!src) return;
        const bar = document.createElement('div');
        bar.id = 'floatingToolbar';
        bar.className = 'floating-toolbar';
        bar.innerHTML = `<div class="ft-head" title="拖拽移动">
            <span class="ft-drag">⠿</span><span class="ft-title">格式</span>
            <button class="ft-collapse" title="收缩/展开">−</button>
        </div><div class="ft-body"></div>`;
        const body = bar.querySelector('.ft-body');
        const clone = src.cloneNode(true);
        // 去掉不能重复的元素（隐藏选择器/表格弹层/图片输入），指示块去重 id
        clone.querySelectorAll('[id]').forEach(el => {
            if (el.id === 'textColorInd' || el.id === 'bgColorInd') el.removeAttribute('id');
            else el.remove();
        });
        while (clone.firstChild) body.appendChild(clone.firstChild);
        document.body.appendChild(bar);

        // 恢复位置与收缩状态
        try {
            const pos = JSON.parse(localStorage.getItem('floating_toolbar_pos') || 'null');
            if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
                bar.style.left = Math.max(0, Math.min(pos.x, window.innerWidth - 60)) + 'px';
                bar.style.top = Math.max(0, Math.min(pos.y, window.innerHeight - 40)) + 'px';
            }
            if (localStorage.getItem('floating_toolbar_collapsed') === '1') {
                bar.classList.add('collapsed');
                bar.querySelector('.ft-collapse').textContent = '+';
            }
        } catch (e) { /* 忽略损坏的配置 */ }

        // 收缩/展开
        bar.querySelector('.ft-collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            const collapsed = bar.classList.toggle('collapsed');
            e.currentTarget.textContent = collapsed ? '+' : '−';
            localStorage.setItem('floating_toolbar_collapsed', collapsed ? '1' : '0');
        });

        // 拖拽移动（按住标题栏）
        const head = bar.querySelector('.ft-head');
        head.addEventListener('mousedown', (e) => {
            if (e.target.closest('.ft-collapse')) return;
            e.preventDefault();
            const rect = bar.getBoundingClientRect();
            const dx = e.clientX - rect.left, dy = e.clientY - rect.top;
            const move = (ev) => {
                const x = Math.max(0, Math.min(ev.clientX - dx, window.innerWidth - rect.width));
                const y = Math.max(0, Math.min(ev.clientY - dy, window.innerHeight - 32));
                bar.style.left = x + 'px';
                bar.style.top = y + 'px';
            };
            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                localStorage.setItem('floating_toolbar_pos', JSON.stringify({ x: parseInt(bar.style.left) || 0, y: parseInt(bar.style.top) || 0 }));
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });

        // 编辑面板隐藏时（思维导图/流程图/代码模式）同步隐藏悬浮栏
        new MutationObserver(() => this.updateFloatingToolbarVisibility())
            .observe(document.getElementById('editorPanel'), { attributes: true, attributeFilter: ['style'] });
        // 滚过一个完整页面后才显示悬浮栏（顶部工具栏可见时不需要它）
        // 实际滚动容器可能是外层 pageBody（整页滚动）或 editorContent（内部滚动），两者都监听
        const onScroll = () => this.updateFloatingToolbarVisibility();
        document.getElementById('editorContent').addEventListener('scroll', onScroll, { passive: true });
        document.getElementById('pageBody').addEventListener('scroll', onScroll, { passive: true });
        this.updateFloatingToolbarVisibility();
    },

    updateFloatingToolbarVisibility() {
        const bar = document.getElementById('floatingToolbar');
        if (!bar) return;
        const editorVisible = document.getElementById('editorPanel').style.display !== 'none';
        const scrolledPast = (el) => el.clientHeight > 0 && el.scrollTop >= el.clientHeight * 0.9;
        const ed = document.getElementById('editorContent');
        const page = document.getElementById('pageBody');
        bar.style.display = editorVisible && (scrolledPast(ed) || scrolledPast(page)) ? '' : 'none';
    },

    // ==================== 图片缩放 ====================
    initImageResize() {
        const editor = document.getElementById('editorContent');
        this._imgOverlay = document.getElementById('imgResizeOverlay');
        this._imgTip = document.getElementById('imgResizeTip');
        this._selectedImg = null;

        // 点击图片选中
        editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.selectEditorImage(e.target);
            } else {
                this.clearEditorImageSelection();
            }
        });

        // 双击复位尺寸
        editor.addEventListener('dblclick', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                e.target.style.width = '';
                e.target.style.height = '';
                this.positionImageOverlay();
                this.updateCurrentNote();
            }
        });

        // 拖拽调整宽度
        document.getElementById('imgResizeHandle').addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const img = this._selectedImg;
            if (!img) return;
            const startX = e.clientX;
            const startWidth = img.getBoundingClientRect().width;
            const onMove = (ev) => {
                const w = Math.max(30, Math.round(startWidth + (ev.clientX - startX)));
                img.style.width = w + 'px';
                img.style.height = 'auto';
                this.positionImageOverlay();
                this._imgTip.textContent = Math.round(img.getBoundingClientRect().width) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                this._imgTip.textContent = '';
                this.updateCurrentNote();
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // 滚动/窗口调整
        editor.addEventListener('scroll', () => { if (this._selectedImg) this.positionImageOverlay(); });
        window.addEventListener('resize', () => { if (this._selectedImg) this.positionImageOverlay(); });

        // Esc 取消选中
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._selectedImg) this.clearEditorImageSelection();
        });
    },

    selectEditorImage(img) {
        if (this._selectedImg && this._selectedImg !== img) {
            this._selectedImg.classList.remove('img-selected');
        }
        this._selectedImg = img;
        img.classList.add('img-selected');
        this.positionImageOverlay();
    },

    clearEditorImageSelection() {
        if (this._selectedImg) {
            this._selectedImg.classList.remove('img-selected');
            this._selectedImg = null;
        }
        if (this._imgOverlay) this._imgOverlay.style.display = 'none';
    },

    // 定位浮层
    positionImageOverlay() {
        const img = this._selectedImg;
        const ov = this._imgOverlay;
        if (!ov) return;
        if (!img || !img.isConnected) { this.clearEditorImageSelection(); return; }
        const card = document.querySelector('.editor-card');
        const editor = document.getElementById('editorContent');
        const cardRect = card.getBoundingClientRect();
        const edRect = editor.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const top = Math.max(imgRect.top, edRect.top);
        const left = Math.max(imgRect.left, edRect.left);
        const bottom = Math.min(imgRect.bottom, edRect.bottom);
        const right = Math.min(imgRect.right, edRect.right);
        if (bottom <= top || right <= left) { ov.style.display = 'none'; return; }
        ov.style.display = 'block';
        ov.style.left = (left - cardRect.left) + 'px';
        ov.style.top = (top - cardRect.top) + 'px';
        ov.style.width = (right - left) + 'px';
        ov.style.height = (bottom - top) + 'px';
    },


    // 设置提醒
    async setReminder() {
        if (!this.currentNote) return;
        // 同步保存
        this.syncEditorToNote();
        clearTimeout(this._saveTimer);
        this._dirty = false;
        const val = document.getElementById('noteReminder').value;
        this.currentNote.reminder = val;
        await this.saveNoteData(this.currentNote);
        this.renderCalendar();
        this.updateStats();
        this.renderNoteList();
        this.showToast(val ? '提醒已设置' : '提醒已取消');
        // 失焦
        setTimeout(() => document.getElementById('noteReminder').blur(), 0);
    },

    // ==================== 附件 ====================
    async uploadAttachment() {
        if (!this.currentNote) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = async (e) => {
            for (const file of e.target.files) {
                const encryptedBlob = await CryptoManager.encryptBlob(file);
                const att = {
                    id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    noteId: this.currentNote.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: encryptedBlob,
                    createdAt: new Date().toISOString()
                };
                await DB.saveAttachment(att);
                if (!this.currentNote.attachments) this.currentNote.attachments = [];
                this.currentNote.attachments.push({ id: att.id, name: file.name, type: file.type, size: file.size });
                await this.saveNoteData(this.currentNote);
            }
            this.renderAttachments();
            this.renderNoteList();
            this.updateStats();
            this.showToast('上传完成');
        };
        input.click();
    },

    renderAttachments() {
        const container = document.getElementById('attachmentList');
        const count = (this.currentNote && this.currentNote.attachments) ? this.currentNote.attachments.length : 0;
        // 附件数量
        document.getElementById('attachCount').textContent = count > 0 ? count : '';
        if (!this.currentNote || !this.currentNote.attachments || this.currentNote.attachments.length === 0) {
            container.innerHTML = `<div class="empty-hint">${t('暂无附件')}</div>`;
            return;
        }
        container.innerHTML = this.currentNote.attachments.map(att => `
            <div class="attachment-item">
                <span class="att-icon">${this.getFileIcon(att.type)}</span>
                <span class="att-name" title="${this.escapeHtml(att.name)}">${this.escapeHtml(att.name)}</span>
                <span class="att-size">${this.formatSize(att.size)}</span>
                <button class="btn-sm" onclick="App.previewAttachment('${att.id}')" title="${t('预览')}">👁</button>
                <button class="btn-sm" onclick="App.downloadAttachment('${att.id}')" title="${t('下载')}">⬇</button>
                <button class="btn-sm btn-danger" onclick="App.removeAttachment('${att.id}')" title="${t('删除')}">✕</button>
            </div>
        `).join('');
    },

    // 展开/收起
    toggleAttachmentPanel() {
        document.getElementById('attachmentCard').classList.toggle('collapsed');
    },

    toggleCalendarPanel() {
        document.getElementById('calendarCard').classList.toggle('collapsed');
    },

    async previewAttachment(attId) {
        const att = await DB.getAttachment(attId);
        if (!att) { this.showToast('加载失败', 'error'); return; }
        const blob = await CryptoManager.decryptBlob(att.data);
        const url = URL.createObjectURL(blob);
        const modal = document.getElementById('previewModal');
        const content = document.getElementById('previewContent');

        if (att.type.startsWith('image/')) {
            content.innerHTML = `<img src="${url}" style="max-width:100%;max-height:70vh;" />`;
        } else if (att.type === 'application/pdf') {
            content.innerHTML = `<iframe src="${url}" style="width:100%;height:70vh;border:none;"></iframe>`;
        } else if (att.type.startsWith('text/') || att.type === 'application/json') {
            const text = await blob.text();
            content.innerHTML = `<pre style="white-space:pre-wrap;max-height:70vh;overflow:auto;">${this.escapeHtml(text)}</pre>`;
        } else if (att.type.startsWith('audio/')) {
            content.innerHTML = `<audio controls src="${url}"></audio>`;
        } else if (att.type.startsWith('video/')) {
            content.innerHTML = `<video controls src="${url}" style="max-width:100%;max-height:70vh;"></video>`;
        } else {
            content.innerHTML = `<p>不支持预览</p><p>${this.escapeHtml(att.name)}</p>`;
        }
        document.getElementById('previewTitle').textContent = att.name;
        modal.style.display = 'flex';
    },

    async downloadAttachment(attId) {
        const att = await DB.getAttachment(attId);
        if (!att) { this.showToast('加载失败', 'error'); return; }
        const blob = await CryptoManager.decryptBlob(att.data);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.name;
        a.click();
        URL.revokeObjectURL(url);
    },

    async removeAttachment(attId) {
        if (!confirm('确定删除此附件？')) return;
        await DB.deleteAttachment(attId);
        this.currentNote.attachments = this.currentNote.attachments.filter(a => a.id !== attId);
        await this.saveNoteData(this.currentNote);
        this.renderAttachments();
        this.renderNoteList();
        this.updateStats();
        this.showToast('已删除');
    },

    // ==================== 提醒 ====================
    startReminderCheck() {
        this.reminderTimer = setInterval(() => this.checkReminders(), 10000); // 每10秒
        this.checkReminders();
    },

    // 获取当前时间 datetime-local 格式
    getLocalNowStr() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2,'0');
        const d = String(now.getDate()).padStart(2, '0');
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d}T${h}:${min}`;
    },

    checkReminders() {
        const nowStr = this.getLocalNowStr();
        let notified = JSON.parse(localStorage.getItem('notified_reminders') || '{}');
        for (const note of this.notes) {
            if (note.reminder) {
                // 用 noteId+时间 做 key
                const key = note.id +'|' + note.reminder;
                if (note.reminder <= nowStr && !notified[key]) {
                    notified[key] = true;
                    this.showNotification(note);
                }
            }
        }
        localStorage.setItem('notified_reminders', JSON.stringify(notified));
        this.updateStats();
    },

    // 显示通知
    showNotification(note) {
        const s = this.reminderSettings;
        // 弹窗
        if (s.popup) this.showReminderAlert(note);
        // 系统通知 http/https file:// 不支持
        if (s.system) this.trySystemNotification(note);
        // 标题闪烁
        if (s.popup || s.system) this.startTitleFlash(`提醒：${note.title}`);
        // 声音
        if (s.sound) this.playReminderSound();
        // 降级 toast
        if (!s.popup && !s.system && !s.sound) {
            this.showToast(`提醒：${note.title}`,'reminder');
        }
    },

    // 尝试系统通知
    trySystemNotification(note) {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            try {
                new Notification('笔记提醒', {
                    body: `${note.title}`,
                    icon: 'assets/icon.png',
                    requireInteraction: true
                });
            } catch (e) { /* file:// 限制 */ }
        } else if (Notification.permission ==='default') {
            Notification.requestPermission();
        }
    },

    // 标题闪烁
    startTitleFlash(message) {
        this.stopTitleFlash();
        if (!this._originalTitle) this._originalTitle = document.title;
        const original = this._originalTitle;
        let toggle = false;
        document.title ='提醒：'+ message; // 首次
        this._titleFlashTimer = setInterval(() => {
            toggle = !toggle;
            document.title = toggle ? original : ('提醒：'+ message);
        }, 800);
        // 窗口获焦停止
        this._onWindowBack = () => {
            if (document.hasFocus() && !document.hidden) this.stopTitleFlash();
        };
        window.addEventListener('focus', this._onWindowBack);
        document.addEventListener('visibilitychange', this._onWindowBack);
    },

    stopTitleFlash() {
        if (this._titleFlashTimer) {
            clearInterval(this._titleFlashTimer);
            this._titleFlashTimer = null;
            document.title = this._originalTitle || '笔记';
        }
        if (this._onWindowBack) {
            window.removeEventListener('focus', this._onWindowBack);
            document.removeEventListener('visibilitychange', this._onWindowBack);
            this._onWindowBack = null;
        }
    },

    // 测试系统通知
    async testSystemNotification() {
        if (!('Notification' in window)) {
            this.showToast('不支持系统通知', 'error');
            return;
        }
        if (window.location.protocol === 'file:') {
            this.showToast('file:// 不支持系统通知');
            this.startTitleFlash('测试提醒');
            this.playReminderSound();
            return;
        }
        let perm = Notification.permission;
        if (perm === 'default') perm = await Notification.requestPermission();
        if (perm === 'granted') {
            new Notification('测试提醒', { body:'这是一条测试通知', icon: 'assets/icon.png', requireInteraction: true });
            this.showToast('已发送');
        } else {
            this.showToast('权限被拒绝', 'error');
        }
    },

    // 弹窗提醒
    showReminderAlert(note) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="modal-box" style="text-align:center;">
                <div style="font-size:3em;margin-bottom:12px;">⏰</div>
                <h2 style="margin-bottom:8px;">提醒时间到</h2>
                <p style="font-size:1.1em;margin-bottom:20px;color:var(--text);">${this.escapeHtml(note.title)}</p>
                <button class="btn btn-primary" onclick="App.stopTitleFlash();this.closest('.modal-overlay').remove()">知道了</button>
            </div>`;
        document.body.appendChild(overlay);
        // 60秒自动关闭
        setTimeout(() => overlay.remove(), 60000);
    },

    // Web Audio API 播放提醒音
    playReminderSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const playBeep = (freq, start, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type ='sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + duration);
            };
            playBeep(880, 0, 0.2);
            playBeep(1100, 0.25, 0.2);
            playBeep(880, 0.5, 0.3);
        } catch (e) { /* 忽略 */ }
    },

    // ==================== 思维导图视图切换 ====================
    mindMode: false,

    // 从数据库重新加载笔记（保留当前选中笔记的界面状态）
    async refreshNotesFromDb() {
        const currentId = this.currentNote ? this.currentNote.id : null;
        await this.loadNotes();
        if (currentId) {
            const fresh = this.notes.find(n => n.id === currentId);
            if (fresh) {
                this.currentNote = fresh;
                this.renderEditor();
            }
        }
        this.renderNoteList();
        this.renderCalendar();
        this.updateStats();
    },

    // 在笔记视图与思维导图视图之间切换（内嵌展示，不新开标签页）
    toggleMindView() {
        this.mindMode = !this.mindMode;
        // 从其他视图切过来时，先隐藏它们（不回笔记界面）
        if (this.mindMode && this.syncMode) this.exitSyncView();
        if (this.mindMode && this.flowMode) {
            this.flowMode = false;
            document.getElementById('flowView').style.display = 'none';
            const flowBtn = document.getElementById('flowToggleBtn');
            flowBtn.classList.remove('active');
            flowBtn.title = '流程图';
        }
        if (this.mindMode && this.codeMode) {
            this.codeMode = false;
            document.getElementById('codeView').style.display = 'none';
            const codeBtn = document.getElementById('codeToggleBtn');
            codeBtn.classList.remove('active');
            codeBtn.title = t('代码编辑器');
        }
        const mindView = document.getElementById('mindView');
        const emptyPanel = document.getElementById('emptyPanel');
        const editorPanel = document.getElementById('editorPanel');
        const btn = document.getElementById('mindToggleBtn');

        if (this.mindMode) {
            // 切换前先保存当前正在编辑的笔记
            this.flushCurrentNote();
            // 首次切换才加载思维导图页面（懒加载）
            const frame = document.getElementById('mindFrame');
            if (!frame.hasAttribute('src')) frame.src = 'mind/mind.html?t=' + Date.now();
            emptyPanel.style.display = 'none';
            editorPanel.style.display = 'none';
            mindView.style.display = 'flex';
        } else {
            mindView.style.display = 'none';
            if (this.currentNote) {
                editorPanel.style.display = 'flex';
            } else {
                emptyPanel.style.display = 'flex';
            }
            // 思维导图页面可能已直接写库（如“导出到笔记”），重新从数据库加载，
            // 避免内存旧数据看不到新附件，也防止后续保存覆盖回写
            this.refreshNotesFromDb();
        }

        // 按钮高亮联动（左上角标题保持“安全记事本”不变）
        btn.classList.toggle('active', this.mindMode);
        btn.title = this.mindMode ? t('切换到笔记') : t('思维导图');
        // 思维导图模式下隐藏左侧日历与笔记列表，画布占据整个内容区
        document.querySelector('.left-col').style.display = this.mindMode ? 'none' : '';
        // 统计卡片只在笔记页显示：进入画布隐藏，退出按设置恢复
        if (this.mindMode) {
            document.getElementById('statsRow').style.display = 'none';
        } else {
            this.applyStatsRowVisibility();
        }
        // 从代码编辑器切过来时 codeMode 已置 false，需同步去掉全屏类恢复留白
        document.getElementById('pageBody').classList.toggle('code-fullscreen', this.codeMode);
        this.persistView();
    },

    // ==================== 流程图视图切换 ====================
    flowMode: false,

    // 在笔记视图与流程图视图之间切换（内嵌展示，不新开标签页）
    toggleFlowView() {
        this.flowMode = !this.flowMode;
        // 从其他视图切过来时，先隐藏它们（不回笔记界面）
        if (this.flowMode && this.syncMode) this.exitSyncView();
        if (this.flowMode && this.mindMode) {
            this.mindMode = false;
            document.getElementById('mindView').style.display = 'none';
            document.getElementById('mindToggleBtn').classList.remove('active');
            document.getElementById('mindToggleBtn').title = '思维导图';
        }
        if (this.flowMode && this.codeMode) {
            this.codeMode = false;
            document.getElementById('codeView').style.display = 'none';
            const codeBtn = document.getElementById('codeToggleBtn');
            codeBtn.classList.remove('active');
            codeBtn.title = t('代码编辑器');
        }
        const flowView = document.getElementById('flowView');
        const emptyPanel = document.getElementById('emptyPanel');
        const editorPanel = document.getElementById('editorPanel');
        const btn = document.getElementById('flowToggleBtn');

        if (this.flowMode) {
            // 切换前先保存当前正在编辑的笔记
            this.flushCurrentNote();
            // 首次切换才加载流程图页面（懒加载）
            const frame = document.getElementById('flowFrame');
            if (!frame.hasAttribute('src')) frame.src = 'flow/flow.html?t=' + Date.now();
            emptyPanel.style.display = 'none';
            editorPanel.style.display = 'none';
            flowView.style.display = 'flex';
        } else {
            flowView.style.display = 'none';
            if (this.currentNote) {
                editorPanel.style.display = 'flex';
            } else {
                emptyPanel.style.display = 'flex';
            }
            // 重新从数据库加载，避免内存旧数据
            this.refreshNotesFromDb();
        }

        btn.classList.toggle('active', this.flowMode);
        btn.title = this.flowMode ? t('切换到笔记') : t('流程图');
        // 流程图模式下隐藏左侧日历与笔记列表，画布占据整个内容区
        document.querySelector('.left-col').style.display = this.flowMode ? 'none' : '';
        // 统计卡片只在笔记页显示：进入画布隐藏，退出按设置恢复
        if (this.flowMode) {
            document.getElementById('statsRow').style.display = 'none';
        } else {
            this.applyStatsRowVisibility();
        }
        // 从代码编辑器切过来时 codeMode 已置 false，需同步去掉全屏类恢复留白
        document.getElementById('pageBody').classList.toggle('code-fullscreen', this.codeMode);
        this.persistView();
    },

    // ==================== 代码编辑器视图切换 ====================
    codeMode: false,

    // 在笔记视图与代码编辑器视图之间切换（内嵌展示，不新开标签页）
    toggleCodeView() {
        this.codeMode = !this.codeMode;
        // 从其他视图切过来时，先隐藏它们（不回笔记界面）
        if (this.codeMode && this.syncMode) this.exitSyncView();
        if (this.codeMode && this.mindMode) {
            this.mindMode = false;
            document.getElementById('mindView').style.display = 'none';
            document.getElementById('mindToggleBtn').classList.remove('active');
            document.getElementById('mindToggleBtn').title = '思维导图';
        }
        if (this.codeMode && this.flowMode) {
            this.flowMode = false;
            document.getElementById('flowView').style.display = 'none';
            const flowBtn = document.getElementById('flowToggleBtn');
            flowBtn.classList.remove('active');
            flowBtn.title = '流程图';
        }
        const codeView = document.getElementById('codeView');
        const emptyPanel = document.getElementById('emptyPanel');
        const editorPanel = document.getElementById('editorPanel');
        const btn = document.getElementById('codeToggleBtn');

        if (this.codeMode) {
            // 切换前先保存当前正在编辑的笔记
            this.flushCurrentNote();
            // 首次切换才加载代码编辑器页面（懒加载）
            const frame = document.getElementById('codeFrame');
            if (!frame.hasAttribute('src')) frame.src = 'code/code-editor.html?t=' + Date.now();
            emptyPanel.style.display = 'none';
            editorPanel.style.display = 'none';
            codeView.style.display = 'flex';
        } else {
            codeView.style.display = 'none';
            if (this.currentNote) {
                editorPanel.style.display = 'flex';
            } else {
                emptyPanel.style.display = 'flex';
            }
            // 重新从数据库加载，避免内存旧数据
            this.refreshNotesFromDb();
        }

        btn.classList.toggle('active', this.codeMode);
        btn.title = this.codeMode ? t('切换到笔记') : t('代码编辑器');
        // 代码编辑器模式下隐藏左侧日历与笔记列表，编辑区占据整个内容区
        document.querySelector('.left-col').style.display = this.codeMode ? 'none' : '';
        // 代码模式下统计卡片一并隐藏，避免与编辑器顶栏贴合重叠；退出时按设置恢复
        if (this.codeMode) {
            document.getElementById('statsRow').style.display = 'none';
        } else {
            this.applyStatsRowVisibility();
        }
        // 代码编辑器模式下四周顶到边界（去掉主体内边距）
        document.getElementById('pageBody').classList.toggle('code-fullscreen', this.codeMode);
        this.persistView();
    },

    // ==================== 目录比较与同步（内嵌整页视图，同代码编辑器） ====================
    toggleSyncView() {
        this.syncMode = !this.syncMode;
        // 从其他视图切过来时，先隐藏它们（不回笔记界面）
        if (this.syncMode && this.mindMode) {
            this.mindMode = false;
            document.getElementById('mindView').style.display = 'none';
            document.getElementById('mindToggleBtn').classList.remove('active');
            document.getElementById('mindToggleBtn').title = '思维导图';
        }
        if (this.syncMode && this.flowMode) {
            this.flowMode = false;
            document.getElementById('flowView').style.display = 'none';
            const flowBtn = document.getElementById('flowToggleBtn');
            flowBtn.classList.remove('active');
            flowBtn.title = '流程图';
        }
        if (this.syncMode && this.codeMode) {
            this.codeMode = false;
            document.getElementById('codeView').style.display = 'none';
            const codeBtn = document.getElementById('codeToggleBtn');
            codeBtn.classList.remove('active');
            codeBtn.title = t('代码编辑器');
        }
        const syncView = document.getElementById('syncView');
        const emptyPanel = document.getElementById('emptyPanel');
        const editorPanel = document.getElementById('editorPanel');
        const btn = document.getElementById('syncToggleBtn');
        if (this.syncMode) {
            // 切换前先保存当前正在编辑的笔记
            this.flushCurrentNote();
            emptyPanel.style.display = 'none';
            editorPanel.style.display = 'none';
            syncView.style.display = 'flex';
        } else {
            syncView.style.display = 'none';
            if (this.currentNote) {
                editorPanel.style.display = 'flex';
            } else {
                emptyPanel.style.display = 'flex';
            }
            this.refreshNotesFromDb();
        }
        btn.classList.toggle('active', this.syncMode);
        btn.title = this.syncMode ? t('切换到笔记') : t('目录比较与同步');
        // 同步视图下隐藏左侧日历与笔记列表，占据整个内容区
        document.querySelector('.left-col').style.display = this.syncMode ? 'none' : '';
        if (this.syncMode) {
            document.getElementById('statsRow').style.display = 'none';
        } else {
            this.applyStatsRowVisibility();
        }
        document.getElementById('pageBody').classList.toggle('code-fullscreen', this.syncMode);
        this.persistView();
    },

    // 其他视图接管时最小化退出同步视图（不恢复面板，由接管方处理）
    exitSyncView() {
        this.syncMode = false;
        document.getElementById('syncView').style.display = 'none';
        const btn = document.getElementById('syncToggleBtn');
        btn.classList.remove('active');
        btn.title = '目录比较与同步';
    },

    // 记住当前视图；浏览器刷新后恢复到同一页面，不会回到笔记页
    persistView() {
        const v = this.mindMode ? 'mind' : this.flowMode ? 'flow' : this.codeMode ? 'code' : this.syncMode ? 'sync' : 'notes';
        localStorage.setItem('lastView', v);
    },

    restoreLastView() {
        const v = localStorage.getItem('lastView');
        if (v === 'mind') this.toggleMindView();
        else if (v === 'flow') this.toggleFlowView();
        else if (v === 'code') this.toggleCodeView();
        else if (v === 'sync') this.toggleSyncView();
    },

    // ---------- 目录比较逻辑（主文档内运行，保证目录选择器可用） ----------
    async pickSyncDir(side) {
        try {
            const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
            this.syncDirs = this.syncDirs || {};
            this.syncDirs[side] = handle;
            const el = document.getElementById('syncDir' + side + 'Name');
            el.textContent = handle.name;
            el.title = handle.name;
            // 目录名由用户选择产生：移除 data-i18n，防止 applyI18n 重置回“未选择”
            el.removeAttribute('data-i18n');
            delete el.dataset.i18nZh;
        } catch (e) { /* 取消选择 */ }
    },

    // 递归遍历：相对路径 -> {dir?, size?, lastModified?}
    async walkSyncDir(handle, prefix, map, depth) {
        if ((depth || 0) > 24) return map; // 深度上限，防循环链接死递归
        for await (const [name, h] of handle.entries()) {
            const p = prefix ? prefix + '/' + name : name;
            try {
                if (h.kind === 'directory') { map.set(p, { dir: true }); await this.walkSyncDir(h, p, map, (depth || 0) + 1); }
                else { const f = await h.getFile(); map.set(p, { size: f.size, lastModified: f.lastModified }); }
            } catch (e) { /* 单个条目读不了跳过，不中断整体扫描 */ }
        }
        return map;
    },

    // 比较 A/B：仅A有 / 仅B有 / 不一致 / 相同；目录优先排序
    async compareDirs() {
        const A = this.syncDirs && this.syncDirs.A, B = this.syncDirs && this.syncDirs.B;
        if (!A || !B) { this.showToast('请先选择左边和右边目录', 'error'); return; }
        this.showToast('正在比较…');
        try {
            const [ma, mb] = await Promise.all([this.walkSyncDir(A, '', new Map()), this.walkSyncDir(B, '', new Map())]);
            const rows = [];
            for (const [p, ia] of ma) {
                const ib = mb.get(p);
                if (!ib) rows.push({ path: p, dir: !!ia.dir, a: ia, b: null, type: 'onlyA' });
                else if (ia.dir && ib.dir) rows.push({ path: p, dir: true, a: ia, b: ib, type: 'same' });
                else if (!!ia.dir !== !!ib.dir) rows.push({ path: p, dir: !!ia.dir, a: ia, b: ib, type: 'diff', dirSync: (ia.lastModified || 0) >= (ib.lastModified || 0) ? 'A2B' : 'B2A' });
                else if (ia.size !== ib.size || Math.abs(ia.lastModified - ib.lastModified) > 2000) rows.push({ path: p, a: ia, b: ib, type: 'diff', dirSync: ia.lastModified >= ib.lastModified ? 'A2B' : 'B2A' });
                else rows.push({ path: p, a: ia, b: ib, type: 'same' });
            }
            for (const [p, ib] of mb) if (!ma.has(p)) rows.push({ path: p, dir: !!ib.dir, a: null, b: ib, type: 'onlyB' });
            rows.sort((x, y) => (y.dir ? 1 : 0) - (x.dir ? 1 : 0) || x.path.localeCompare(y.path, 'zh-CN', { numeric: true }));
            this.syncRows = rows;
            this.renderSyncList();
            const n = rows.filter(r => r.type !== 'same').length;
            this.showToast(n ? `比较完成：${n} 个差异` : '比较完成：两目录完全一致');
        } catch (e) {
            this.showToast('比较失败: ' + e.message, 'error');
        }
    },

    renderSyncList() {
        const list = document.getElementById('syncList');
        if (!list) return;
        const rows = this.syncRows;
        const esc = s => this.escapeHtml(s);
        const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
        const fmtSize = n => n == null ? '' : n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n > 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B';
        const fmtTime = t => t ? new Date(t).toLocaleString() : '';
        const folderSvg = '<svg class="sync-folder" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>';
        const fileSvg = '<svg class="sync-file" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>';
        const caretSvg = '<svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1l6 4-6 4z"/></svg>';
        if (!rows) { /* 未比较：保留初始提示 */ }
        else if (!rows.length) list.innerHTML = `<div class="sync-empty">${t('两目录完全一致，无差异 🎉')}</div>`;
        else {
            const show = { onlyA: document.getElementById('syncFOnlyA').checked, onlyB: document.getElementById('syncFOnlyB').checked, diff: document.getElementById('syncFDiff').checked, same: document.getElementById('syncFSame').checked };
            // 建树：path 层级 -> {name,path,depth,entry,children}
            const byPath = new Map();
            rows.forEach((r, i) => byPath.set(r.path, { r, i }));
            const root = { children: new Map() };
            for (const r of rows) {
                const parts = r.path.split('/');
                let cur = root;
                for (let d = 0; d < parts.length; d++) {
                    const p = parts.slice(0, d + 1).join('/');
                    let n = cur.children.get(parts[d]);
                    if (!n) { n = { name: parts[d], path: p, depth: d, entry: byPath.get(p) || null, children: new Map() }; cur.children.set(parts[d], n); }
                    cur = n;
                }
            }
            // 可见性：自身类型被勾选，或子树内任一后代被勾选（不勾“相同”时完全一致的子树整体隐藏）
            // 注意：必须遍历全部子节点，不能用 some 短路（否则后续兄弟的 vis 不会被计算）
            const calcVis = n => { let any = false; for (const c of n.children.values()) any = calcVis(c) || any; n.vis = !!(n.entry && show[n.entry.r.type]) || any; return n.vis; };
            [...root.children.values()].forEach(calcVis);
            // 子树标记：L=仅左有 R=仅右有 D=不一致（已同步除外），左右两侧独立着色
            const calcFlags = n => {
                const f = { L: false, R: false, D: false };
                const e = n.entry;
                if (e && !e.r.done) {
                    if (e.r.type === 'onlyA') f.L = true;
                    else if (e.r.type === 'onlyB') f.R = true;
                    else if (e.r.type === 'diff') f.D = true;
                }
                for (const cf of [...n.children.values()].map(calcFlags)) { f.L = f.L || cf.L; f.R = f.R || cf.R; f.D = f.D || cf.D; }
                n.f = f; return f;
            };
            [...root.children.values()].forEach(calcFlags);
            const sortKids = m => [...m.values()].sort((a, b) => ((b.entry && b.entry.r.dir) ? 1 : 0) - ((a.entry && a.entry.r.dir) ? 1 : 0) || a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
            const expanded = this.syncExpanded || (this.syncExpanded = new Set());
            let html = '';
            const walkRender = n => {
                for (const kid of sortKids(n.children)) {
                    if (!kid.vis || !kid.entry) continue;
                    const r = kid.entry.r, i = kid.entry.i;
                    const f = kid.f;
                    // 每侧色调：独有+差异＝红蓝双色；仅独有＝蓝；仅差异＝红；都没有＝灰（已同步行类型为 same，自然着灰）
                    const toneL = f.D && f.L ? 'dual' : f.L ? 'blue' : f.D ? 'red' : 'gray';
                    const toneR = f.D && f.R ? 'dual' : f.R ? 'blue' : f.D ? 'red' : 'gray';
                    const open = expanded.has(r.path);
                    const caret = r.dir ? `<span class="sync-caret${open ? ' open' : ''}">${caretSvg}</span>` : '<span class="sync-caret none"></span>';
                    const icon = r.dir ? folderSvg : fileSvg;
                    const indent = `padding-left:${10 + kid.depth * 16}px;`;
                    const click = r.dir ? ` onclick="App.toggleSyncExpand(${q(r.path)})"` : '';
                    const sideHtml = (info, cls, tone) => info
                        ? `<div class="sync-side ${cls}${tone ? ' tone-' + tone : ''}"><span class="sync-name${r.dir ? ' sync-dirlink' : ''}" style="${indent}" title="${esc(r.path)}"${click}>${caret}${icon}<span class="sync-label">${esc(kid.name)}</span></span><span class="sync-num">${r.dir ? '' : fmtSize(info.size)}</span><span class="sync-num">${r.dir ? '' : fmtTime(info.lastModified)}</span></div>`
                        : `<div class="sync-side ${cls}"><span></span><span></span><span></span></div>`;
                    let gutter = '';
                    if (r.done) gutter = '<span class="sync-done">✓</span>';
                    else if (r.type === 'onlyA') gutter =
                        `<button class="sync-arrow primary" title="${t('同步到右边（拷贝左到右）')}" onclick="App.syncOne(${i},'A2B')">→</button>` +
                        `<button class="sync-arrow danger" title="${t('同步到左边（删除左边）')}" onclick="App.syncOne(${i},'DEL_A')">←</button>`;
                    else if (r.type === 'onlyB') gutter =
                        `<button class="sync-arrow danger" title="${t('同步到右边（删除右边）')}" onclick="App.syncOne(${i},'DEL_B')">→</button>` +
                        `<button class="sync-arrow primary" title="${t('同步到左边（拷贝右到左）')}" onclick="App.syncOne(${i},'B2A')">←</button>`;
                    else if (r.type === 'diff') gutter =
                        `<button class="sync-arrow ${r.dirSync === 'A2B' ? 'primary' : ''}" title="${t('左边覆盖右边')}" onclick="App.syncOne(${i},'A2B')">→</button>` +
                        `<button class="sync-arrow ${r.dirSync === 'B2A' ? 'primary' : ''}" title="${t('右边覆盖左边')}" onclick="App.syncOne(${i},'B2A')">←</button>`;
                    else gutter = `<button class="sync-arrow" disabled title="${t('两侧相同')}">→</button><button class="sync-arrow" disabled title="${t('两侧相同')}">←</button>`;
                    html += `<div class="sync-row${r.done ? ' done' : ''}">${sideHtml(r.a, 'l', toneL)}<div class="sync-gutter">${gutter}</div>${sideHtml(r.b, 'r', toneR)}</div>`;
                    if (r.dir && open) walkRender(kid);
                }
            };
            walkRender(root);
            list.innerHTML = html || `<div class="sync-empty">${t('当前过滤条件下没有可显示的行')}</div>`;
        }
        const cnt = type => (rows || []).filter(r => r.type === type && !r.done).length;
        document.getElementById('syncStatus').textContent = rows
            ? `${t('仅左边有')} ${cnt('onlyA')} · ${t('仅右边有')} ${cnt('onlyB')} · ${t('不一致')} ${cnt('diff')} · ${t('相同')} ${(rows || []).filter(r => r.type === 'same').length} · ${t('已同步')} ${(rows || []).filter(r => r.done).length}`
            : t('未选择目录');
    },

    // 目录树展开/收缩：左右两侧共用同一 path 状态，点任一侧对等展开
    toggleSyncExpand(path) {
        const s = this.syncExpanded || (this.syncExpanded = new Set());
        if (s.has(path)) s.delete(path); else s.add(path);
        this.renderSyncList();
    },

    // 单条同步：拷贝到缺失侧点击即执行；删除、两边都有覆盖按设置弹框确认
    async syncOne(i, dir) {
        const r = (this.syncRows || [])[i];
        if (!r || r.done) return;
        const st = this.loadSyncSettings();
        try {
            if (dir === 'DEL_A' || dir === 'DEL_B') {
                const side = dir === 'DEL_A' ? 'A' : 'B';
                if (st.confirmDel && !confirm(`将删除${side === 'A' ? '左' : '右'}边：${r.path}\n删除不可恢复，确定继续？`)) return;
                const snap = await this.snapshotEntry(side, r.path);
                await this.removeSyncEntry(side, r.path);
                this.pushSyncUndo(`删除${side === 'A' ? '左' : '右'}边 ${r.path}`, [{ kind: 'restore', side, path: r.path, snap }]);
                this.syncRows = this.syncRows.filter(x => x.path !== r.path && !x.path.startsWith(r.path + '/'));
                this.renderSyncList();
                this.showToast(`已删除${side === 'A' ? '左' : '右'}边：${r.path}`);
                return;
            }
            if (r.type === 'diff' && st.confirmBoth && !confirm(`两边都有该项：${r.path}\n将用${dir === 'A2B' ? '左' : '右'}边覆盖${dir === 'A2B' ? '右' : '左'}边，确定继续？`)) return;
            const dst = dir === 'A2B' ? 'B' : 'A';
            const op = r.type === 'diff'
                ? { kind: 'restore', side: dst, path: r.path, snap: await this.snapshotEntry(dst, r.path) }
                : { kind: 'remove', side: dst, path: r.path };
            await this.copySyncEntry(r, dir);
            this.pushSyncUndo(`同步 ${r.path}`, [op]);
            this.applySyncDone(r, dir);
            this.renderSyncList();
            this.showToast(`已同步：${r.path}`);
        } catch (e) {
            this.showToast(`同步失败 ${r.path}: ${e.message}`, 'error');
        }
    },

    // 一键全部同步：单边项按复选设置（都不勾＝不同步，同时勾优先拷贝）；删除/两边都有按设置弹框确认
    syncAll() {
        const st = this.loadSyncSettings();
        const rows = this.syncRows || [];
        let plan = [];
        const oneRows = rows.filter(r => !r.done && (r.type === 'onlyA' || r.type === 'onlyB'));
        if (st.doCopy) for (const r of oneRows) plan.push({ r, act: r.type === 'onlyA' ? 'A2B' : 'B2A' });
        else if (st.doDel) for (const r of oneRows) plan.push({ r, act: 'del' });
        if (plan.some(p => p.act === 'del') && st.confirmDel && !confirm(`将删除 ${plan.length} 项（仅一侧有的项，删除已有的一边）。\n删除不可恢复，点击取消＝本次不删除这些项。`)) {
            plan = plan.filter(p => p.act !== 'del');
        }
        const diffRows = rows.filter(r => !r.done && r.type === 'diff');
        if (diffRows.length && (!st.confirmBoth || confirm(`两边都有的不一致项共 ${diffRows.length} 项，点击确定同步（较新覆盖较旧）；\n点击取消＝本次不同步这些项。`))) {
            for (const r of diffRows) plan.push({ r, act: r.dirSync });
        }
        if (!plan.length) { this.showToast('没有待同步项'); return; }
        (async () => {
            let ok = 0, fail = 0;
            const delPaths = [];
            const ops = [];
            for (const p of plan) {
                try {
                    if (p.act === 'del') {
                        const side = p.r.type === 'onlyA' ? 'A' : 'B';
                        const snap = await this.snapshotEntry(side, p.r.path);
                        await this.removeSyncEntry(side, p.r.path);
                        ops.push({ kind: 'restore', side, path: p.r.path, snap });
                        delPaths.push(p.r.path); ok++;
                    } else {
                        const dst = p.act === 'A2B' ? 'B' : 'A';
                        const op = p.r.type === 'diff'
                            ? { kind: 'restore', side: dst, path: p.r.path, snap: await this.snapshotEntry(dst, p.r.path) }
                            : { kind: 'remove', side: dst, path: p.r.path };
                        await this.copySyncEntry(p.r, p.act);
                        ops.push(op);
                        this.applySyncDone(p.r, p.act); ok++;
                    }
                } catch (e) { fail++; }
            }
            this.pushSyncUndo(`一键同步 ${ok} 项`, ops);
            if (delPaths.length) {
                this.syncRows = this.syncRows.filter(x => !delPaths.includes(x.path) && !delPaths.some(g => x.path.startsWith(g + '/')));
            }
            this.renderSyncList();
            this.showToast(fail ? `同步完成：成功 ${ok}，失败 ${fail}` : `一键同步完成：${ok} 项全部成功`, fail ? 'error' : undefined);
        })();
    },

    // ---------- 同步设置（一键同步行为，持久化） ----------
    loadSyncSettings() {
        let s = {};
        try { s = JSON.parse(localStorage.getItem('syncSettings') || '{}'); } catch (e) { /* 忽略 */ }
        // 兼容旧版单选配置 oneSide
        if (s.oneSide) { s.doCopy = s.oneSide === 'copy'; s.doDel = s.oneSide === 'del'; delete s.oneSide; }
        this.syncSettings = Object.assign({ doCopy: true, doDel: false, confirmBoth: true, confirmDel: true }, s);
        return this.syncSettings;
    },

    showSyncSettings() {
        const s = this.loadSyncSettings();
        document.getElementById('syncDoCopy').checked = !!s.doCopy;
        document.getElementById('syncDoDel').checked = !!s.doDel;
        document.getElementById('syncConfirmBoth').checked = !!s.confirmBoth;
        document.getElementById('syncConfirmDel').checked = !!s.confirmDel;
        document.getElementById('syncSettingsModal').style.display = 'flex';
    },

    saveSyncSettings() {
        this.syncSettings = {
            doCopy: document.getElementById('syncDoCopy').checked,
            doDel: document.getElementById('syncDoDel').checked,
            confirmBoth: document.getElementById('syncConfirmBoth').checked,
            confirmDel: document.getElementById('syncConfirmDel').checked
        };
        localStorage.setItem('syncSettings', JSON.stringify(this.syncSettings));
    },

    // ---------- 同步回退（最多保留 3 步，支持删除/拷贝/覆盖三种操作） ----------
    pushSyncUndo(label, ops) {
        if (!ops.length) return;
        (this.syncUndo || (this.syncUndo = [])).push({ label, ops });
        while (this.syncUndo.length > 3) this.syncUndo.shift();
        this.updateUndoBtn();
    },

    updateUndoBtn() {
        const b = document.getElementById('syncUndoBtn');
        if (!b) return;
        const n = (this.syncUndo || []).length;
        b.disabled = !n;
        b.textContent = n ? `↩ 回退（${n}）` : '↩ 回退';
    },

    // 快照某侧条目（文件存内容，目录递归存全部文件），供回退恢复
    async snapshotEntry(side, path) {
        const parts = path.split('/');
        let cur = this.syncDirs[side];
        for (let i = 0; i < parts.length - 1; i++) cur = await cur.getDirectoryHandle(parts[i]);
        const name = parts[parts.length - 1];
        try {
            const fh = await cur.getFileHandle(name);
            const f = await fh.getFile();
            return { dir: false, content: f };
        } catch (e) {
            const dh = await cur.getDirectoryHandle(name);
            const files = [];
            const walk = async (h, prefix) => {
                for await (const [n, h2] of h.entries()) {
                    const p = prefix ? prefix + '/' + n : n;
                    if (h2.kind === 'file') { const f = await h2.getFile(); files.push({ p, content: f }); }
                    else await walk(h2, p);
                }
            };
            await walk(dh, '');
            return { dir: true, files };
        }
    },

    // 恢复快照到某侧（父目录不存在时逐层创建）
    async restoreEntry(side, path, snap) {
        const parts = path.split('/');
        let cur = this.syncDirs[side];
        for (let i = 0; i < parts.length - 1; i++) cur = await cur.getDirectoryHandle(parts[i], { create: true });
        const name = parts[parts.length - 1];
        const writeFile = async (dirH, n, content) => {
            const fh = await dirH.getFileHandle(n, { create: true });
            const w = await fh.createWritable();
            await w.write(content); await w.close();
        };
        if (!snap.dir) await writeFile(cur, name, snap.content);
        else {
            const dh = await cur.getDirectoryHandle(name, { create: true });
            for (const f of snap.files) {
                const fp = f.p.split('/');
                let c = dh;
                for (let i = 0; i < fp.length - 1; i++) c = await c.getDirectoryHandle(fp[i], { create: true });
                await writeFile(c, fp[fp.length - 1], f.content);
            }
        }
    },

    // 回退上一步：逆序撤销该步全部操作，然后重新比较刷新列表
    async undoSync() {
        const stack = this.syncUndo || (this.syncUndo = []);
        const step = stack.pop();
        this.updateUndoBtn();
        if (!step) { this.showToast('没有可回退的操作'); return; }
        try {
            for (const op of step.ops.slice().reverse()) {
                if (op.kind === 'remove') await this.removeSyncEntry(op.side, op.path);
                else await this.restoreEntry(op.side, op.path, op.snap);
            }
            if (this.syncDirs && this.syncDirs.A && this.syncDirs.B) await this.compareDirs();
            else this.renderSyncList();
            this.showToast(`已回退：${step.label}`);
        } catch (e) {
            this.showToast(`回退失败：${e.message}`, 'error');
        }
    },

    // 同步成功后把行更新为“相同”：两侧都显示文件信息（灰色），中间保留 ✓
    applySyncDone(r, dir) {
        const src = dir === 'A2B' ? r.a : r.b;
        const meta = src ? { ...src } : { dir: true };
        if (dir === 'A2B') r.b = meta; else r.a = meta;
        r.type = 'same';
        r.done = true;
    },

    // 删除指定侧的条目（目录递归删除），用于单边项的反向同步
    async removeSyncEntry(side, path) {
        const parts = path.split('/');
        let cur = this.syncDirs[side];
        for (let i = 0; i < parts.length - 1; i++) cur = await cur.getDirectoryHandle(parts[i]);
        await cur.removeEntry(parts[parts.length - 1], { recursive: true });
    },

    // 按相对路径拷贝（文件写覆盖；目录自动创建）
    async copySyncEntry(r, dir) {
        const from = dir === 'A2B' ? this.syncDirs.A : this.syncDirs.B;
        const to = dir === 'A2B' ? this.syncDirs.B : this.syncDirs.A;
        const parts = r.path.split('/');
        let src = from, dst = to;
        for (let i = 0; i < parts.length - 1; i++) {
            src = await src.getDirectoryHandle(parts[i]);
            dst = await dst.getDirectoryHandle(parts[i], { create: true });
        }
        if (r.dir) { await dst.getDirectoryHandle(parts[parts.length - 1], { create: true }); return; }
        const sf = await src.getFileHandle(parts[parts.length - 1]);
        const df = await dst.getFileHandle(parts[parts.length - 1], { create: true });
        const file = await sf.getFile();
        const w = await df.createWritable();
        await w.write(file);
        await w.close();
    },

    // ==================== 设置 ====================
    showSettings() {
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newPassword2').value = '';
        // 密码保护
        document.getElementById('pwdProtectToggle').checked = localStorage.getItem('nopass_mode') !== 'true';
        document.getElementById('disablePwdConfirm').style.display = 'none';
        document.getElementById('disablePwdInput').value = '';
        // 通知设置
        document.getElementById('notifyPopup').checked = this.reminderSettings.popup;
        document.getElementById('notifySound').checked = this.reminderSettings.sound;
        document.getElementById('notifySystem').checked = this.reminderSettings.system;
        // 统计行
        document.getElementById('showStatsToggle').checked = localStorage.getItem('hide_stats') !== 'true';
        // 枫叶背景（现代主题下由 syncMapleToggle 强制禁用）
        this.syncMapleToggle();
        // 顶栏工具按钮显示
        document.getElementById('showMindToggle').checked = localStorage.getItem('hide_mind_tool') !== 'true';
        document.getElementById('showFlowToggle').checked = localStorage.getItem('hide_flow_tool') !== 'true';
        document.getElementById('showCodeToggle').checked = localStorage.getItem('hide_code_tool') !== 'true';
        // 数据文件绑定状态
        this.updateDataFileUI();
        this.updateSqliteUI();
        // 存储方案选中态
        this.updateStorageModeUI();
        // 主题选中态
        this.applyTheme();
        document.getElementById('settingsModal').style.display = 'flex';
    },

    // 统计行切换
    toggleStatsRow() {
        const show = document.getElementById('showStatsToggle').checked;
        localStorage.setItem('hide_stats', show ? 'false' : 'true');
        this.applyStatsRowVisibility();
        this.showToast(show ? '已显示' : '已隐藏');
    },

    applyStatsRowVisibility() {
        const hidden = localStorage.getItem('hide_stats') === 'true';
        document.getElementById('statsRow').style.display = hidden ? 'none' : 'grid';
        document.documentElement.classList.remove('pre-hide-stats'); // 内联样式已接管，移除首帧预类
    },

    // ==================== 主题风格（清新绿 / 炫酷现代） ====================
    setTheme(t) {
        localStorage.setItem('app_theme', t === 'modern' ? 'modern' : 'green');
        this.applyTheme();
        this.showToast(t === 'modern' ? '已切换「炫酷现代」主题' : '已切换「清新绿」主题');
    },

    applyTheme() {
        const t = localStorage.getItem('app_theme') === 'modern' ? 'modern' : 'green';
        document.documentElement.setAttribute('data-theme', t);
        const logo = document.getElementById('logoIcon');
        if (logo) logo.src = t === 'modern' ? 'assets/icon-modern.png' : 'assets/icon.png';
        // 浏览器标签页图标同步跟随主题
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = t === 'modern' ? 'assets/icon-modern.png' : 'assets/icon.png';
        const g = document.getElementById('themeGreenBtn'), m = document.getElementById('themeModernBtn');
        if (g) g.classList.toggle('selected', t === 'green');
        if (m) m.classList.toggle('selected', t === 'modern');
        // 现代主题下枫叶开关自动不勾选并禁用
        this.syncMapleToggle();
        this.applyMapleBg();
    },

    // 顶栏工具按钮显示开关（思维导图 / 流程图 / 代码编辑器）
    toggleToolBtn(key) {
        const map = { mind: 'showMindToggle', flow: 'showFlowToggle', code: 'showCodeToggle' };
        const show = document.getElementById(map[key]).checked;
        localStorage.setItem(`hide_${key}_tool`, show ? 'false' : 'true');
        // 若隐藏时该视图正处于打开状态，退回笔记视图
        if (!show) {
            if (key === 'mind' && this.mindMode) this.toggleMindView();
            if (key === 'flow' && this.flowMode) this.toggleFlowView();
            if (key === 'code' && this.codeMode) this.toggleCodeView();
        }
        this.applyToolBtnVisibility();
        this.showToast(show ? '已显示' : '已隐藏');
    },

    applyToolBtnVisibility() {
        document.getElementById('mindToggleBtn').style.display = localStorage.getItem('hide_mind_tool') === 'true' ? 'none' : '';
        document.getElementById('flowToggleBtn').style.display = localStorage.getItem('hide_flow_tool') === 'true' ? 'none' : '';
        document.getElementById('codeToggleBtn').style.display = localStorage.getItem('hide_code_tool') === 'true' ? 'none' : '';
        document.documentElement.classList.remove('pre-hide-mind', 'pre-hide-flow', 'pre-hide-code');
    },

    // 枫叶背景开关
    toggleMapleBg() {
        const show = document.getElementById('mapleBgToggle').checked;
        localStorage.setItem('hide_maple_bg', show ? 'false' : 'true');
        this.applyMapleBg();
        this.showToast(show ? '背景已显示' : '背景已隐藏');
    },

    applyMapleBg() {
        // 炫酷现代主题不含枫叶装饰，强制纯白背景
        const modern = localStorage.getItem('app_theme') === 'modern';
        const plain = modern || localStorage.getItem('hide_maple_bg') === 'true';
        document.body.classList.toggle('bg-plain', plain);
        document.documentElement.classList.remove('pre-plain-bg');
    },

    // 枫叶开关仅清新绿主题可用：现代主题下强制不勾选并禁用，切回绿主题按设置恢复
    syncMapleToggle() {
        const el = document.getElementById('mapleBgToggle');
        if (!el) return;
        const modern = localStorage.getItem('app_theme') === 'modern';
        el.disabled = modern;
        el.checked = modern ? false : localStorage.getItem('hide_maple_bg') !== 'true';
    },

    // 密码保护开关
    onPwdProtectToggle() {
        const checked = document.getElementById('pwdProtectToggle').checked;
        if (checked) {
            // 开启密码保护
            localStorage.removeItem('nopass_mode');
            localStorage.removeItem('saved_pwd');
            localStorage.removeItem('wrapped_pwd');
            localStorage.removeItem('auto_unlock_secret');
            document.getElementById('disablePwdConfirm').style.display = 'none';
            this.showToast('已开启密码保护');
        } else {
            // 需要验证密码
            document.getElementById('disablePwdConfirm').style.display = 'block';
            document.getElementById('disablePwdInput').value = '';
            document.getElementById('disablePwdInput').focus();
        }
    },

    // 确认关闭密码保护
    async confirmDisablePwdProtection() {
        const pwd = document.getElementById('disablePwdInput').value;
        if (!pwd) { this.showToast('请输入密码', 'error'); return; }
        // 验证密码
        const saltB64 = await DB.getMeta('salt');
        const token = await DB.getMeta('verifyToken');
        const salt = CryptoManager.base64ToSalt(saltB64);
        const backupKey = CryptoManager.key;
        await CryptoManager.init(pwd, salt);
        const valid = await CryptoManager.verifyPassword(token);
        if (!valid) {
            CryptoManager.key = backupKey; // 恢复
            this.showToast('密码错误', 'error');
            return;
        }
        // 成功：加密包装后存储，不再保存明文密码
        let secret = localStorage.getItem('auto_unlock_secret');
        if (!secret) {
            secret = CryptoManager.arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)));
            localStorage.setItem('auto_unlock_secret', secret);
        }
        localStorage.setItem('wrapped_pwd', await CryptoManager.encryptWithPassword(secret, pwd));
        localStorage.removeItem('saved_pwd'); // 清理旧版明文
        localStorage.setItem('nopass_mode', 'true');
        document.getElementById('disablePwdConfirm').style.display = 'none';
        this.showToast('密码保护已关闭');
    },

    // 修改密码
    async changePassword() {
        const oldPwd = document.getElementById('oldPassword').value;
        const newPwd = document.getElementById('newPassword').value;
        const newPwd2 = document.getElementById('newPassword2').value;

        if (!oldPwd) { this.showToast('请输入旧密码', 'error'); return; }
        if (!newPwd || newPwd.length < 4) { this.showToast('新密码至少4位', 'error'); return; }
        if (newPwd !== newPwd2) { this.showToast('两次密码不一致', 'error'); return; }
        if (oldPwd === newPwd) { this.showToast('新旧密码相同', 'error'); return; }

        // 1. 验证旧密码
        const saltB64 = await DB.getMeta('salt');
        const token = await DB.getMeta('verifyToken');
        const oldSalt = CryptoManager.base64ToSalt(saltB64);
        const backupKey = CryptoManager.key;
        await CryptoManager.init(oldPwd, oldSalt);
        const valid = await CryptoManager.verifyPassword(token);
        if (!valid) {
            CryptoManager.key = backupKey; // 恢复
            this.showToast('旧密码错误', 'error');
            return;
        }

        // 2. 解密笔记
        const plainNotes = [];
        for (const note of this.notes) {
            plainNotes.push(JSON.stringify(note));
        }

        // 2.5 用旧密钥解密全部附件并缓存明文（切换新密钥后重加密，避免附件失效）
        const plainAttachments = [];
        try {
            const allAtts = await DB.getAllAttachments();
            for (const att of allAtts) {
                plainAttachments.push({ att, blob: await CryptoManager.decryptBlob(att.data) });
            }
        } catch (e) {
            CryptoManager.key = backupKey; // 恢复
            this.showToast('附件解密失败，已取消修改密码', 'error');
            return;
        }

        // 3. 初始化新密码
        await CryptoManager.init(newPwd, null); // 新 salt
        const newSaltB64 = CryptoManager.saltToBase64(CryptoManager.salt);
        const newToken = await CryptoManager.createVerifyToken();

        // 4. 重新加密
        for (let i = 0; i < this.notes.length; i++) {
            const encrypted = await CryptoManager.encrypt(plainNotes[i]);
            await DB.saveNote({ id: this.notes[i].id, date: this.notes[i].date, data: encrypted });
        }

        // 4.5 用新密钥重新加密附件
        for (const { att, blob } of plainAttachments) {
            att.data = await CryptoManager.encryptBlob(blob);
            await DB.saveAttachment(att);
        }

        // 5. 更新元数据
        await DB.setMeta('salt', newSaltB64);
        await DB.setMeta('verifyToken', newToken);

        // 6. 更新免密
        if (localStorage.getItem('nopass_mode') === 'true') {
            const secret = localStorage.getItem('auto_unlock_secret');
            if (secret) {
                localStorage.setItem('wrapped_pwd', await CryptoManager.encryptWithPassword(secret, newPwd));
            }
            localStorage.removeItem('saved_pwd');
        }

        // 7. 清空表单
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newPassword2').value = '';

        this.showToast('密码修改成功');
    },

    // ==================== 提醒设置 ====================
    loadReminderSettings() {
        const saved = localStorage.getItem('reminder_settings');
        if (saved) this.reminderSettings = JSON.parse(saved);
    },

    saveReminderSettings() {
        this.reminderSettings = {
            popup: document.getElementById('notifyPopup').checked,
            sound: document.getElementById('notifySound').checked,
            system: document.getElementById('notifySystem').checked
        };
        localStorage.setItem('reminder_settings', JSON.stringify(this.reminderSettings));
        this.showToast('设置已保存');
    },

    // ==================== 导出 ====================
    showExportMenu() {
        if (!this.currentNote) {
            this.showToast('请先选择笔记', 'error');
            return;
        }
        document.getElementById('exportModal').style.display = 'flex';
    },

    // 导出 Markdown
    exportMarkdown() {
        if (!this.currentNote) return;
        const md = this.noteToMarkdown(this.currentNote);
        this.downloadFile(md, this.currentNote.title +'.md', 'text/markdown');
        this.closeModal('exportModal');
        this.showToast('已导出 Markdown');
    },

    // 导出 Word
    exportWord() {
        if (!this.currentNote) return;
        // Word 兼容预处理：
        // 1) Word 不识别 background-color，统一转为 background 才能带过去文字背景色
        // 2) 去掉非表格元素的内联 border，避免 Word 渲染出多余外框
        const div = document.createElement('div');
        div.innerHTML = this.currentNote.content || '';
        div.querySelectorAll('*').forEach(el => {
            const st = el.getAttribute('style');
            if (!st) return;
            let ns = st.replace(/background-color\s*:/gi, 'background:');
            if (el.tagName !== 'TABLE' && el.tagName !== 'TD' && el.tagName !== 'TH') {
                ns = ns.replace(/border[^;]*;?/gi, '');
            }
            if (ns.trim()) el.setAttribute('style', ns); else el.removeAttribute('style');
        });
        const content = div.innerHTML;
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${this.escapeHtml(this.currentNote.title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page WordSection1 { size: 595.3pt 841.9pt; margin: 72.0pt 72.0pt 72.0pt 72.0pt; }
div.WordSection1 { page: WordSection1; }
body{font-family:'Microsoft YaHei',sans-serif;line-height:1.8;}
h1{font-size:22px;border-bottom:2px solid #3d9a8b;padding-bottom:8px;}
.meta{color:#888;font-size:12px;margin-bottom:20px;}
p{margin:6px 0;}
img{max-width:100%;}
table{border-collapse:collapse;width:100%;}
td,th{border:1px solid #bbbbbb;padding:6px 8px;}
</style>
</head><body>
<div class="WordSection1">
<h1>${this.escapeHtml(this.currentNote.title)}</h1>
<p class="meta">日期：${this.currentNote.date} | 创建：${new Date(this.currentNote.createdAt).toLocaleString()}</p>
${content}
</div>
</body></html>`;
        this.downloadFile(html, this.currentNote.title +'.doc', 'application/msword');
        this.closeModal('exportModal');
        this.showToast('已导出 Word');
    },

    // 导出 PDF 打印
    exportPDF() {
        if (!this.currentNote) return;
        this.closeModal('exportModal');
        const printWin = window.open('', '_blank');
        printWin.document.write(`<html><head><meta charset="utf-8"><title>${this.escapeHtml(this.currentNote.title)}</title>
<style>body{font-family:'Microsoft YaHei',sans-serif;padding:40px;line-height:2;color:#2d3748;}h1{font-size:22px;border-bottom:2px solid #3d9a8b;padding-bottom:8px;color:#2d3748;}.meta{color:#888;font-size:12px;margin-bottom:24px;}img{max-width:100%;}</style>
</head><body>
<h1>${this.escapeHtml(this.currentNote.title)}</h1>
<p class="meta">日期：${this.currentNote.date} | 创建：${new Date(this.currentNote.createdAt).toLocaleString()}</p>
${this.currentNote.content}
</body></html>`);
        printWin.document.close();
        setTimeout(() => { printWin.print(); }, 300);
        this.showToast('已导出 PDF');
    },

    // 导出全部 Markdown
    exportAllMarkdown() {
        if (this.notes.length === 0) {
            this.showToast('无笔记', 'error');
            return;
        }
        const allMd = this.notes.map(n => this.noteToMarkdown(n)).join('\n\n---\n\n');
        const header = `# 笔记导出\n\n> 导出时间：${new Date().toLocaleString()} | 共 ${this.notes.length} 篇\n\n---\n\n`;
        this.downloadFile(header + allMd, '笔记_' + this.formatDate(new Date()) + '.md', 'text/markdown');
        this.closeModal('exportModal');
        this.showToast(`已导出 ${this.notes.length} 篇`);
    },

    // 笔记转 Markdown
    noteToMarkdown(note) {
        let md = `# ${note.title}\n\n`;
        md += `> 日期：${note.date}`;
        if (note.reminder) md += ` | 提醒：${note.reminder.replace('T', ' ')}`;
        md += `\n\n`;
        md += this.htmlToMarkdown(note.content);
        if (note.attachments && note.attachments.length > 0) {
            md += `\n\n**附件**\n`;
            note.attachments.forEach(a => { md += `- ${a.name} (${this.formatSize(a.size)})\n`; });
        }
        return md;
    },

    // HTML 转 Markdown
    htmlToMarkdown(html) {
        if (!html) return'';
        const div = document.createElement('div');
        div.innerHTML = html;
        let md = '';
        const walk = (node) => {
            if (node.nodeType === 3) { md += node.textContent; return; }
            if (node.nodeType !== 1) return;
            const tag = node.tagName.toLowerCase();
            switch (tag) {
                case 'h1': md += '\n# '; node.childNodes.forEach(walk); md += '\n'; break;
                case 'h2': md += '\n## '; node.childNodes.forEach(walk); md += '\n'; break;
                case 'h3': md += '\n### '; node.childNodes.forEach(walk); md += '\n'; break;
                case 'h4': md += '\n#### '; node.childNodes.forEach(walk); md += '\n'; break;
                case 'p': node.childNodes.forEach(walk); md += '\n'; break;
                case 'br': md += '\n'; break;
                case 'strong': case 'b': md += '**'; node.childNodes.forEach(walk); md += '**'; break;
                case 'em': case 'i': md += '*'; node.childNodes.forEach(walk); md += '*'; break;
                case 'u': md += '<u>'; node.childNodes.forEach(walk); md += '</u>'; break;
                case 's': case 'strike': md += '~~'; node.childNodes.forEach(walk); md += '~~'; break;
                case 'li': md += '- '; node.childNodes.forEach(walk); md += '\n'; break;
                case 'ul': case 'ol': md += '\n'; node.childNodes.forEach(walk); break;
                case 'div': node.childNodes.forEach(walk); md += '\n'; break;
                case 'img': md += `![image](${node.src || ''})`; break;
                case 'a': md += '['; node.childNodes.forEach(walk); md += `](${node.href || ''})`; break;
                default: node.childNodes.forEach(walk);
            }
        };
        div.childNodes.forEach(walk);
        return md.replace(/\n{3,}/g, '\n\n').trim();
    },

    // 
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType +';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ==================== 导入 ====================
    // 导入 Markdown .md 文件
    importMarkdown() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            // 先保存当前
            await this.flushCurrentNote();
            let count = 0;
            let firstNote = null;
            for (const file of files) {
                try {
                    const text = await file.text();
                    const notes = await this.parseAndImportMarkdown(text);
                    count += notes.length;
                    if (!firstNote && notes.length > 0) firstNote = notes[0];
                } catch (err) {
                    console.error('解析失败:', file.name, err);
                }
            }
            if (count === 0) {
                this.showToast('未识别到笔记', 'error');
                return;
            }
            // 选中第一篇
            if (firstNote) {
                this.currentDate = firstNote.date;
                this.currentNote = firstNote;
            }
            this.renderCalendar();
            this.renderNoteList();
            this.renderEditor();
            this.updateStats();
            this.updateTodoBadge();
            this.showToast(`已导入 ${count} 篇`);
        };
        input.click();
    },

    // 解析 Markdown
    async parseAndImportMarkdown(text) {
        if (!text || !text.trim()) return [];
        // 批量用 --- 分隔
        const isBatch = text.includes('# 笔记导出');
        const sections = isBatch ? text.split('\n\n---\n\n') : [text];
        const imported = [];
        for (const sec of sections) {
            const trimmed = sec.trim();
            if (!trimmed) continue;
            if (trimmed.includes('# 笔记导出')) continue; // 跳过标题
            const note = await this.createNoteFromMarkdown(trimmed);
            if (note) imported.push(note);
        }
        return imported;
    },

    // 解析 Markdown 标题/日期/提醒/正文
    async createNoteFromMarkdown(md) {
        const lines = md.split('\n');
        let title = '';
        let date = this.formatDate(new Date());
        let reminder = '';
        let startIdx = 0;

        // 提取 # 标题
        for (let i = 0; i < lines.length; i++) {
            const t = lines[i].trim();
            if (t ==='') continue;
            if (t.startsWith('# ')) {
                title = t.slice(2).trim();
                startIdx = i + 1;
            }
            break;
        }

        // 解析 > 日期 xxxx | xxxx
        for (let i = startIdx; i < lines.length; i++) {
            const t = lines[i].trim();
            if (t ==='') { startIdx = i + 1; continue; }
            if (t.startsWith('>') && /[日期提醒]/.test(t)) {
                const dm = t.match(/日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
                if (dm) date = dm[1];
                const rm = t.match(/提醒[：:]\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
                if (rm) reminder = rm[1] +'T' + rm[2];
                startIdx = i + 1;
                continue;
            }
            break;
        }

        const bodyMd = lines.slice(startIdx).join('\n').trim();
        const note = {
            id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: title || '',
            content: this.markdownToHtml(bodyMd),
            date: date,
            reminder: reminder,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: []
        };
        this.notes.unshift(note);
        await this.saveNoteData(note);
        return note;
    },

    // Markdown 转 HTML 标题/引用/列表/分隔
    markdownToHtml(md) {
        if (!md) return '';
        const lines = md.split('\n');
        let html = '';
        let listType = null;   // 'ul' | 'ol' | null
        let paraLines = [];

        const closeList = () => { if (listType) { html += '</' + listType + '>'; listType = null; } };
        const flushPara = () => {
            if (paraLines.length > 0) {
                html += '<p>' + paraLines.map(l => this.inlineMarkdown(l)).join('<br>') + '</p>';
                paraLines = [];
            }
        };

        for (const raw of lines) {
            const t = raw.trim();
            // 标题
            const h = t.match(/^(#{1,4})\s+(.*)$/);
            if (h) { flushPara(); closeList(); const lv = h[1].length; html +='<h' + lv + '>' + this.inlineMarkdown(h[2]) + '</h' + lv + '>'; continue; }
            // 引用
            if (t.startsWith('>')) { flushPara(); closeList(); html += '<blockquote>' + this.inlineMarkdown(t.replace(/^>\s?/, '')) + '</blockquote>'; continue; }
            // 无序列表
            const ul = t.match(/^[-*+]\s+(.*)$/);
            if (ul) { flushPara(); if (listType !=='ul') { closeList(); html += '<ul>'; listType = 'ul'; } html += '<li>' + this.inlineMarkdown(ul[1]) + '</li>'; continue; }
            // 有序列表
            const ol = t.match(/^\d+[.)]\s+(.*)$/);
            if (ol) { flushPara(); if (listType !=='ol') { closeList(); html += '<ol>'; listType = 'ol'; } html += '<li>' + this.inlineMarkdown(ol[1]) + '</li>'; continue; }
            // 分隔线
            if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flushPara(); closeList(); html +='<hr>'; continue; }
            // 空行/段落
            if (t ==='') { flushPara(); closeList(); continue; }
            // 普通文本
            paraLines.push(t);
        }
        flushPara(); closeList();
        return html;
    },

    // 行内 Markdown 转 HTML 加粗/斜体/下划线/链接/图片
    inlineMarkdown(raw) {
        let s = this.escapeHtml(raw);
        // 下划线
        s = s.replace(/&lt;u&gt;/gi,'<u>').replace(/&lt;\/u&gt;/gi, '</u>');
        // 图片 ![alt](url)
        s = s.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (m, alt, url) =>
            this.safeUrl(url) ?'<img src="' + this.escapeAttr(url) + '" alt="' + this.escapeAttr(alt) + '">': alt);
        // 链接 [text](url)
        s = s.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (m, txt, url) =>
            this.safeUrl(url) ?'<a href="' + this.escapeAttr(url) + '" target="_blank">' + txt + '</a>': txt);
        // 加粗 **
        s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
        // 删除线 ~~
        s = s.replace(/~~(.+?)~~/g,'<s>$1</s>');
        // 斜体 *
        s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,'$1<em>$2</em>');
        return s;
    },

    // URL 安全检查
    safeUrl(url) {
        const u = String(url).trim().toLowerCase();
        if (u.startsWith('javascript:')) return false;
        if (u.startsWith('vbscript:')) return false;
        if (u.startsWith('data:') && !u.startsWith('data:image/')) return false;
        return true;
    },

    // 转义属性
    escapeAttr(s) {
        return String(s).replace(/"/g,'&quot;').replace(/'/g, '&#39;');
    },

    // ==================== 工具函数 ====================
    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2,'0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    formatTime(isoStr) {
        const d = new Date(isoStr);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    },

    getFileIcon(type) {
        if (type.startsWith('image/')) return '🖼';
        if (type.startsWith('video/')) return '🎬';
        if (type.startsWith('audio/')) return '🎵';
        if (type === 'application/pdf') return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('sheet') || type.includes('excel')) return '📊';
        if (type.startsWith('text/')) return '📃';
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
        return '📁';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },

    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast show ' + type;
        setTimeout(() => { toast.className = 'toast'; }, 3000);
    },

    // 关闭弹窗
    closeModal(id) {
        document.getElementById(id).style.display ='none';
    },

    // 搜索输入
    onSearchInput() {
        if (this.searchMode ==='todos') this.searchTodos();
        else this.searchNotes();
    },

    // 笔记/待办 搜索
    setSearchMode(mode) {
        this.searchMode = mode;
        document.getElementById('searchModeNotes').classList.toggle('active', mode === 'notes');
        document.getElementById('searchModeTodos').classList.toggle('active', mode === 'todos');
        document.getElementById('searchInput').placeholder = mode === 'notes' ? t('搜索笔记...') : t('搜索待办...');
        // 搜索待办时切全部
        if (mode === 'todos') this.todoViewMode = 'all';
        // 执行搜索
        this.onSearchInput();
    },

    // 搜索笔记
    searchNotes() {
        const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        if (!keyword) {
            this.showListPanel('notes');
            this.renderNoteList();
            return;
        }
        // 强制笔记面板
        this.showListPanel('notes');
        const filtered = this.notes.filter(n =>
            n.title.toLowerCase().includes(keyword) ||
            this.stripHtml(n.content).toLowerCase().includes(keyword)
        );
        const container = document.getElementById('noteList');
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-hint">无结果</div>';
            return;
        }
        container.innerHTML = filtered.map(n => `
            <div class="note-item ${this.currentNote && this.currentNote.id === n.id ? 'active' : ''}" 
                 data-id="${n.id}"
                 onclick="App.selectNote('${n.id}')">
                <div class="note-item-title" title="${this.escapeHtml(n.title).replace(/"/g, '&quot;')}">${this.escapeHtml(n.title)}</div>
            </div>
        `).join('');
    },

    // 搜索待办
    searchTodos() {
        const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        if (!keyword) {
            this.showListPanel('todos');
            this.renderTodoList();
            return;
        }
        // 强制待办面板
        this.showListPanel('todos');
        const results = [];
        for (const note of this.notes) {
            for (const todo of (note.todos || [])) {
                if (todo.text.toLowerCase().includes(keyword)) {
                    results.push({ noteId: note.id, noteTitle: note.title, todo });
                }
            }
        }
        const container = document.getElementById('todoList');
        if (results.length === 0) {
            container.innerHTML = '<div class="empty-hint"></div>';
            return;
        }
        container.innerHTML = results.map(x => this.todoItemHtml(x.noteId, x.noteTitle, x.todo)).join('');
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => App.init());

// 自动保存
document.addEventListener('input', (e) => {
    if (e.target.id === 'editorContent' || e.target.id === 'noteTitle') {
        App._dirty = true;
        clearTimeout(App._saveTimer);
        App._saveTimer = setTimeout(() => App.updateCurrentNote(), 1000);
    }
});

// Ctrl+S 保存
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        App.updateCurrentNote();
        App.showToast('已保存');
    }
});

// ===== 回到顶部悬浮窗（一键回顶 + 可拖动调位，位置记忆） =====
(function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    // 页面内所有可滚动容器：主区域 / 笔记列表 / 待办列表 / 编辑区
    const getContainers = () => [
        document.querySelector('.page-body'),
        document.getElementById('noteList'),
        document.getElementById('todoList'),
        document.getElementById('editorContent')
    ].filter(Boolean);

    // 当前已滚动且可见的容器（取滚动最深的）
    function activeScroller() {
        let best = null;
        getContainers().forEach(el => {
            if (el.scrollTop > 120 && el.offsetParent !== null) {
                if (!best || el.scrollTop > best.scrollTop) best = el;
            }
        });
        return best;
    }

    function updateVisibility() {
        btn.classList.toggle('visible', !!activeScroller());
    }

    getContainers().forEach(el => el.addEventListener('scroll', updateVisibility, { passive: true }));
    // 列表重绘 / 切换标签页后滚动状态可能变化
    document.addEventListener('click', () => setTimeout(updateVisibility, 300));

    // ----- 位置：默认右下角，拖动后记忆到 localStorage -----
    const POS_KEY = 'backToTopPos';
    function applyPos(x, y) {
        const r = btn.getBoundingClientRect();
        x = Math.max(8, Math.min(x, window.innerWidth - r.width - 8));
        y = Math.max(8, Math.min(y, window.innerHeight - r.height - 8));
        btn.style.left = x + 'px';
        btn.style.top = y + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
    }
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) {}
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
        applyPos(saved.x, saved.y);
    } else {
        applyPos(window.innerWidth - 76, window.innerHeight - 134);
    }
    window.addEventListener('resize', () => {
        const r = btn.getBoundingClientRect();
        applyPos(r.left, r.top); // 窗口变化时夹回可视区域
    });

    // ----- 拖动 vs 点击（移动超过 4px 视为拖动） -----
    let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    btn.addEventListener('pointerdown', (e) => {
        dragging = true;
        moved = false;
        sx = e.clientX;
        sy = e.clientY;
        const r = btn.getBoundingClientRect();
        ox = r.left;
        oy = r.top;
        btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            moved = true;
            btn.classList.add('dragging');
        }
        if (moved) applyPos(ox + dx, oy + dy);
    });
    btn.addEventListener('pointerup', () => {
        dragging = false;
        btn.classList.remove('dragging');
        if (moved) {
            const r = btn.getBoundingClientRect();
            try { localStorage.setItem(POS_KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (e) {}
        } else {
            const target = activeScroller();
            if (target) target.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    updateVisibility();
})();
