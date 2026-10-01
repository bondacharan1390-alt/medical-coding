(() => {
    if (document.getElementById('medicode-chat')) return;

    const root = document.createElement('section');
    root.id = 'medicode-chat';
    root.innerHTML = `
        <button class="mc-chat-toggle" type="button" aria-label="Open MedCode chat" aria-expanded="false" aria-controls="mc-chat-panel">
            <i class="fas fa-comment-medical" aria-hidden="true"></i>
        </button>
        <div class="mc-chat-panel" id="mc-chat-panel" role="dialog" aria-modal="false" aria-labelledby="mc-chat-title" hidden>
            <header class="mc-chat-header">
                <div class="mc-chat-title-wrap">
                    <span class="mc-chat-mark" aria-hidden="true"><i class="fas fa-heart-pulse"></i></span>
                    <div><h2 id="mc-chat-title">MedCode Assistant</h2><p>General health information</p></div>
                </div>
                <button class="mc-chat-close" type="button" aria-label="Close chat"><i class="fas fa-times" aria-hidden="true"></i></button>
            </header>
            <div class="mc-chat-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
            <p class="mc-chat-disclaimer">Educational information only, not a diagnosis or a substitute for care. Please don’t share identifying or private health information.</p>
            <form class="mc-chat-form">
                <label class="mc-chat-sr-only" for="mc-chat-input">Ask a medical or MedCode question</label>
                <input id="mc-chat-input" name="message" type="text" maxlength="1200" autocomplete="off" placeholder="Ask a health question..." required>
                <button type="submit" aria-label="Send message"><i class="fas fa-arrow-up" aria-hidden="true"></i></button>
            </form>
        </div>`;
    document.body.append(root);

    const toggle = root.querySelector('.mc-chat-toggle');
    const panel = root.querySelector('.mc-chat-panel');
    const close = root.querySelector('.mc-chat-close');
    const messages = root.querySelector('.mc-chat-messages');
    const form = root.querySelector('.mc-chat-form');
    const input = root.querySelector('#mc-chat-input');
    const send = form.querySelector('button[type="submit"]');
    const history = [];

    const appendMessage = (role, text) => {
        const message = document.createElement('div');
        message.className = `mc-chat-message mc-chat-message-${role}`;
        message.textContent = text;
        messages.append(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
    };

    const setOpen = (open) => {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close MedCode chat' : 'Open MedCode chat');
        if (open) input.focus();
    };

    appendMessage('assistant', 'Hello! I can explain general health topics and MedCode services. I can’t diagnose or recommend personal treatment.');
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false);
            toggle.focus();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message || send.disabled) return;

        appendMessage('user', message);
        input.value = '';
        input.disabled = true;
        send.disabled = true;
        const pending = appendMessage('assistant', 'Thinking...');
        pending.classList.add('mc-chat-pending');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: history.slice(-8) })
            });
            const data = await response.json();
            pending.remove();
            if (!response.ok) throw new Error(data.error || 'The assistant could not reply right now.');
            appendMessage('assistant', data.reply);
            history.push({ role: 'user', text: message }, { role: 'assistant', text: data.reply });
        } catch (error) {
            pending.remove();
            const errorMessage = appendMessage('assistant', error.message || 'The assistant could not reply right now. Please try again.');
            errorMessage.setAttribute('role', 'alert');
        } finally {
            input.disabled = false;
            send.disabled = false;
            input.focus();
        }
    });
})();
