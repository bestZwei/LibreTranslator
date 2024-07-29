import React, { useState } from 'react';
import './styles.css';

const languages = [
    { code: 'auto', name: '自动检测' },
    { code: 'ar', name: '阿拉伯语' },
    { code: 'bg', name: '保加利亚语' },
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英语' },
    // 其他语言...
];

const App = () => {
    const [text, setText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('zh');
    const [inputCharCount, setInputCharCount] = useState(0);
    const [outputCharCount, setOutputCharCount] = useState(0);

    const handleTranslate = async () => {
        const response = await fetch(`${process.env.REACT_APP_DEEPLX_API_URL}/translate?token=your_access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });

        const data = await response.json();
        setTranslatedText(data.data);
        setOutputCharCount(data.data.length);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        setInputCharCount(e.target.value.length);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(translatedText);
    };

    const handleSwapLanguages = () => {
        if (sourceLang === 'auto') {
            alert('交换无效，无法交换为自动检测语言');
            return;
        }
        const newSourceLang = targetLang;
        const newTargetLang = sourceLang;
        setSourceLang(newSourceLang);
        setTargetLang(newTargetLang);
    };

    return (
        <div className="container">
            <h1 className="title">LibreTranslator</h1>
            <p className="subtitle">基于 DeepLx 的翻译器</p>
            <div className="translation-container">
                <div className="input-section">
                    <select 
                        className="language-select" 
                        value={sourceLang} 
                        onChange={(e) => setSourceLang(e.target.value)}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <div className="text-area-container">
                        <textarea 
                            className="input-box" 
                            value={text} 
                            onChange={handleTextChange} 
                            placeholder="输入文本"
                        ></textarea>
                    </div>
                    <div className="char-count">{inputCharCount} 字符</div>
                </div>
                <div className="button-section">
                    <button className="translate-button" onClick={handleTranslate}>翻译</button>
                    <button className="swap-button" onClick={handleSwapLanguages}>交换</button>
                    <button className="copy-button" onClick={handleCopy}>复制</button>
                </div>
                <div className="output-section">
                    <select 
                        className="language-select" 
                        value={targetLang} 
                        onChange={(e) => setTargetLang(e.target.value)}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <div className="text-area-container">
                        <textarea 
                            className="output-box" 
                            value={translatedText} 
                            readOnly 
                            placeholder="翻译"
                        ></textarea>
                    </div>
                    <div className="char-count">{outputCharCount} 字符</div>
                </div>
            </div>
        </div>
    );
};

export default App;