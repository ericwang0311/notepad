/**
 * 加密模块 - 使用 Web Crypto API 实现 AES-GCM 加密
 * 通过 PBKDF2 从用户密码派生加密密钥
 */
const CryptoManager = {
    key: null,
    salt: null,

    // 生成随机 salt
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    },

    // 从密码派生密钥
    async deriveKey(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    },

    // 初始化：设置密码，生成或复用 salt
    async init(password, existingSalt) {
        if (existingSalt) {
            this.salt = existingSalt;
        } else {
            this.salt = this.generateSalt();
        }
        this.key = await this.deriveKey(password, this.salt);
        return this.salt;
    },

    // 加密字符串
    async encrypt(text) {
        if (!this.key) throw new Error('未初始化密钥');
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.key,
            enc.encode(text)
        );
        // 将 iv 和密文合并
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return this.arrayBufferToBase64(combined);
    },

    // 解密字符串
    async decrypt(base64Data) {
        if (!this.key) throw new Error('未初始化密钥');
        const combined = this.base64ToArrayBuffer(base64Data);
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            this.key,
            data
        );
        return new TextDecoder().decode(decrypted);
    },

    // 加密二进制数据（附件）
    async encryptBlob(blob) {
        if (!this.key) throw new Error('未初始化密钥');
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const data = await blob.arrayBuffer();
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.key,
            data
        );
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return new Blob([combined]);
    },

    // 解密二进制数据（附件）
    async decryptBlob(encryptedBlob) {
        if (!this.key) throw new Error('未初始化密钥');
        const combined = new Uint8Array(await encryptedBlob.arrayBuffer());
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            this.key,
            data
        );
        return new Blob([decrypted]);
    },

    // 创建验证令牌（用于验证密码是否正确）
    async createVerifyToken() {
        return this.encrypt('NOTEPAD_VERIFY_TOKEN_V1');
    },

    // 验证密码
    async verifyPassword(token) {
        try {
            const result = await this.decrypt(token);
            return result === 'NOTEPAD_VERIFY_TOKEN_V1';
        } catch {
            return false;
        }
    },

    // === 独立口令加解密（用于免密模式的密码包装，避免明文存储） ===
    // 用指定口令加密明文（随机 salt 前置，格式：salt|iv|密文）
    async encryptWithPassword(password, text) {
        const salt = this.generateSalt();
        const key = await this.deriveKey(password, salt);
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv }, key, enc.encode(text)
        );
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        return this.arrayBufferToBase64(combined);
    },

    // 用指定口令解密（encryptWithPassword 的逆操作）
    async decryptWithPassword(password, base64Data) {
        const combined = this.base64ToArrayBuffer(base64Data);
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const data = combined.slice(28);
        const key = await this.deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv }, key, data
        );
        return new TextDecoder().decode(decrypted);
    },

    // 工具方法
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    // 将 salt 转为可存储的格式
    saltToBase64(salt) {
        return this.arrayBufferToBase64(salt);
    },

    // 从存储格式恢复 salt
    base64ToSalt(base64) {
        return this.base64ToArrayBuffer(base64);
    }
};
