/**
 * SQLite 存储模块（基于本地 sql.js WASM，不依赖 CDN）
 * 在内存中运行 SQLite，绑定磁盘上的 .sqlite 文件：
 * 每次保存自动写入文件，打开时自动读取——文件是标准 SQLite 格式，可用 DB Browser 等工具查看。
 */
const SQLiteStore = {
    SQL: null,   // initSqlJs 返回的引擎
    db: null,    // 内存中的 SQLite 数据库实例

    supported() {
        return typeof window.showSaveFilePicker === 'function';
    },

    // 按需动态加载本地 sql-wasm.js 并初始化引擎
    async init() {
        if (this.SQL) return this.SQL;
        const loadScript = (src) => new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error(src + ' 加载失败'));
            document.head.appendChild(s);
        });
        // wasm 以 base64 内嵌在 js 中直接传入，避免 file:// 下浏览器拦截 wasm 的 fetch/XHR 请求
        if (!window.SQL_WASM_BINARY_BASE64) await loadScript('js/vendor/sql-wasm-binary.js');
        if (typeof initSqlJs !== 'function') await loadScript('js/vendor/sql-wasm.js');
        let config = { locateFile: file => 'js/vendor/' + file };
        const b64 = window.SQL_WASM_BINARY_BASE64;
        if (b64) {
            const bin = atob(b64);
            const wasmBinary = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) wasmBinary[i] = bin.charCodeAt(i);
            config = { wasmBinary };
        }
        this.SQL = await initSqlJs(config);
        return this.SQL;
    },

    // 打开内存数据库：传入文件字节则加载已有库，否则新建
    async open(bytes) {
        await this.init();
        if (this.db) { this.db.close(); this.db = null; }
        this.db = (bytes && bytes.length) ? new this.SQL.Database(bytes) : new this.SQL.Database();
        this.db.run('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, date TEXT, json TEXT)');
        this.db.run('CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, noteId TEXT, json TEXT)');
        this.db.run('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)');
    },

    // 从 IndexedDB 拉取全部数据写入内存 SQLite（写文件前调用，全量刷新）
    async pullFromIndexedDB() {
        if (!this.db) throw new Error('SQLite 未初始化');
        this.db.run('DELETE FROM notes');
        this.db.run('DELETE FROM attachments');
        this.db.run("DELETE FROM meta WHERE key IN ('salt','verifyToken')");
        const insNote = this.db.prepare('INSERT INTO notes (id, date, json) VALUES (?,?,?)');
        for (const n of await DB.getAllNotes()) {
            insNote.run([n.id, n.date || '', JSON.stringify(n)]);
        }
        insNote.free();
        const insAtt = this.db.prepare('INSERT INTO attachments (id, noteId, json) VALUES (?,?,?)');
        for (const att of await DB.getAllAttachments()) {
            const { data, ...rest } = att;
            insAtt.run([att.id, att.noteId || '', JSON.stringify({ ...rest, data: CryptoManager.arrayBufferToBase64(data) })]);
        }
        insAtt.free();
        const salt = await DB.getMeta('salt');
        const token = await DB.getMeta('verifyToken');
        if (salt) this.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('salt', ?)", [salt]);
        if (token) this.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('verifyToken', ?)", [token]);
    },

    // 把内存 SQLite 的数据推回 IndexedDB（覆盖式导入）
    // 返回 false 表示文件无笔记而本地有数据，已跳过（空文件保护）
    async pushToIndexedDB() {
        if (!this.db) throw new Error('SQLite 未初始化');
        const readRows = (sql) => {
            const rows = [];
            const stmt = this.db.prepare(sql);
            while (stmt.step()) rows.push(stmt.get());
            stmt.free();
            return rows;
        };
        const noteRows = readRows('SELECT json FROM notes').map(r => JSON.parse(r[0]));
        // 空文件保护：文件中没有笔记但本地有，不得清空本地
        if (noteRows.length === 0 && (await DB.getAllNotes()).length > 0) return false;
        const attRows = readRows('SELECT json FROM attachments').map(r => JSON.parse(r[0]));
        const metaRows = {};
        for (const [k, v] of readRows('SELECT key, value FROM meta')) metaRows[k] = v;

        await DB._clear('notes');
        await DB._clear('attachments');
        for (const n of noteRows) await DB.saveNote(n);
        for (const a of attRows) {
            await DB.saveAttachment({ ...a, data: CryptoManager.base64ToArrayBuffer(a.data) });
        }
        if (metaRows.salt) {
            await DB.setMeta('salt', metaRows.salt);
            await DB.setMeta('verifyToken', metaRows.verifyToken);
        }
        return true;
    },

    // 导出为二进制，供写入磁盘文件
    export() {
        if (!this.db) throw new Error('SQLite 未初始化');
        return this.db.export();
    }
};
