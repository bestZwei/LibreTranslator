export async function onRequestPost(context) {
    const { request, env } = context;
    
    // 验证访问密码
    const accessPassword = request.headers.get('X-Access-Password');
    if (accessPassword !== env.ACCESS_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Invalid access password' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    try {
      const { text, targetLang } = await request.json();
  
      console.log('Request payload:', { text, targetLang }); // 日志
  
      const response = await fetch(env.DEEPLX_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          source_lang: 'auto',
          target_lang: targetLang,
        }),
      });
  
      console.log('DeepLX API response status:', response.status); // 日志
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepLX API error:', response.status, errorText); // 错误日志
        throw new Error(`DeepLX API error: ${response.status}, ${errorText}`);
      }
  
      const data = await response.json();
      console.log('DeepLX API response data:', data); // 日志
  
      return new Response(JSON.stringify({ translatedText: data.data }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Translation error:', error); // 错误日志
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }