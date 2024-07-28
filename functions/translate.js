export async function onRequestPost(context) {
    const { request, env } = context;
    
    // 解析请求体
    const { text, targetLang } = await request.json();
  
    // 调用DeepLX API
    try {
      const response = await fetch(env.DEEPLX_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPLX_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          text: text,
          source_lang: 'auto',
          target_lang: targetLang,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepLX API error: ${response.status}, ${errorText}`);
      }
  
      const data = await response.json();
  
      if (data.code !== 200) {
        throw new Error(`DeepLX API error: ${data.code}`);
      }
  
      return new Response(JSON.stringify({ translatedText: data.data }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Translation error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }