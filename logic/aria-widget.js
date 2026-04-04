(function () {
    const API_URL = '/api/chat';
    let messages = [];
    let isTyping = false;
  
    // --- Build UI ---
    const bubble = document.createElement('div');
    bubble.id = 'aria-bubble';
    bubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  
    const panel = document.createElement('div');
    panel.id = 'aria-panel';
    panel.innerHTML = `
      <div id="aria-header">
        <div id="aria-avatar">A</div>
        <div id="aria-header-text">
          <div id="aria-header-name">Aria</div>
          <div id="aria-header-status"><span></span> Nuvaro Assistant</div>
        </div>
        <button id="aria-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div id="aria-messages"></div>
      <div id="aria-footer">
        <textarea id="aria-input" placeholder="Ask me anything..." rows="1"></textarea>
        <button id="aria-send">
          <svg viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div id="aria-branding">Powered by Nuvaro AI</div>
    `;
  
    document.body.appendChild(bubble);
    document.body.appendChild(panel);
  
    const messagesEl = document.getElementById('aria-messages');
    const inputEl = document.getElementById('aria-input');
  
    // --- Toggle panel ---
    let isOpen = false;
    function togglePanel() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      if (isOpen && messages.length === 0) {
        setTimeout(() => addAriaMessage("Hi! I'm Aria, Nuvaro's assistant. Are you looking to build something, need training for your team, or just exploring what we do?"), 400);
      }
      if (isOpen) inputEl.focus();
    }
  
    bubble.addEventListener('click', togglePanel);
    document.getElementById('aria-close').addEventListener('click', togglePanel);
  
    // --- Add messages ---
    function addUserMessage(text) {
      messages.push({ role: 'user', content: text });
      const el = document.createElement('div');
      el.className = 'aria-msg user';
      el.textContent = text;
      messagesEl.appendChild(el);
      scrollBottom();
    }
  
    function addAriaMessage(text) {
      messages.push({ role: 'assistant', content: text });
      const el = document.createElement('div');
      el.className = 'aria-msg aria';
      el.textContent = text;
      messagesEl.appendChild(el);
      scrollBottom();
    }
  
    function showTyping() {
      const el = document.createElement('div');
      el.className = 'aria-typing';
      el.id = 'aria-typing-indicator';
      el.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(el);
      scrollBottom();
    }
  
    function hideTyping() {
      const el = document.getElementById('aria-typing-indicator');
      if (el) el.remove();
    }
  
    function scrollBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  
    // --- Stream response ---
    async function sendMessage(text) {
      if (isTyping || !text.trim()) return;
      isTyping = true;
  
      addUserMessage(text);
      showTyping();
  
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });
  
        hideTyping();
  
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let ariaText = '';
        let ariaEl = null;
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.trim());
  
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;
  
            try {
              const parsed = JSON.parse(data);
  
              if (parsed.text) {
                if (!ariaEl) {
                  ariaEl = document.createElement('div');
                  ariaEl.className = 'aria-msg aria';
                  messagesEl.appendChild(ariaEl);
                }
                ariaText += parsed.text;
                ariaEl.textContent = ariaText;
                scrollBottom();
              }
  
              if (parsed.leadCaptured) {
                console.log('Lead captured and emailed to Sunny');
              }
            } catch {}
          }
        }
  
        if (ariaText) {
          messages.push({ role: 'assistant', content: ariaText });
        }
  
      } catch (err) {
        hideTyping();
        const el = document.createElement('div');
        el.className = 'aria-msg aria';
        el.textContent = "Sorry, I'm having trouble connecting. Please email contact@nuvaro.ca directly.";
        messagesEl.appendChild(el);
        scrollBottom();
      }
  
      isTyping = false;
    }
  
    // --- Input handlers ---
    document.getElementById('aria-send').addEventListener('click', () => {
      const text = inputEl.value.trim();
      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendMessage(text);
    });
  
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = inputEl.value.trim();
        inputEl.value = '';
        inputEl.style.height = 'auto';
        sendMessage(text);
      }
    });
  
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = inputEl.scrollHeight + 'px';
    });
  })();