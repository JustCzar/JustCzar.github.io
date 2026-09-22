/* ============================================================================
   Алексей & Стелла — 24.10.2026
   ========================================================================== */
'use strict';

/* ─── НАСТРОЙКИ ГУГЛ-ФОРМЫ ──────────────────────────────────────────────────
   !!! ЗАПОЛНИТЬ ПЕРЕД ПУБЛИКАЦИЕЙ !!!

   Где взять значения: открыть форму → «Отправить» → ссылка,
   либо «Получить заранее заполненную ссылку» (Get pre-filled link).
   Ссылка выглядит так:

   https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxxxxxxxxxxxxxx/viewform?usp=pp_url
          &entry.123456789=Имя+Фамилия
          &entry.987654321=С+радостью+буду!

   FORM_ID        = 1FAIpQLSxxxxxxxxxxxxxxxxxxx  (кусок между /d/e/ и /viewform)
   ENTRY_NAME     = entry.123456789              (поле «Имя и фамилия»)
   ENTRY_ATTEND   = entry.987654321              (поле с вариантами ответа)
   OPTION_YES/NO  — тексты вариантов ИЗ ФОРМЫ, символ в символ.
   ────────────────────────────────────────────────────────────────────────── */
const FORM_ID      = '1FAIpQLSf9zfOFJaw2ttrLfEeG4EQJ2ewcx-w3h3XnW7rLIF5BSUBuTQ';
const ENTRY_NAME   = 'entry.1911724046';
const ENTRY_ATTEND = 'entry.996016260';
const OPTION_YES   = 'С радостью буду!';
const OPTION_NO    = 'К сожалению, не смогу';

const FORM_ACTION  = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
const FORM_READY   = !/ВСТАВЬ/.test(FORM_ID + ENTRY_NAME + ENTRY_ATTEND);

/* ─── ДАТА СВАДЬБЫ ───────────────────────────────────────────────────────── */
const WEDDING_AT = new Date('2026-10-24T12:00:00+03:00');   // Москва, UTC+3

/* ═══════════════════════════ ТАЙМЕР ═══════════════════════════ */
(function countdown(){
  const els = {
    box:  document.getElementById('countdown'),
    done: document.getElementById('cd-done'),
    d: document.getElementById('cd-d'), dl: document.getElementById('cd-dl'),
    h: document.getElementById('cd-h'), hl: document.getElementById('cd-hl'),
    m: document.getElementById('cd-m'), ml: document.getElementById('cd-ml'),
    s: document.getElementById('cd-s'), sl: document.getElementById('cd-sl')
  };
  if (!els.box) return;

  /* 1 день / 2 дня / 5 дней */
  function plural(n, one, few, many){
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  let timer = null;

  function tick(){
    const left = WEDDING_AT - Date.now();

    if (left <= 0){
      els.box.hidden = true;
      els.done.hidden = false;
      if (timer) clearInterval(timer);
      return;
    }

    const total = Math.floor(left / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor(total % 86400 / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;

    els.d.textContent = d;  els.dl.textContent = plural(d, 'день',   'дня',    'дней');
    els.h.textContent = h;  els.hl.textContent = plural(h, 'час',    'часа',   'часов');
    els.m.textContent = m;  els.ml.textContent = plural(m, 'минута', 'минуты', 'минут');
    els.s.textContent = s;  els.sl.textContent = plural(s, 'секунда','секунды','секунд');
  }

  tick();
  timer = setInterval(tick, 1000);
})();

/* ═══════════════════════════ АНКЕТА ═══════════════════════════ */
(function rsvp(){
  const form   = document.getElementById('rsvp-form');
  const thanks = document.getElementById('rsvp-thanks');
  const error  = document.getElementById('rsvp-error');
  if (!form) return;

  const nameEl = document.getElementById('rsvp-name');
  const btn    = form.querySelector('.rs-btn');

  function fail(msg){
    error.textContent = msg;
    error.hidden = false;
  }

  form.addEventListener('submit', async function (e){
    e.preventDefault();
    error.hidden = true;

    const name   = nameEl.value.trim();
    const choice = form.querySelector('input[name="attend"]:checked');

    if (!name)   return fail('Пожалуйста, впишите имя и фамилию');
    if (!choice) return fail('Пожалуйста, выберите один из вариантов');

    if (!FORM_READY){
      return fail('Форма ещё не подключена — заполните константы в script.js');
    }

    btn.disabled = true;
    const wasLabel = btn.textContent;
    btn.textContent = 'Отправляем…';

    const body = new URLSearchParams();
    body.append(ENTRY_NAME, name);
    body.append(ENTRY_ATTEND, choice.value === 'yes' ? OPTION_YES : OPTION_NO);

    try {
      await fetch(FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',                       // ответ прочитать нельзя — это норма
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString()
      });
      form.hidden   = true;
      thanks.hidden = false;
    } catch (err){
      btn.disabled = false;
      btn.textContent = wasLabel;
      fail('Не получилось отправить. Проверьте интернет и попробуйте ещё раз');
    }
  });
})();
