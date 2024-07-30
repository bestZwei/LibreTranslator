

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

const sourceLanguages = [
    { code: 'AR', name: '阿拉伯语' },
    { code: 'BG', name: '保加利亚语' },
    { code: 'CS', name: '捷克语' },
    { code: 'DA', name: '丹麦语' },
    { code: 'DE', name: '德语' },
    { code: 'EL', name: '希腊语' },
    { code: 'EN', name: '英语' },
    { code: 'ES', name: '西班牙语' },
    { code: 'ET', name: '爱沙尼亚语' },
    { code: 'FI', name: '芬兰语' },
    { code: 'FR', name: '法语' },
    { code: 'HU', name: '匈牙利语' },
    { code: 'ID', name: '印尼语' },
    { code: 'IT', name: '意大利语' },
    { code: 'JA', name: '日语' },
    { code: 'KO', name: '韩语' },
    { code: 'LT', name: '立陶宛语' },
    { code: 'LV', name: '拉脱维亚语' },
    { code: 'NB', name: '挪威语' },
    { code: 'NL', name: '荷兰语' },
    { code: 'PL', name: '波兰语' },
    { code: 'PT', name: '葡萄牙语' },
    { code: 'RO', name: '罗马尼亚语' },
    { code: 'RU', name: '俄语' },
    { code: 'SK', name: '斯洛伐克语' },
    { code: 'SL', name: '斯洛文尼亚语' },
    { code: 'SV', name: '瑞典语' },
    { code: 'TR', name: '土耳其语' },
    { code: 'UK', name: '乌克兰语' },
    { code: 'ZH', name: '中文' }
];

const targetLanguages = [
    { code: 'AR', name: '阿拉伯语' },
    { code: 'BG', name: '保加利亚语' },
    { code: 'CS', name: '捷克语' },
    { code: 'DA', name: '丹麦语' },
    { code: 'DE', name: '德语' },
    { code: 'EL', name: '希腊语' },
    { code: 'EN', name: '英语' },
    { code: 'EN-GB', name: '英语（英式）' },
    { code: 'EN-US', name: '英语（美式）' },
    { code: 'ES', name: '西班牙语' },
    { code: 'ET', name: '爱沙尼亚语' },
    { code: 'FI', name: '芬兰语' },
    { code: 'FR', name: '法语' },
    { code: 'HU', name: '匈牙利语' },
    { code: 'ID', name: '印尼语' },
    { code: 'IT', name: '意大利语' },
    { code: 'JA', name: '日语' },
    { code: 'KO', name: '韩语' },
    { code: 'LT', name: '立陶宛语' },
    { code: 'LV', name: '拉脱维亚语' },
    { code: 'NB', name: '挪威语' },
    { code: 'NL', name: '荷兰语' },
    { code: 'PL', name: '波兰语' },
    { code: 'PT', name: '葡萄牙语' },
    { code: 'PT-BR', name: '葡萄牙语（巴西）' },
    { code: 'PT-PT', name: '葡萄牙语（除巴西）' },
    { code: 'RO', name: '罗马尼亚语' },
    { code: 'RU', name: '俄语' },
    { code: 'SK', name: '斯洛伐克语' },
    { code: 'SL', name: '斯洛文尼亚语' },
    { code: 'SV', name: '瑞典语' },
    { code: 'TR', name: '土耳其语' },
    { code: 'UK', name: '乌克兰语' },
    { code: 'ZH', name: '中文' },
    { code: 'ZH-HANS', name: '中文（简体）' },
    { code: 'ZH-HANT', name: '中文（繁体）' }
];


const App = () => {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('ZH');
    const [targetLang, setTargetLang] = useState('EN');
    const [inputCharCount, setInputCharCount] = useState(0);
    const [outputCharCount, setOutputCharCount] = useState(0);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [autoTranslate, setAutoTranslate] = useState(false);

    useEffect(() => {
        if (!process.env.REACT_APP_PASSWORD) {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (autoTranslate && text) {
            handleTranslate();
        }
    }, [text, sourceLang, targetLang, autoTranslate]);

    useEffect(() => {
        const userLang = navigator.language || navigator.userLanguage;
        if (['zh', 'de', 'en'].includes(userLang.split('-')[0])) {
            i18n.changeLanguage(userLang.split('-')[0]);
        } else {
            i18n.changeLanguage('en');
        }
    }, [i18n]);

    const handleTranslate = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_DEEPLX_API_URL}/translate?token=${process.env.REACT_APP_API_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    source_lang: sourceLang,
                    target_lang: targetLang
                })
            });

            const data = await response.json();

            if (data.code === 200) {
                setTranslatedText(data.data);
                setOutputCharCount(data.data.length);
                setMessage(t('translationSuccess'));
                setIsError(false);
            } else {
                setMessage(t('translationFailed'));
                setIsError(true);
            }

            setTimeout(() => {
                setMessage('');
            }, 2000);
        } catch (error) {
            console.error('翻译请求错误:', error);
            setMessage(t('translationError'));
            setIsError(true);
            setTimeout(() => {
                setMessage('');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        setInputCharCount(e.target.value.length);
    };

    const handleOutputChange = (e) => {
        setTranslatedText(e.target.value);
        setOutputCharCount(e.target.value.length);
    };

    const handleCopy = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setMessage(t('copySuccess'));
                setIsError(false);
            })
            .catch(() => {
                setMessage(t('copyFailed'));
                setIsError(true);
            });

        setTimeout(() => {
            setMessage('');
        }, 2000);
    };

    const handleSwapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    };

    const handlePasswordSubmit = () => {
        if (!process.env.REACT_APP_PASSWORD || password === process.env.REACT_APP_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            setMessage(t('wrongPassword'));
            setIsError(true);
            setTimeout(() => {
                setMessage('');
            }, 2000);
        }
    };

    const changeLanguage = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    if (!isAuthenticated) {
        return (
            <div className="container">
                <h1>LibreTranslator</h1>
                <div className="password-container">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('enterPassword')}
                    />
                    <button onClick={handlePasswordSubmit}>{t('submit')}</button>
                </div>
                {message && (
                    <div className={`message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container">
            <h1>LibreTranslator</h1>
            <div className="language-auto-translate">
                <div className="language-switcher">
                    <label>{t('selectLanguage')}:</label>
                    <select onChange={changeLanguage}>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
                <div className="auto-translate">
                    <label>
                        <input
                            type="checkbox"
                            checked={autoTranslate}
                            onChange={(e) => setAutoTranslate(e.target.checked)}
                        />
                        {t('autoTranslate')}
                    </label>
                </div>
            </div>
            <div className="language-selection">
                <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                    {sourceLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <button onClick={handleSwapLanguages} className="swap-button">⇄</button>
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                    {targetLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
            </div>
            <div className="text-areas">
                <div className="input-text-area">
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        placeholder={t('inputPlaceholder')}
                        rows="10"
                    />
                    <div className="info-bar">
                        <div className="char-count">{t('charCount')}: {inputCharCount}</div>
                        <button onClick={() => handleCopy(text)} className="copy-button">{t('copy')}</button>
                    </div>
                </div>
                <div className="output-text-area">
                    <textarea
                        value={translatedText}
                        onChange={handleOutputChange}
                        placeholder={t('outputPlaceholder')}
                        rows="10"
                    />
                    <div className="info-bar">
                        <div className="char-count">{t('charCount')}: {outputCharCount}</div>
                        <button onClick={() => handleCopy(translatedText)} className="copy-button">{t('copy')}</button>
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button onClick={handleTranslate} disabled={loading}>
                    {loading ? t('translating') : t('translate')}
                </button>
            </div>
            {message && (
                <div className={`message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
            <footer className="footer">
                <a href="https://github.com/bestZwei/LibreTranslator" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>
                <span> | {t('poweredBy')}</span>
            </footer>
        </div>
    );
};

export default App;