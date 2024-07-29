import React, { useState } from 'react';
import './styles.css';

const sourceLanguages = [
    { code: 'ar', name: '阿拉伯语' },
    { code: 'bg', name: '保加利亚语' },
    { code: 'cs', name: '捷克语' },
    { code: 'da', name: '丹麦语' },
    { code: 'de', name: '德语' },
    { code: 'el', name: '希腊语' },
    { code: 'en', name: '英语' }, // 修改为“英语”
    { code: 'es', name: '西班牙语' },
    { code: 'et', name: '爱沙尼亚语' },
    { code: 'fi', name: '芬兰语' },
    { code: 'fr', name: '法语' },
    { code: 'hu', name: '匈牙利语' },
    { code: 'id', name: '印尼语' },
    { code: 'it', name: '意大利语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'lt', name: '立陶宛语' },
    { code: 'lv', name: '拉脱维亚语' },
    { code: 'nb', name: '挪威语' },
    { code: 'nl', name: '荷兰语' },
    { code: 'pl', name: '波兰语' },
    { code: 'pt', name: '葡萄牙语' },
    { code: 'ro', name: '罗马尼亚语' },
    { code: 'ru', name: '俄语' },
    { code: 'sk', name: '斯洛伐克语' },
    { code: 'sl', name: '斯洛文尼亚语' },
    { code: 'sv', name: '瑞典语' },
    { code: 'tr', name: '土耳其语' },
    { code: 'uk', name: '乌克兰语' },
    { code: 'zh', name: '中文（简体）' }
];

const targetLanguages = [
    { code: 'ar', name: '阿拉伯语' },
    { code: 'bg', name: '保加利亚语' },
    { code: 'cs', name: '捷克语' },
    { code: 'da', name: '丹麦语' },
    { code: 'de', name: '德语' },
    { code: 'el', name: '希腊语' },
    { code: 'en-GB', name: '英语（英式）' },
    { code: 'en-US', name: '英语（美式）' },
    { code: 'es', name: '西班牙语' },
    { code: 'et', name: '爱沙尼亚语' },
    { code: 'fi', name: '芬兰语' },
    { code: 'fr', name: '法语' },
    { code: 'hu', name: '匈牙利语' },
    { code: 'id', name: '印尼语' },
    { code: 'it', name: '意大利语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'lt', name: '立陶宛语' },
    { code: 'lv', name: '拉脱维亚语' },
    { code: 'nb', name: '挪威语' },
    { code: 'nl', name: '荷兰语' },
    { code: 'pl', name: '波兰语' },
    { code: 'pt-BR', name: '葡萄牙语（巴西）' },
    { code: 'pt-PT', name: '葡萄牙语（葡萄牙）' },
    { code: 'ro', name: '罗马尼亚语' },
    { code: 'ru', name: '俄语' },
    { code: 'sk', name: '斯洛伐克语' },
    { code: 'sl', name: '斯洛文尼亚语' },
    { code: 'sv', name: '瑞典语' },
    { code: 'tr', name: '土耳其语' },
    { code: 'uk', name: '乌克兰语' },
    { code: 'zh', name: '中文（简体）' }
];

const App = () => {
    const [text, setText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('zh');
    const [targetLang, setTargetLang] = useState('en');
    const [inputCharCount, setInputCharCount] = useState(0);
    const [outputCharCount, setOutputCharCount] = useState(0);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleTranslate = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_DEEPLX_API_URL}/translate?token=your_access_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_PASSWORD}` // 添加 Authorization 头
                },
                body: JSON.stringify({
                    text: text,
                    source_lang: sourceLang.toUpperCase(), // 转换为大写
                    target_lang: targetLang.toUpperCase() // 转换为大写
                })
            });

            const data = await response.json();

            // 判断翻译是否成功
            if (data.code === 200) {
                setTranslatedText(data.data);
                setOutputCharCount(data.data.length);
                setMessage('翻译成功！');
                setIsError(false);
            } else {
                setMessage('翻译失败，请重试。');
                setIsError(true);
            }

            // 2秒后清除提示信息
            setTimeout(() => {
                setMessage('');
            }, 2000);
        } catch (error) {
            setMessage('翻译请求出错，请检查网络连接。');
            setIsError(true);
            setTimeout(() => {
                setMessage('');
            }, 2000);
        }
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        setInputCharCount(e.target.value.length);
    };

    const handleCopy = () => {
        if (translatedText) {
            navigator.clipboard.writeText(translatedText)
                .then(() => {
                    setMessage('结果已复制！');
                    setIsError(false);
                })
                .catch(() => {
                    setMessage('复制失败，请重试。');
                    setIsError(true);
                });

            // 2秒后清除提示信息
            setTimeout(() => {
                setMessage('');
            }, 2000);
        } else {
            setMessage('没有可复制的内容。');
            setIsError(true);
            setTimeout(() => {
                setMessage('');
            }, 2000);
        }
    };

    const handleSwapLanguages = () => {
        if (sourceLang === 'auto') {
            alert('交换无效，无法交换为自动检测语言');
            return;
        }

        // 检查目标语言是否有效
        const isSourceValid = sourceLanguages.some(lang => lang.code === targetLang);
        const isTargetValid = targetLanguages.some(lang => lang.code === sourceLang);

        if (isSourceValid && isTargetValid) {
            let newSourceLang = targetLang;
            let newTargetLang = sourceLang;

            // 如果原目标语言是英式或美式英语，交换后源语言设置为“英语”
            if (targetLang === 'en-GB' || targetLang === 'en-US') {
                newSourceLang = 'en'; // 设置源语言为“英语”
            }

            setSourceLang(newSourceLang);
            setTargetLang(newTargetLang);
        } else {
            alert('交换无效，某种语言不支持成为源语言或目标语言');
        }
    };

    return (
        <div className="container">
            <h1 className="title">LibreTranslator</h1>
            <div className={`message ${isError ? 'error' : 'success'} ${message ? 'visible' : ''}`}>{message}</div> {/* 提示信息 */}
            <div className="translation-container">
                <div className="input-section">
                    <select 
                        className="language-select" 
                        value={sourceLang} 
                        onChange={(e) => setSourceLang(e.target.value)}
                    >
                        {sourceLanguages.map(lang => (
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
                        <div className="char-count">{inputCharCount} 字符</div>
                    </div>
                </div>
                <div className="button-section">
                    <button className="translate-button" onClick={handleTranslate}>翻译</button>
                    <button className="swap-button" onClick={handleSwapLanguages}>交换语言</button>
                    <button className="copy-button" onClick={handleCopy}>复制结果</button>
                </div>
                <div className="output-section">
                    <select 
                        className="language-select" 
                        value={targetLang} 
                        onChange={(e) => setTargetLang(e.target.value)}
                    >
                        {targetLanguages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <div className="text-area-container">
                        <textarea 
                            className="output-box" 
                            value={translatedText} 
                            readOnly 
                            placeholder="翻译结果"
                        ></textarea>
                        <div className="char-count">{outputCharCount} 字符</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;