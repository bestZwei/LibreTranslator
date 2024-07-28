document.getElementById('translateButton').addEventListener('click', async () => {
    const inputText = document.getElementById('inputText').value;
    const targetLang = document.getElementById('languageSelect').value;
    const outputText = document.getElementById('outputText');

    const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText, targetLang: targetLang })
    });

    if (response.ok) {
        const data = await response.json();
        outputText.value = data.translation;
    } else {
        outputText.value = 'Translation failed';
    }
});