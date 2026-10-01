const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
const port = Number(process.env.PORT) || 3000;
const dataDirectory = path.join(root, 'data');
const messagesFile = path.join(dataDirectory, 'messages.json');
const demoAccount = { email: 'bonda.charan@gmail.com', password: 'medicode123', name: 'Bonda Charan' };
const chatRateLimits = new Map();
const chatSystemInstruction = [
    'You are MedCode’s educational health information assistant. Answer general medical questions clearly and cautiously, and help explain MedCode services.',
    'Do not diagnose, prescribe, recommend personal medication doses, or tell users to start or stop treatment. Explain that you cannot assess an individual case and encourage a qualified healthcare professional for personal advice.',
    'For possible emergencies or severe symptoms, tell the user to contact local emergency services immediately. Do not delay urgent care with follow-up questions.',
    'Do not ask users to share identifying or sensitive medical-record information. Use the verified MedCode details below for company questions, and do not invent missing information. If asked about unrelated topics, briefly redirect to health information or MedCode services.'
].join(' ');
const chatKnowledge = [
    'MedCode services listed on services.html: medical coding using ICD-10, CPT, and HCPCS; medical billing; revenue cycle management; coding audits; insurance verification; and claims processing.',
    'Training programs listed on training.html: Certified Professional Coder (CPC) training covering ICD-10-CM, CPT, HCPCS, medical terminology, and anatomy; Medical Terminology and Anatomy; and Advanced Outpatient/Inpatient Coding. Enrollment is available through the Contact page.',
    'Medical Code Translations supports preparing and translating medical-code summaries and patient files for hospital-to-hospital transfers, including transfer notes, histories, treatment plans, consent forms, lab reports, and imaging summaries.',
    'The Contact page lists the office in Visakhapatnam, Andhra Pradesh, India, and working hours Monday through Saturday, 9:00 AM to 6:00 PM. Direct contact details vary across pages, so direct visitors to the Contact page form instead of guessing.'
].join('\n');

function ensureStorage() {
    fs.mkdirSync(dataDirectory, { recursive: true });
    if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, '[]');
}

function sendJson(response, status, body) {
    response.writeHead(status, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify(body));
}

function readBody(request, maxBytes = 64 * 1024) {
    return new Promise((resolve, reject) => {
        let body = '';
        let byteLength = 0;
        request.on('data', chunk => {
            byteLength += chunk.length;
            if (byteLength > maxBytes) {
                reject(new Error('Request body too large.'));
                request.destroy();
                return;
            }
            body += chunk;
        });
        request.on('end', () => {
            try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON body.')); }
        });
        request.on('error', reject);
    });
}

function isChatRateLimited(request) {
    const now = Date.now();
    for (const [address, window] of chatRateLimits) {
        if (window.resetAt <= now) chatRateLimits.delete(address);
    }

    const address = request.socket.remoteAddress || 'unknown';
    const window = chatRateLimits.get(address) || { count: 0, resetAt: now + 60_000 };
    window.count += 1;
    chatRateLimits.set(address, window);
    return window.count > 12;
}

function offlineChatReply(message) {
    if (/\b(services?|what do you (do|offer)|medical coding|medical billing|revenue cycle|coding audit|insurance verification|claims processing)\b/i.test(message)) {
        return 'MedCode lists medical coding (ICD-10, CPT, and HCPCS), medical billing, revenue cycle management, coding audits, insurance verification, and claims processing. See the Services page for details.';
    }
    if (/\b(training|courses?|cpc|enroll|classes?)\b/i.test(message)) {
        return 'MedCode lists CPC training (ICD-10-CM, CPT, HCPCS, terminology, and anatomy), Medical Terminology and Anatomy, and Advanced Outpatient/Inpatient Coding. Enrollment is available through the Contact page.';
    }
    if (/\b(translat(?:e|ion|ions)|hospital[- ]to[- ]hospital|file transfer)\b/i.test(message)) {
        return 'MedCode’s Medical Code Translations service helps prepare and translate medical summaries and patient files for hospital-to-hospital transfers, including transfer notes, histories, treatment plans, consent forms, lab reports, and imaging summaries.';
    }
    if (/\b(contact|phone|email|address|location|office|working hours|hours)\b/i.test(message)) {
        return 'The Contact page lists MedCode’s office in Visakhapatnam, Andhra Pradesh, India, and working hours Monday through Saturday, 9:00 AM to 6:00 PM. Please use the Contact page form for current contact details.';
    }
    if (/\b(chest pain|chest pressure|pain in (my )?chest)\b/i.test(message)) {
        return 'Chest pain can be urgent. If you have chest pain or pressure, especially with shortness of breath, sweating, nausea, faintness, or pain spreading to your arm or jaw, contact local emergency services now.';
    }
    if (/\b(fever|feaver|febrile|temperature)\b/i.test(message)) {
        return 'For a mild fever, rest and drink fluids; medicine may not be needed if you feel comfortable. For an adult who wants symptom relief, paracetamol (acetaminophen) is commonly used; follow the package directions and do not combine it with other products containing the same ingredient. Ask a pharmacist first if you are pregnant, have liver or kidney disease, stomach ulcers, take blood thinners, or use other medicines. Do not give aspirin to children, and ask a pharmacist or pediatrician about medicine for a child. Seek urgent care for trouble breathing, confusion, a stiff neck, severe dehydration, or rapidly worsening symptoms. Contact a clinician if the fever is very high or lasts more than 3 days.';
    }
    if (/\b(body aches?|body pains?|muscle aches?|muscle pain|aches all over|pain all over|whole body hurts)\b/i.test(message)) {
        return 'For mild, generalized body aches, rest, drink fluids, and consider whether recent exercise or an illness could be contributing. An adult may use paracetamol (acetaminophen) according to the package directions if normally safe for them; do not combine products containing the same ingredient. Ask a pharmacist or clinician first if pregnant, taking other medicines, or living with a chronic condition. Seek urgent care for chest pain, trouble breathing, fainting, confusion, severe weakness, or dark urine. Contact a clinician if pain is severe, worsening, or not improving.';
    }
    return null;
}

function serveFile(request, response) {
    const requestedPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(root + path.sep)) return sendJson(response, 403, { error: 'Forbidden.' });
    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) return sendJson(response, 404, { error: 'Page not found.' });
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.avif': 'image/avif' };
        response.writeHead(200, { 'Content-Type': `${types[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
        fs.createReadStream(filePath).pipe(response);
    });
}

ensureStorage();
const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === 'OPTIONS') {
        response.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        });
        return response.end();
    }
    if (request.method === 'GET' && url.pathname === '/api/health') return sendJson(response, 200, { ok: true });

    if (request.method === 'POST' && url.pathname === '/api/chat') {
        if (isChatRateLimited(request)) {
            return sendJson(response, 429, { error: 'Chat limit reached. Please wait a minute before trying again.' });
        }

        try {
            const body = await readBody(request, 12 * 1024);
            const message = String(body.message || '').trim();
            if (!message || message.length > 1200) {
                return sendJson(response, 400, { error: 'Please enter a message under 1,200 characters.' });
            }
            if (!process.env.GEMINI_API_KEY) {
                const reply = offlineChatReply(message);
                if (reply) return sendJson(response, 200, { reply });
                return sendJson(response, 503, { error: 'Live answers need a Gemini API key. Add GEMINI_API_KEY to the local .env file and restart the server.' });
            }

            const history = [];
            for (const entry of (Array.isArray(body.history) ? body.history : []).slice(-8)) {
                const role = entry?.role === 'assistant' ? 'model' : entry?.role === 'user' ? 'user' : null;
                const text = String(entry?.text || '').trim().slice(0, 1200);
                if (!role || !text || (history.length && history[history.length - 1].role === role)) continue;
                if (!history.length && role !== 'user') continue;
                history.push({ role, parts: [{ text }] });
            }

            const model = encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-2.5-flash');
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
            const geminiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: `${chatSystemInstruction}\n\nVerified MedCode website details:\n${chatKnowledge}` }] },
                    contents: [...history, { role: 'user', parts: [{ text: message }] }],
                    generationConfig: { temperature: 0.35, maxOutputTokens: 700 }
                }),
                signal: AbortSignal.timeout(20_000)
            });
            const result = await geminiResponse.json();
            if (!geminiResponse.ok) {
                console.error(`Gemini chat request failed with status ${geminiResponse.status}.`);
                return sendJson(response, 502, { error: 'The assistant could not reply right now. Please try again shortly.' });
            }

            const reply = result.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
            if (!reply) return sendJson(response, 502, { error: 'The assistant could not reply right now. Please try again shortly.' });
            return sendJson(response, 200, { reply });
        } catch (error) {
            if (error.message === 'Invalid JSON body.') return sendJson(response, 400, { error: error.message });
            const status = error.name === 'TimeoutError' ? 504 : 500;
            return sendJson(response, status, { error: 'The assistant could not reply right now. Please try again shortly.' });
        }
    }

    if (request.method === 'POST' && url.pathname === '/api/login') {
        try {
            const body = await readBody(request);
            const email = String(body.email || '').trim().toLowerCase();
            const password = String(body.password || '');
            if (email !== demoAccount.email || password !== demoAccount.password) {
                return sendJson(response, 401, { error: 'Invalid email or password.' });
            }
            return sendJson(response, 200, {
                message: 'Login successful.',
                token: crypto.randomBytes(24).toString('hex'),
                user: { name: demoAccount.name, email: demoAccount.email }
            });
        } catch (error) {
            return sendJson(response, 400, { error: error.message });
        }
    }

    if (request.method === 'POST' && url.pathname === '/api/contact') {
        try {
            const body = await readBody(request);
            const message = {
                id: crypto.randomUUID(),
                name: String(body.name || '').trim(),
                email: String(body.email || '').trim(),
                phone: String(body.phone || '').trim(),
                subject: String(body.subject || '').trim(),
                message: String(body.message || '').trim(),
                createdAt: new Date().toISOString()
            };
            if (!message.name || !message.email || !message.phone || !message.message) {
                return sendJson(response, 400, { error: 'Name, email, phone, and message are required.' });
            }
            const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
            messages.push(message);
            fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
            return sendJson(response, 201, { message: 'Thank you. Your message has been sent successfully.' });
        } catch (error) {
            return sendJson(response, 400, { error: error.message });
        }
    }

    if (request.method === 'GET') return serveFile(request, response);
    sendJson(response, 404, { error: 'Endpoint not found.' });
});

server.listen(port, () => console.log(`MedCode server running at http://localhost:${port}`));