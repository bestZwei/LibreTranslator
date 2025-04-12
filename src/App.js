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
            if (window.translateTimer) {
                clearTimeout(window.translateTimer);
            }
            window.translateTimer = setTimeout(() => {
                handleTranslate();
            }, 1000);
        }
    }, [autoTranslate, loading]);

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        setInputCharCount(newText.length);

        if (!e.nativeEvent.isComposing && 
            e.nativeEvent.inputType !== 'insertCompositionText') {
            startTranslateTimer(newText);
        }
    };

    const handleComposition = (e) => {
        if (e.type === 'compositionend') {
            const newText = e.target.value;
            startTranslateTimer(newText);
        }
    };

    const handlePaste = (e) => {
        const newText = e.target.value;
        setText(newText);
        setInputCharCount(newText.length);
        startTranslateTimer(newText);
    };
    
    const handleKeyDown = (e) => {
        // Enter key with Ctrl/Cmd for manual translation
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleTranslate();
        }
    };

    useEffect(() => {
        return () => {
            if (window.translateTimer) {
                clearTimeout(window.translateTimer);
            }
        };
    }, []);

    useEffect(() => {
        const userLang = navigator.language || navigator.userLanguage;
        if (['zh', 'de', 'en'].includes(userLang.split('-')[0])) {
            i18n.changeLanguage(userLang.split('-')[0]);
        } else {
            i18n.changeLanguage('en');
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
        i18n.changeLanguage(event.target.value);
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
