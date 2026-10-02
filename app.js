const $ = (id) => document.getElementById(id);
const titles = {chat:"AI Chat",photo:"Photo Studio",three:"3D Text Studio",website:"Website Builder",voice:"Voice Assistant"};
function switchTab(tab){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("show"));
  $(tab+"Panel").classList.add("show");
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.tab===tab));
  $("topTitle").textContent=titles[tab]||"Sameer AI";
  $("sidebar").classList.remove("open");
}
document.querySelector(".sidebar").id="sidebar";
document.querySelectorAll(".nav").forEach(n=>n.addEventListener("click",()=>switchTab(n.dataset.tab)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("newChat").addEventListener("click",()=>{$("messages").innerHTML="";chatHistory=[];switchTab("chat");$("chatInput").focus()});

let chatHistory = [];
function addMessage(text,kind){
  const el=document.createElement("div");el.className="message "+kind;el.textContent=text;
  $("messages").appendChild(el);el.scrollIntoView({behavior:"smooth",block:"nearest"});
}
async function sendChat(value){
  const q=(value||"").trim();if(!q)return;
  addMessage(q,"user");$("chatInput").value="";
  const sendButton=$("chatForm").querySelector('button[type="submit"]');
  sendButton.disabled=true;
  const wait=document.createElement("div");wait.className="message assistant";wait.textContent="जवाब तैयार हो रहा है…";$("messages").appendChild(wait);
  chatHistory.push({role:"user",content:q});
  try{
    const response=await fetch("/api/chat",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:chatHistory.slice(-12)})
    });
    const data=await response.json();
    wait.remove();
    if(!response.ok)throw new Error(data.error||"AI सेवा से जवाब नहीं मिला।");
    const answer=String(data.reply||"खाली जवाब मिला।");
    chatHistory.push({role:"assistant",content:answer});
    addMessage(answer,"assistant");
  }catch(err){
    wait.remove();
    const msg=err.message==="Failed to fetch"
      ?"सर्वर से संपर्क नहीं हो पाया। जाँचें कि Sameer AI वेबसाइट और /api/chat वाला backend एक ही deployed service पर चल रहे हैं।"
      :err.message;
    addMessage("समस्या: "+msg,"assistant");
    chatHistory.pop();
  }finally{sendButton.disabled=false;$("chatInput").focus()}
}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();sendChat($("chatInput").value)});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>sendChat(b.dataset.prompt)));
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat($("chatInput").value)}});

$("photoInput").addEventListener("change",e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  if(!file.type.startsWith("image/")){alert("कृपया image file चुनें।");return}
  const url=URL.createObjectURL(file);$("photoPreview").src=url;$("photoPreviewWrap").classList.remove("hidden");
});
$("clearPhoto").addEventListener("click",()=>{$("photoPreview").removeAttribute("src");$("photoPreviewWrap").classList.add("hidden");$("photoInput").value=""});

$("threeText").addEventListener("input",()=>{$("threeOutput").textContent=$("threeText").value||"3D TEXT"});
$("makeSite").addEventListener("click",()=>{
  const idea=$("sitePrompt").value.trim()||"My Portfolio";
  const safe=idea.replace(/[<>&"]/g,"").slice(0,100);
  const code=`<!doctype html>
<html lang="hi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safe}</title>
<style>body{font-family:Arial,sans-serif;margin:0;background:#f3f4ff;color:#20233a}main{max-width:850px;margin:12vh auto;padding:40px 24px;text-align:center}a,button{background:#6d4aff;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;border:0}</style></head>
<body><main><h1>${safe}</h1><p>यह आपकी वेबसाइट का शुरुआती demo template है।</p><a href="#about">और जानें</a><section id="about"><h2>हमारे बारे में</h2><p>यहाँ अपनी जानकारी जोड़ें।</p></section></main></body></html>`;
  $("siteCode").textContent=code;$("siteCode").classList.remove("hidden");$("copyCode").classList.remove("hidden");
});
$("copyCode").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("siteCode").textContent);$("copyCode").textContent="कॉपी हो गया ✓";setTimeout(()=>$("copyCode").textContent="कोड कॉपी करें",1400)}
  catch(e){alert("Copy सुविधा उपलब्ध नहीं है। कोड को दबाकर चुनें और कॉपी करें।")}
});

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
function startVoice(){
  if(!SpeechRecognition){$("voiceStatus").textContent="इस browser में speech recognition उपलब्ध नहीं है। Chrome में कोशिश करें या सवाल टाइप करें।";return}
  const rec=new SpeechRecognition();rec.lang="hi-IN";rec.interimResults=false;rec.maxAlternatives=1;
  $("voiceStatus").textContent="सुन रहा हूँ… बोलना शुरू करें।";
  rec.onresult=e=>{const t=e.results[0][0].transcript;$("chatInput").value=t;$("voiceStatus").textContent="सुना गया: "+t;switchTab("chat");sendChat(t)};
  rec.onerror=()=>{$("voiceStatus").textContent="आवाज़ पहचान नहीं हो पाई। Microphone permission जाँचें।"};
  rec.onend=()=>{if($("voiceStatus").textContent==="सुन रहा हूँ… बोलना शुरू करें।")$("voiceStatus").textContent="वॉइस इनपुट समाप्त हुआ।"};
  rec.start();
}
$("micBtn").addEventListener("click",startVoice);
$("startVoice").addEventListener("click",startVoice);
