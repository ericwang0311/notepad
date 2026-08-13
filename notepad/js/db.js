/**
 * 数据库模块 - 使用 IndexedDB 存储加密后的笔记和附件
 */
const DB = {
    db: null,
    DB_NAME: 'SecureNotepadDB',
    DB_VERSION: 1,

    // 解析实际数据库名：file:// 下按目录路径区分，不同副本数据独立
    resolveDbName() {
        if (location.protocol === 'file:') {
            // 去掉尾部文件名得目录；子页面（mind/flow/code）与主页面共用同一库，避免数据隔离成旧副本
            let dir = location.href.replace(/\/[^\/]*$/, '').toLowerCase();
            dir = dir.replace(/\/(mind|flow|code)$/, '');
            let h = 0;
            for (let i = 0; i < dir.length; i++) h = ((h << 5) - h + dir.charCodeAt(i)) | 0;
            return `${this.DB_NAME}_${(h >>> 0).toString(36)}`;
        }
        return this.DB_NAME;
    },

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.resolveDbName(), this.DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = async () => {
                this.db = request.result;
                // 申请持久化存储，尽量避免浏览器因存储压力或清理策略回收数据
                if (navigator.storage && navigator.storage.persist) {
                    navigator.storage.persist().catch(() => {});
                }
                await this.migrateLegacy();
                resolve(this.db);
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // 元数据存储（salt, 验证令牌等）
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta', { keyPath: 'key' });
                }
                // 笔记存储
                if (!db.objectStoreNames.contains('notes')) {
                    const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
                    noteStore.createIndex('date', 'date', { unique: false });
                }
                // 附件存储
                if (!db.objectStoreNames.contains('attachments')) {
                    const attachStore = db.createObjectStore('attachments', { keyPath: 'id' });
                    attachStore.createIndex('noteId', 'noteId', { unique: false });
                }
            };
        });
    },

    // 旧共享库迁移：首次打开时把旧库数据完整拷入当前目录的独立库（旧库保留不动）
    async migrateLegacy() {
        if (this.db.name === this.DB_NAME) return; // 非目录隔离模式无需迁移
        try {
            if (await this.getMeta('migrated_from_legacy')) return; // 已迁移过
            const legacy = await new Promise((resolve) => {
                const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
                req.onblocked = () => resolve(null);
            });
            if (!legacy) { await this.setMeta('migrated_from_legacy', '1'); return; }
            try {
                for (const store of ['meta', 'notes', 'attachments']) {
                    if (!legacy.objectStoreNames.contains(store)) continue;
                    const items = await new Promise((res) => {
                        const r = legacy.transaction(store, 'readonly').objectStore(store).getAll();
                        r.onsuccess = () => res(r.result || []);
                        r.onerror = () => res([]);
                    });
                    for (const item of items) await this._put(store, item);
                }
            } finally {
                legacy.close();
            }
            await this.setMeta('migrated_from_legacy', '1');
        } catch (e) {
            console.warn('旧数据迁移失败', e);
        }
    },

    // 通用写入
    _put(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // 通用读取
    _get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // 通用删除
    _delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // 通用清空存储区
    _clear(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const request = tx.objectStore(storeName).clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // 通用获取所有
    _getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // 通过索引获取
    _getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // === Meta 操作 ===
    async setMeta(key, value) {
        return this._put('meta', { key, value });
    },

    async getMeta(key) {
        const result = await this._get('meta', key);
        return result ? result.value : null;
    },

    // === 笔记操作 ===
    async saveNote(note) {
        return this._put('notes', note);
    },

    async getNote(id) {
        return this._get('notes', id);
    },

    async deleteNote(id) {
        // 同时删除关联附件
        const attachments = await this._getByIndex('attachments', 'noteId', id);
        for (const att of attachments) {
            await this._delete('attachments', att.id);
        }
        return this._delete('notes', id);
    },

    async getAllNotes() {
        return this._getAll('notes');
    },

    async getNotesByDate(date) {
        return this._getByIndex('notes', 'date', date);
    },

    // === 附件操作 ===
    async saveAttachment(attachment) {
        return this._put('attachments', attachment);
    },

    async getAttachment(id) {
        return this._get('attachments', id);
    },

    async deleteAttachment(id) {
        return this._delete('attachments', id);
    },

    async getAttachmentsByNoteId(noteId) {
        return this._getByIndex('attachments', 'noteId', noteId);
    },

    async getAllAttachments() {
        return this._getAll('attachments');
    }
};
