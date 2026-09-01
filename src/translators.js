// 翻译接口统一封装
// 支持多个免费翻译服务，默认使用 Google 翻译（无需密钥，直接调用公开接口）。
// 每个接口的 Base URL 都可通过环境变量覆盖，方便自建服务或替换公共实例。

export const TRANSLATORS = [
    {
        id: 'google',
        nameKey: 'provider.google',
        // 免费公开接口，无需密钥；可按需配置 REACT_APP_GOOGLE_API_URL 替换
        envUrl: 'REACT_APP_GOOGLE_API_URL',
        defaultUrl: 'https://translate.googleapis.com',
    },
    {
        id: 'deeplx',
        nameKey: 'provider.deeplx',
        envUrl: 'REACT_APP_DEEPLX_API_URL',
        defaultUrl: '',
        requiresUrl: true,
        tokenEnv: 'REACT_APP_API_TOKEN',
    },
    {
        id: 'libretranslate',
        nameKey: 'provider.libretranslate',
        envUrl: 'REACT_APP_LIBRETRANSLATE_URL',
        defaultUrl: 'https://translate.argosopentech.com',
    },
    {
        id: 'mymemory',
        nameKey: 'provider.mymemory',
        envUrl: 'REACT_APP_MYMEMORY_API_URL',
        defaultUrl: 'https://api.mymemory.translated.net',
    },
];

export function getProviderConfig(id) {
    return TRANSLATORS.find(p => p.id === id) || TRANSLATORS[0];
}

function getBaseUrl(provider) {
    const envVal = process.env[provider.envUrl];
    const base = (envVal || provider.defaultUrl || '').replace(/\/+$/, '');
    return base;
}

// ---- 语言代码映射 ----
// 应用内部使用 DeepL 风格代码（AUTO / ZH / ZH-HANS / EN-GB ...），
// 各接口需要不同的代码格式，下面分别做转换。

function toGoogle(code) {
    if (code === 'AUTO') return 'auto';
    const map = {
        'ZH': 'zh-CN', 'ZH-HANS': 'zh-CN', 'ZH-HANT': 'zh-TW',
        'EN': 'en', 'EN-GB': 'en-GB', 'EN-US': 'en-US',
        'PT': 'pt', 'PT-BR': 'pt-BR', 'PT-PT': 'pt-PT',
        'NB': 'no',
    };
    return map[code] || code.toLowerCase();
}

function toLibre(code) {
    if (code === 'AUTO') return 'auto';
    const map = {
        'ZH': 'zh', 'ZH-HANS': 'zh', 'ZH-HANT': 'zh',
        'EN': 'en', 'EN-GB': 'en', 'EN-US': 'en',
        'PT': 'pt', 'PT-BR': 'pt', 'PT-PT': 'pt',
        'NB': 'no',
    };
    return map[code] || code.toLowerCase();
}

function toMyMemory(code) {
    if (code === 'AUTO') return 'Autodetect';
    const map = {
        'ZH': 'zh-CN', 'ZH-HANS': 'zh-CN', 'ZH-HANT': 'zh-TW',
        'EN': 'en', 'EN-GB': 'en-GB', 'EN-US': 'en-US',
        'PT': 'pt', 'PT-BR': 'pt-BR', 'PT-PT': 'pt-PT',
        'NB': 'no',
    };
    return map[code] || code.toLowerCase();
}

function toDeepLX(code) {
    if (code === 'AUTO') return 'auto';
    const map = {
        'ZH': 'ZH', 'ZH-HANS': 'ZH', 'ZH-HANT': 'ZH',
        'EN': 'EN', 'EN-GB': 'EN-GB', 'EN-US': 'EN-US',
        'PT': 'PT', 'PT-BR': 'PT-BR', 'PT-PT': 'PT-PT',
        'NB': 'NB',
    };
    return map[code] || code.toUpperCase();
}

// Google 接口返回的 detected language 形如 "zh-CN" / "en"，转回应用内部代码
function normalizeDetected(code) {
    if (!code) return '';
    const map = {
        'zh-cn': 'ZH', 'zh-tw': 'ZH-HANT', 'zh': 'ZH',
        'en-gb': 'EN-GB', 'en-us': 'EN-US', 'en': 'EN',
        'no': 'NB', 'pt-br': 'PT-BR', 'pt-pt': 'PT-PT', 'pt': 'PT',
    };
    return map[code.toLowerCase()] || code.toUpperCase();
}

// ---- 各接口实现 ----
async function translateGoogle(text, source, target, base) {
    const sl = toGoogle(source);
    const tl = toGoogle(target);
    const url = `${base}/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = (data[0] || []).map(seg => seg[0]).join('');
    const detected = data[2] ? normalizeDetected(data[2]) : '';
    return { translatedText: translated, detectedLanguage: detected };
}

async function translateLibre(text, source, target, base) {
    const sl = toLibre(source);
    const tl = toLibre(target);
    const res = await fetch(`${base}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: sl, target: tl, format: 'text' }),
    });
    const data = await res.json();
    if (!data.translatedText) throw new Error(data.error || '翻译失败');
    return { translatedText: data.translatedText, detectedLanguage: '' };
}

async function translateMyMemory(text, source, target, base) {
    const sl = toMyMemory(source);
    const tl = toMyMemory(target);
    const url = `${base}/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(sl)}|${encodeURIComponent(tl)}`;
    const res = await fetch(url);
    const data = await res.json();
    const status = String(data.responseStatus);
    if (status !== '200') {
        throw new Error(data.responseDetails || '翻译失败');
    }
    return { translatedText: data.responseData.translatedText, detectedLanguage: '' };
}

async function translateDeepLX(text, source, target, base, token) {
    const body = { text, target_lang: toDeepLX(target) };
    // DeepLX 的自动检测通过不传 source_lang 实现
    if (source !== 'AUTO') body.source_lang = toDeepLX(source);
    let url = `${base}/translate`;
    if (token) url += `?token=${token}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.code !== 200) throw new Error('翻译失败');
    return { translatedText: data.data, detectedLanguage: data.detected_language || '' };
}

export async function translate(text, { provider, sourceLang, targetLang }) {
    const config = getProviderConfig(provider);
    const base = getBaseUrl(config);

    switch (provider) {
        case 'google':
            return await translateGoogle(text, sourceLang, targetLang, base);
        case 'libretranslate':
            return await translateLibre(text, sourceLang, targetLang, base);
        case 'mymemory':
            return await translateMyMemory(text, sourceLang, targetLang, base);
        case 'deeplx':
            if (!base) throw new Error('未配置 DeepLX API 地址，请设置环境变量 REACT_APP_DEEPLX_API_URL');
            return await translateDeepLX(text, sourceLang, targetLang, base, process.env[config.tokenEnv]);
        default:
            throw new Error('未知的翻译接口');
    }
}
