<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Telegram Agent Hub</title>
    <!-- Telegram Web Apps SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <!-- Библиотека генерации QR -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        :root {
            --bg-color: var(--tg-theme-bg-color, #0f172a);
            --card-bg: var(--tg-theme-secondary-bg-color, #1e293b);
            --text-color: var(--tg-theme-text-color, #f8fafc);
            --hint-color: var(--tg-theme-hint-color, #94a3b8);
            --primary-color: var(--tg-theme-button-color, #3b82f6);
            --primary-text: var(--tg-theme-button-text-color, #ffffff);
            --border-color: #334155;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background-color: var(--bg-color); color: var(--text-color); padding: 12px; padding-bottom: 80px; }
        .screen { display: none; flex-direction: column; gap: 14px; max-width: 500px; margin: 0 auto; }
        .screen.active { display: flex; }
        
        /* Шапка ЛК */
        .agent-header { background: var(--card-bg); border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-color); }
        .agent-profile { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 44px; height: 44px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; color: #fff; }
        .agent-name { font-size: 16px; font-weight: 700; }
        .agent-id { font-size: 12px; color: var(--hint-color); }
        
        /* Сетка метрик */
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .metric-card { background: var(--card-bg); padding: 10px; border-radius: 10px; text-align: center; border: 1px solid var(--border-color); }
        .metric-val { font-size: 16px; font-weight: 800; color: var(--text-color); margin-bottom: 2px; }
        .metric-lbl { font-size: 11px; color: var(--hint-color); }

        /* Быстрые действия */
        .section-title { font-size: 15px; font-weight: 700; margin-top: 4px; color: var(--hint-color); text-transform: uppercase; letter-spacing: 0.5px; }
        .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .action-btn { background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-color); padding: 14px; border-radius: 12px; font-weight: 600; font-size: 13px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: 0.2s; }
        .action-btn:active { opacity: 0.7; }
        .action-btn svg { width: 20px; height: 20px; fill: var(--primary-color); }

        /* Карточки и списки */
        .card { background: var(--card-bg); border-radius: 12px; padding: 14px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-label { font-size: 12px; color: var(--hint-color); font-weight: 600; }
        .form-input, .form-select { width: 100%; padding: 10px 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-color); font-size: 14px; }
        
        .btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; background: var(--primary-color); color: var(--primary-text); text-align: center; }
        .btn-secondary { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); }

        /* Лиды список */
        .lead-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
        .lead-item:last-child { border-bottom: none; }
        .status-badge { font-size: 10px; padding: 3px 6px; border-radius: 6px; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: rgba(234, 179, 8, 0.2); color: #eab308; }
        .status-converted { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

        /* Навигация снизу */
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--card-bg); border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; padding: 10px; z-index: 100; }
        .nav-item { background: none; border: none; color: var(--hint-color); font-size: 11px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; }
        .nav-item.active { color: var(--primary-color); }
        .nav-item svg { width: 20px; height: 20px; fill: currentColor; }

        .link-box { background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; color: #60a5fa; border: 1px dashed var(--border-color); }
        .qr-container { display: flex; justify-content: center; background: #fff; padding: 12px; border-radius: 10px; width: fit-content; margin: 0 auto; }
    </style>
</head>
<body>

    <!-- ЭКРАН 1: ГЛАВНЫЙ КАБИНЕТ АГЕНТА -->
    <div id="screen-main" class="screen active">
        <header class="agent-header">
            <div class="agent-profile">
                <div class="avatar" id="agent-initials">П</div>
                <div>
                    <div class="agent-name" id="agent-fullname">Павел И.</div>
                    <div class="agent-id" id="agent-tg-id">ID: ---</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 11px; color: var(--hint-color);">Статус</div>
                <div style="font-size: 13px; font-weight: 700; color: #22c55e;">Лучший агент</div>
            </div>
        </header>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-val" id="stat-leads-count">12</div>
                <div class="metric-lbl">Всего лидов</div>
            </div>
            <div class="metric-card">
                <div class="metric-val" id="stat-earned">7,500 ₴</div>
                <div class="metric-lbl">Заработано</div>
            </div>
            <div class="metric-card">
                <div class="metric-val">15%</div>
                <div class="metric-lbl">Комиссия</div>
            </div>
        </div>

        <div class="section-title">Быстрые действия</div>
        <div class="actions-grid">
            <button class="action-btn" onclick="switchScreen('screen-add-lead')">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Добавить лида
            </button>
            <button class="action-btn" onclick="switchScreen('screen-offer')">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                Мой оффер (Массаж)
            </button>
        </div>

        <div class="section-title">Последние лиды</div>
        <div class="card" id="leads-list-container">
            <!-- Динамический список лидов -->
        </div>
    </div>

    <!-- ЭКРАН 2: ДОБАВЛЕНИЕ ЛИДА -->
    <div id="screen-add-lead" class="screen">
        <div class="section-title">Новый лид</div>
        <div class="card">
            <div class="form-group">
                <label class="form-label">Имя клиента</label>
                <input type="text" id="lead-name" class="form-input" placeholder="Например: Иван">
            </div>
            <div class="form-group">
                <label class="form-label">Телефон / Контакт</label>
                <input type="text" id="lead-phone" class="form-input" placeholder="+380XXXXXXXXX">
            </div>
            <div class="form-group">
                <label class="form-label">Услуга</label>
                <select id="lead-service" class="form-select">
                    <option value="Массаж на дому (Базовый)">Массаж на дому (Базовый)</option>
                    <option value="Массаж на дому (Премиум)">Массаж на дому (Премиум)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Комментарий</label>
                <input type="text" id="lead-comment" class="form-input" placeholder="Удобное время или пожелания">
            </div>
            <button class="btn" onclick="submitNewLead()">Добавить в систему</button>
            <button class="btn btn-secondary" onclick="switchScreen('screen-main')">Назад</button>
        </div>
    </div>

    <!-- ЭКРАН 3: ОФФЕР И ГЕНЕРАЦИЯ ССЫЛКИ / QR -->
    <div id="screen-offer" class="screen">
        <div class="section-title">Оффер проекта</div>
        <div class="card">
            <div style="font-size: 18px; font-weight: 800;">Частный Массажный Салон (Дніпро)</div>
            <div style="font-size: 13px; color: var(--hint-color);">Премиальный массаж, выезд на дом, фиксированная комиссия 15% с каждого подтвержденного заказа.</div>
            <hr style="border: 0; border-top: 1px solid var(--border-color);">
            <div class="form-group">
                <label class="form-label">Ваша уникальная реферальная ссылка:</label>
                <div class="link-box" id="agent-ref-link">Загрузка...</div>
            </div>
            <button class="btn" onclick="copyRefLink()">Скопировать ссылку</button>
            
            <div style="text-align: center; margin-top: 6px; font-size: 13px; font-weight: 600; color: var(--hint-color);">QR-код для визиток и флаеров</div>
            <div class="qr-container" id="qrcode"></div>
            
            <button class="btn btn-secondary" onclick="switchScreen('screen-main')">На главную</button>
        </div>
    </div>

    <!-- НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ -->
    <nav class="bottom-nav">
        <button class="nav-item active" id="nav-btn-main" onclick="switchScreen('screen-main')">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Главная
        </button>
        <button class="nav-item" id="nav-btn-add" onclick="switchScreen('screen-add-lead')">
            <svg viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Лид
        </button>
        <button class="nav-item" id="nav-btn-offer" onclick="switchScreen('screen-offer')">
            <svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            Оффер
        </button>
    </nav>

    <script>
        // Инициализация Telegram WebApp
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
        }

        // Достаем реальный Telegram ID
        const agentId = tg?.initDataUnsafe?.user?.id || '101';
        const agentName = tg?.initDataUnsafe?.user?.first_name || 'Павел И.';
        
        // Рендерим данные в шапку
        document.getElementById('agent-fullname').innerText = agentName;
        document.getElementById('agent-tg-id').innerText = `ID: ${agentId}`;
        document.getElementById('agent-initials').innerText = agentName.charAt(0);

        // Формируем жесткую реферальную ссылку на массажного бота с реальным ID
        const refLink = `https://t.me/TestMassageBot?start=${agentId}`;
        document.getElementById('agent-ref-link').innerText = refLink;

        // Генерируем QR-код
        new QRCode(document.getElementById("qrcode"), {
            text: refLink,
            width: 160,
            height: 160,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // База лидов (храним локально в памяти устройства)
        let leads = JSON.parse(localStorage.getItem('agent_leads') || JSON.stringify([
            { name: "Павел И.", service: "Массаж на дому", date: "27.09.2026", status: "Pending" },
            { name: "Анна С.", service: "Массаж на дому", date: "26.09.2026", status: "Converted" }
        ]));

        function renderLeads() {
            const container = document.getElementById('leads-list-container');
            container.innerHTML = leads.map(l => `
                <div class="lead-item">
                    <div>
                        <div style="font-weight: 700;">${l.name}</div>
                        <div style="font-size: 11px; color: var(--hint-color);">${l.service} • ${l.date}</div>
                    </div>
                    <div>
                        <span class="status-badge ${l.status === 'Pending' ? 'status-pending' : 'status-converted'}">
                            ${l.status === 'Pending' ? 'В обработке' : 'Оплачено'}
                        </span>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('stat-leads-count').innerText = leads.length;
        }

        function submitNewLead() {
            const name = document.getElementById('lead-name').value.trim();
            if (!name) {
                alert('Введите имя клиента!');
                return;
            }
            
            const newLead = {
                name: name,
                service: document.getElementById('lead-service').value,
                date: new Date().toLocaleDateString(),
                status: "Pending"
            };

            leads.unshift(newLead);
            localStorage.setItem('agent_leads', JSON.stringify(leads));
            renderLeads();

            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            alert('Лид успешно добавлен!');
            
            // Очищаем форму и возвращаем на главный экран
            document.getElementById('lead-name').value = '';
            document.getElementById('lead-phone').value = '';
            switchScreen('screen-main');
        }

        function copyRefLink() {
            navigator.clipboard.writeText(refLink).then(() => {
                if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
                alert('Реферальная ссылка скопирована!');
            });
        }

        function switchScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

            document.getElementById(screenId).classList.add('active');
            
            if (screenId === 'screen-main') document.getElementById('nav-btn-main').classList.add('active');
            if (screenId === 'screen-add-lead') document.getElementById('nav-btn-add').classList.add('active');
            if (screenId === 'screen-offer') document.getElementById('nav-btn-offer').classList.add('active');

            window.scrollTo(0, 0);
        }

        // Первичный рендер лидов
        renderLeads();
    </script>
</body>
</html>