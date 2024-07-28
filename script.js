document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('input');
  const outputText = document.getElementById('output');
  const languageSelect = document.getElementById('language');
  const translateButton = document.getElementById('translate');

  translateButton.addEventListener('click', async () => {
      const text = inputText.value;
      const targetLang = languageSelect.value;

      if (!text) {
          alert('Please enter text to translate');
          return;
      }

      try {
          const response = await fetch('/.netlify/functions/translate', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-Access-Password': prompt('Enter access password:')
              },
              body: JSON.stringify({ text, targetLang })
          });

          if (!response.ok) {
              throw new Error('Translation failed');
          }

          const data = await response.json();
          outputText.value = data.translatedText;
      } catch (error) {
          console.error('Error:', error);
          alert('An error occurred during translation');
      }
  });
});