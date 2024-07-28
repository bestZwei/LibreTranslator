import React, { useState } from 'react';

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
        <div>
            <h1>DeepLx Translator</h1>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text"></textarea>
            <br/>
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">Chinese</option>

            </select>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">Chinese</option>

            </select>
            <br/>
            <button onClick={handleTranslate}>Translate</button>
            <p>Translated Text: {translatedText}</p>
        </div>
    );
};

export default App;