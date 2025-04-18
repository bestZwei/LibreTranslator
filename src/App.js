import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

const sourceLanguages = ['AUTO', 'ZH', 'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI', 'FR', 'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK'];

const targetLanguages = ['ZH', 'ZH-HANS', 'ZH-HANT', 'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES', 'ET', 'FI', 'FR', 'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT', 'PT-BR', 'PT-PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK'];

const App = () => {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('AUTO');
    const [targetLang, setTargetLang] = useState('EN');
    const [inputCharCount, setInputCharCount] = useState(0);
    const [outputCharCount, setOutputCharCount] = useState(0);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [autoTranslate, setAutoTranslate] = useState(true);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [translationPending, setTranslationPending] = useState(false);
    
    const inputRef = useRef(null);
    const outputRef = useRef(null);

    useEffect(() => {
        if (!process.env.REACT_APP_PASSWORD) {
            setIsAuthenticated(true);
        }
        
        // Load translation history from localStorage
        const savedHistory = localStorage.getItem('translationHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history:', e);
                localStorage.removeItem('translationHistory');
            }
        }
    }, []);

    useEffect(() => {
        // Save history to localStorage whenever it changes
        localStorage.setItem('translationHistory', JSON.stringify(history));
    }, [history]);

    const saveToHistory = (sourceText, translatedText, sourceLang, targetLang, detectedLang) => {
        if (!sourceText.trim() || !translatedText.trim()) return;
        
        const newHistoryItem = {
            id: Date.now(),
            sourceText: sourceText,
            translatedText: translatedText,
            sourceLang: sourceLang === 'AUTO' ? (detectedLang || 'AUTO') : sourceLang,
            targetLang: targetLang,
            timestamp: new Date().toISOString()
        };
        
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); // Keep only the last 50 items
    };

    const handleTranslate = async () => {
        if (!text.trim()) return;
        
        setLoading(true);
        try {
            const body = {
                text: text,
                target_lang: targetLang
            };
            
            if (sourceLang !== 'AUTO') {
                body.source_lang = sourceLang;
            }

            const response = await fetch(`${process.env.REACT_APP_DEEPLX_API_URL}/translate?token=${process.env.REACT_APP_API_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.code === 200) {
                setTranslatedText(data.data);
                setOutputCharCount(data.data.length);
                setMessage(t('translationSuccess'));
                setIsError(false);
                
                // If language was auto-detected, store the detected language
                if (sourceLang === 'AUTO' && data.detected_language) {
                    setDetectedLanguage(data.detected_language);
                    saveToHistory(text, data.data, sourceLang, targetLang, data.detected_language);
                } else {
                    saveToHistory(text, data.data, sourceLang, targetLang);
                }
            } else {
                setMessage(t('translationFailed'));
                setIsError(true);
            }

            setTimeout(() => {
                setMessage('');
            }, 3000);
        } catch (error) {
            console.error('翻译请求错误:', error);
            setMessage(t('translationError'));
            setIsError(true);
            setTimeout(() => {
                setMessage('');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const startTranslateTimer = useCallback((newText) => {
        if (autoTranslate && newText.trim() && !loading) {
            // Show pending indicator
            setTranslationPending(true);
            
            // Clear any existing timers
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Set a new timer with adaptive delay
            // Use a longer delay for longer text
            const delay = Math.min(1500, 1000 + Math.floor(newText.length / 20) * 100);
            
            const newTimer = setTimeout(() => {
                setTranslationPending(false);
                handleTranslate();
            }, delay);
            
            setTypingTimeout(newTimer);
        }
    }, [autoTranslate, loading, typingTimeout, handleTranslate]);

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        setInputCharCount(newText.length);

        // Don't start translation if we're in the middle of IME composition
        if (!isComposing && autoTranslate) {
            startTranslateTimer(newText);
        }
    };

    const handleComposition = (e) => {
        if (e.type === 'compositionstart') {
            setIsComposing(true);
        } else if (e.type === 'compositionend') {
            setIsComposing(false);
            const newText = e.target.value;
            // Only start translation when composition ends
            startTranslateTimer(newText);
        }
    };

    const handlePaste = (e) => {
        const newText = e.target.value;
        setText(newText);
        setInputCharCount(newText.length);
        // When pasting, we can start translating immediately
        setTimeout(() => {
            startTranslateTimer(newText);
        }, 100);
    };
    
    const handleKeyDown = (e) => {
        // Enter key with Ctrl/Cmd for manual translation
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleTranslate();
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                setTranslationPending(false);
            }
        }
        
        // If the user presses Enter or Tab, consider it a pause and translate
        if ((e.key === 'Enter' || e.key === 'Tab') && autoTranslate && !isComposing) {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                setTranslationPending(false);
            }
            if (text.trim()) {
                handleTranslate();
            }
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [typingTimeout]);

    useEffect(() => {
        // 首先尝试从localStorage获取用户之前选择的语言
        const savedLanguage = localStorage.getItem('uiLanguage');
        
        if (savedLanguage && ['zh', 'de', 'en'].includes(savedLanguage)) {
            i18n.changeLanguage(savedLanguage);
        } else {
            // 如果没有保存的语言，则从浏览器设置中检测
            const userLang = navigator.language || navigator.userLanguage;
            let detectedLang = 'en'; // 默认为英语
            
            // 处理常见的中文变体
            if (userLang.startsWith('zh')) {
                detectedLang = 'zh';
            } 
            // 处理常见的德语变体
            else if (userLang.startsWith('de')) {
                detectedLang = 'de';
            }
            // 处理常见的英语变体
            else if (userLang.startsWith('en')) {
                detectedLang = 'en';
            }
            
            i18n.changeLanguage(detectedLang);
            // 保存检测到的语言
            localStorage.setItem('uiLanguage', detectedLang);
        }
    }, [i18n]);

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
    
    const handleSpeak = (text, lang) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set the language - simplify the language code if needed
            let langCode = lang;
            if (langCode.includes('-')) {
                // For languages like ZH-HANS, use just the first part
                langCode = langCode.split('-')[0].toLowerCase();
            } else {
                langCode = langCode.toLowerCase();
            }
            
            utterance.lang = langCode;
            speechSynthesis.speak(utterance);
        }
    };

    const handleSwapLanguages = () => {
        if (sourceLang !== 'AUTO' && targetLang !== 'AUTO') {
            const tempLang = sourceLang;
            setSourceLang(targetLang);
            setTargetLang(tempLang);
            
            // Also swap the text
            setTranslatedText(text);
            setText(translatedText);
            setInputCharCount(translatedText.length);
            setOutputCharCount(text.length);
        }
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
        const newLang = event.target.value;
        i18n.changeLanguage(newLang);
        localStorage.setItem('uiLanguage', newLang);
    };
    
    const loadFromHistory = (item) => {
        setText(item.sourceText);
        setTranslatedText(item.translatedText);
        setInputCharCount(item.sourceText.length);
        setOutputCharCount(item.translatedText.length);
        setSourceLang(item.sourceLang === 'AUTO' ? 'AUTO' : item.sourceLang);
        setTargetLang(item.targetLang);
        setHistoryOpen(false);
    };
    
    const clearHistory = () => {
        if (window.confirm(t('clearHistoryConfirm'))) {
            setHistory([]);
            localStorage.removeItem('translationHistory');
        }
    };
    
    const clearText = (field) => {
        if (field === 'input') {
            setText('');
            setInputCharCount(0);
        } else {
            setTranslatedText('');
            setOutputCharCount(0);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="password-container">
                <h1>LibreTranslator</h1>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enterPassword')}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <button onClick={handlePasswordSubmit}>{t('submit')}</button>
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
            <div className="app-header">
                <h1 className="app-title">LibreTranslator</h1>
                <div className="app-controls">
                    <div className="language-switcher">
                        <label>Lang:</label>
                        <select onChange={changeLanguage} value={i18n.language}>
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
            </div>
            
            <div className="features-bar">
                <button 
                    className="feature-button" 
                    onClick={() => setHistoryOpen(true)}
                    title={t('history')}
                >
                    <span className="feature-icon">📜</span> {t('history')}
                </button>
                {/* Additional feature buttons could be added here */}
            </div>
            
            <div className="language-selection">
                <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                    {sourceLanguages.map(langCode => (
                        <option key={langCode} value={langCode}>
                            {langCode === 'AUTO' ? t('sourceLanguages.AUTO') : t(`sourceLanguages.${langCode}`)}
                        </option>
                    ))}
                </select>
                <button onClick={handleSwapLanguages} className="swap-button" title={t('swapLanguages')}>⇄</button>
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                    {targetLanguages.map(langCode => (
                        <option key={langCode} value={langCode}>
                            {t(`targetLanguages.${langCode}`)}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="text-areas">
                <div className="textarea-container">
                    <div className="textarea-header">
                        <div className="textarea-header-language">
                            {sourceLang === 'AUTO' ? t('sourceLanguages.AUTO') : t(`sourceLanguages.${sourceLang}`)}
                            {sourceLang === 'AUTO' && detectedLanguage && ` (${t(`sourceLanguages.${detectedLanguage}`)})` }
                        </div>
                        <div className="textarea-actions">
                            {autoTranslate && translationPending && (
                                <div className="translation-pending-indicator" title={t('translating')}>⋯</div>
                            )}
                            <button 
                                className="action-button" 
                                onClick={() => handleSpeak(text, detectedLanguage || sourceLang)}
                                title={t('speak')}
                                disabled={!text.trim()}
                            >
                                🔊
                            </button>
                            <button 
                                className="action-button" 
                                onClick={() => clearText('input')} 
                                title={t('clearText')}
                                disabled={!text.trim()}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <textarea
                        ref={inputRef}
                        value={text}
                        onChange={handleTextChange}
                        onCompositionStart={handleComposition}
                        onCompositionUpdate={handleComposition}
                        onCompositionEnd={handleComposition}
                        onPaste={handlePaste}
                        onKeyDown={handleKeyDown}
                        placeholder={t('inputPlaceholder')}
                    />
                    <div className="info-bar">
                        <div className="char-count">{t('charCount')}: {inputCharCount}</div>
                        <button 
                            onClick={() => handleCopy(text)} 
                            className="copy-button" 
                            disabled={!text.trim()}
                        >
                            {t('copy')}
                        </button>
                    </div>
                </div>
                
                <div className="textarea-container">
                    <div className="textarea-header">
                        <div className="textarea-header-language">
                            {t(`targetLanguages.${targetLang}`)}
                        </div>
                        <div className="textarea-actions">
                            <button 
                                className="action-button" 
                                onClick={() => handleSpeak(translatedText, targetLang)}
                                title={t('speak')}
                                disabled={!translatedText.trim()}
                            >
                                🔊
                            </button>
                            <button 
                                className="action-button" 
                                onClick={() => clearText('output')}
                                title={t('clearText')}
                                disabled={!translatedText.trim()}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <textarea
                        ref={outputRef}
                        value={translatedText}
                        onChange={handleOutputChange}
                        placeholder={t('outputPlaceholder')}
                    />
                    <div className="info-bar">
                        <div className="char-count">{t('charCount')}: {outputCharCount}</div>
                        <button 
                            onClick={() => handleCopy(translatedText)} 
                            className="copy-button"
                            disabled={!translatedText.trim()}
                        >
                            {t('copy')}
                        </button>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                    onClick={handleTranslate} 
                    disabled={loading || !text.trim()} 
                    className="translate-button"
                >
                    <span className="translate-button-icon">🔄</span>
                    {loading ? t('translating') : t('translate')}
                </button>
            </div>
            
            {message && (
                <div className={`message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
            
            <footer className="footer">
                <a href="https://github.com/bestZwei/LibreTranslator" target="_blank" rel="noopener noreferrer">GitHub</a>
                <span> | {t('poweredBy')}</span>
            </footer>
            
            {/* History Panel */}
            <div className={`history-panel ${historyOpen ? 'open' : ''}`}>
                <div className="history-header">
                    <h2 className="history-title">{t('history')}</h2>
                    <button className="close-history" onClick={() => setHistoryOpen(false)}>×</button>
                </div>
                <div className="history-items">
                    {history.length > 0 ? (
                        <>
                            {history.map(item => (
                                <div 
                                    key={item.id} 
                                    className="history-item" 
                                    onClick={() => loadFromHistory(item)}
                                >
                                    <div className="history-item-text">{item.sourceText}</div>
                                    <div className="history-item-translation">{item.translatedText}</div>
                                    <div className="history-item-langs">
                                        {item.sourceLang === 'AUTO' ? t('sourceLanguages.AUTO') : t(`sourceLanguages.${item.sourceLang}`)} → {t(`targetLanguages.${item.targetLang}`)}
                                    </div>
                                </div>
                            ))}
                            <button className="clear-history" onClick={clearHistory}>
                                {t('clearHistory')}
                            </button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            {t('noHistory')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
