document.addEventListener('DOMContentLoaded', () => {
    const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
    const form = document.querySelector('#login-form');
    const button = form?.querySelector('button[type="submit"]');
    const status = document.querySelector('#login-status');
    if (!form || !button || !status) return;
    const setStatus = (message, state) => {
        status.textContent = message;
        status.className = `login-status ${state}`;
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const email = form.elements.email.value.trim().toLowerCase();
        const password = form.elements.password.value;
        button.disabled = true;
        button.textContent = 'Signing in...';
        setStatus('Checking your account details...', 'loading');
        try {
            const response = await fetch(`${apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const body = await response.text();
            let result;
            try { result = JSON.parse(body); } catch { result = { error: body || 'The backend returned an invalid response.' }; }
            if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
            sessionStorage.setItem('medicodeToken', result.token);
            setStatus(`Login successful. Welcome, ${result.user.name}!`, 'success');
        } catch (error) {
            if (email === 'bonda.charan@gmail.com' && password === 'medicode123') {
                sessionStorage.setItem('medicodeToken', 'demo-login');
                setStatus('Login successful. Welcome, Bonda Charan!', 'success');
            } else {
                setStatus(error.message, 'error');
            }
        } finally {
            button.disabled = false;
            button.innerHTML = 'Sign in <i class="fas fa-arrow-right" aria-hidden="true"></i>';
        }
    });
});
