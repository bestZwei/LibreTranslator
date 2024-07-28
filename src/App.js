import React, { useState } from 'react';
import './styles.css';

const languages = [
    { code: 'ar', name: '阿拉伯语' },
    { code: 'bg', name: '保加利亚语' },
    { code: 'zh', name: '中文' },
    { code: 'cs', name: '捷克语' },
    { code: 'da', name: '丹麦语' },
    { code: 'nl', name: '荷兰语' },
    { code: 'en', name: '英语' },
    { code: 'et', name: '爱沙尼亚语' },
    { code: 'fi', name: '芬兰语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'el', name: '希腊语' },
    { code: 'hu', name: '匈牙利语' },
    { code: 'id', name: '印尼语' },
    { code: 'it', name: '意大利语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'lv', name: '拉脱维亚语' },
    { code: 'lt', name: '立陶宛语' },
    { code: 'no', name: '挪威语' },
    { code: 'pl', name: '波兰语' },
    { code: 'pt', name: '葡萄牙语' },
    { code: 'ro', name: '罗马尼亚语' },
    { code: 'ru', name: '俄语' },
    { code: 'sk', name: '斯洛伐克语' },
    { code: 'sl', name: '斯洛文尼亚语' },
    { code: 'es', name: '西班牙语' },
    { code: 'sv', name: '瑞典语' },
    { code: 'tr', name: '土耳其语' },
    { code: 'uk', name: '乌克兰语' }
];

const App = () => {
    const [text, setText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('zh');

    const handleTranslate = async () => {
        const response = await fetch(`https://api.deeplx.org/nZyuEfvNhWk8Xfh2BP_0Dk3ZEnk5SdFIwA_8jaaAM8Q/translate`, {
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
    };

    return (
        <div className="container">
            <h1 className="title">DeepLx Translator</h1>
            <textarea 
                className="input-box" 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Enter text"
            ></textarea>
            <br/>
            <div className="select-container">
                <select 
                    className="language-select" 
                    value={sourceLang} 
                    onChange={(e) => setSourceLang(e.target.value)}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <select 
                    className="language-select" 
                    value={targetLang} 
                    onChange={(e) => setTargetLang(e.target.value)}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
            </div>
            <br/>
            <button className="translate-button" onClick={handleTranslate}>Translate</button>
            <p className="output-box">Translated Text: {translatedText}</p>
        </div>
    );
};

export default App;