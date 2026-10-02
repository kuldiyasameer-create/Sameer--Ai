SAMEER AI — REAL CHAT BACKEND (STARTER)
========================================

यह संस्करण पहले वाले UI को एक सुरक्षित server-side AI route से जोड़ता है।
AI provider: OpenRouter API; default model router: openrouter/free.
मॉडल, free quota और rate limits बदल सकते हैं। पूरी तरह मुफ्त और हमेशा उपलब्ध होने की गारंटी नहीं है।

महत्वपूर्ण:
- API key कभी भी index.html या app.js में न डालें।
- API key केवल hosting dashboard के server-side Environment Variables में रखें।
- इस starter में 10 requests/IP/minute का सरल limiter है; production में authentication, abuse prevention और अधिक मजबूत rate limits की जरूरत होगी।
- कोई database या chat history storage नहीं है; chat history सिर्फ खुले browser tab की memory में रहती है।
- AI जवाब गलत हो सकते हैं; महत्वपूर्ण जानकारी जाँचें।

DEPLOYMENT (फोन से भी किया जा सकता है)
1. इस ZIP को extract करें।
2. फाइलें GitHub repository में upload करें (private repo बेहतर है)।
3. Render जैसी hosting पर New Web Service बनाएँ और repository connect करें।
4. Build command: npm install
5. Start command: npm start
6. Environment Variables में जोड़ें:
   OPENROUTER_API_KEY = अपनी निजी API key
   (वैकल्पिक) AI_MODEL = openrouter/free
   (वैकल्पिक) SITE_URL = deployed website URL
7. Deploy पूरा होने पर site URL खोलें और AI Chat में सवाल पूछें।

API KEY:
- OpenRouter पर अपना account बनाकर dashboard से key बनाएँ।
- Key को chat में, GitHub code में, screenshot में या frontend में साझा न करें।
- यदि key सार्वजनिक हो जाए, provider dashboard से उसे revoke/rotate करें।
- Free model router की availability/limits बदल सकती हैं; provider dashboard की current terms देखें।

LOCAL DEVELOPMENT:
- Node.js 20+ आवश्यक है।
- npm install
- OPENROUTER_API_KEY environment variable सेट करें
- npm start
- http://localhost:3000 खोलें

SECURITY / PRODUCTION TODO:
- User authentication और per-account quota जोड़ें।
- HTTPS अनिवार्य रखें।
- Privacy policy, data retention/deletion और abuse reporting लागू करें।
- API usage/billing limits provider dashboard में जाँचें।
- Logs में prompts, API keys या निजी user content न लिखें।
- Free hosting idle होने पर sleep हो सकती है और पहली request धीमी हो सकती है।
