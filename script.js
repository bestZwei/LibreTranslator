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
          const response = await fetch('/translate', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text, targetLang })
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }

          const data = await response.json();
          outputText.value = data.translatedText;
      } catch (error) {
          console.error('Error details:', error);
          alert(`An error occurred during translation: ${error.message}`);
      }
  });
});