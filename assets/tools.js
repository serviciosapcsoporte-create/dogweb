/* DOGWEB · Herramientas gratuitas B2B — JS vanilla, sin librerías ni CDNs */
(function () {
  'use strict';
  var root = document.getElementById('herramientas-gratis');
  if (!root) return;

  var WA = '573337450634';
  var keyInput = document.querySelector('#contactFormDogweb input[name="access_key"]');
  var accessKey = keyInput ? keyInput.value : '';
  var webhook = root.getAttribute('data-webhook') || '';
  var work = document.getElementById('dw-tool-work');
  var form = document.getElementById('dw-tool-form');
  var result = document.getElementById('dw-tool-result');
  var titleEl = document.getElementById('dw-tool-work-title');
  var subEl = document.getElementById('dw-tool-work-sub');
  var statusEl = document.getElementById('dw-tool-status');
  var current = null;

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
  function money(n) { return '$' + Math.round(n).toLocaleString('es-CO'); }

  var TOOLS = {
    visibilidad: {
      title: 'Checklist de Visibilidad Local y Google Maps',
      sub: '5 minutos para saber si su negocio aparece cuando lo buscan en su zona.',
      fields: [
        { name: 'negocio', label: 'Nombre del negocio', type: 'text', placeholder: 'Ej. Café La 85' },
        { name: 'sector', label: 'Sector', type: 'select', options: ['Retail / comercio', 'Clínica / consultorio', 'Restaurante / cafetería', 'Gimnasio / spa', 'Servicios profesionales', 'Otro'] },
        { name: 'zona', label: 'Zona o barrio', type: 'text', placeholder: 'Ej. Chapinero, Bogotá' },
        { name: 'maps', label: 'Link de Maps o perfil en redes', type: 'text', placeholder: 'Pega el enlace o escribe «no tengo»' }
      ],
      calc: function (v) {
        var hasMap = /https?:|google|maps|instagram|facebook/i.test(v.maps || '');
        var pts = 0, bullets = [];
        if ((v.negocio || '').trim().length > 2) { pts += 1; bullets.push({ t: 'Nombre de negocio definido' }); }
        else bullets.push({ t: 'Falta el nombre del negocio', gap: true });
        if (v.sector) { pts += 1; bullets.push({ t: 'Sector identificado: ' + v.sector }); }
        else bullets.push({ t: 'Sin sector definido', gap: true });
        if ((v.zona || '').trim().length > 2) { pts += 1; bullets.push({ t: 'Zona de búsqueda: ' + v.zona }); }
        else bullets.push({ t: 'Sin zona: Google no sabe dónde mostrarte', gap: true });
        if (hasMap) { pts += 1; bullets.push({ t: 'Perfil o enlace detectado' }); }
        else bullets.push({ t: 'Sin perfil de Maps/redes detectable', gap: true });
        if ((v.negocio || '').trim().length > 2 && hasMap) { pts += 1; bullets.push({ t: 'Datos listos para conectar reseñas y ficha' }); }
        else bullets.push({ t: 'Ficha sin conexión con la web', gap: true });
        return {
          score: pts + '/5', scoreLabel: 'NIVEL DE VISIBILIDAD LOCAL',
          finding: hasMap ? 'Su perfil existe, pero ' + (pts < 4 ? 'le faltan señales locales para posicionar en «' + esc(v.zona || 'su zona') + '».' : 'conviene revisar reseñas y enlaces para subir el nivel.')
                          : 'Sin perfil detectable en Maps/redes: sus clientes no pueden encontrarlo en búsquedas de «' + esc(v.zona || 'su zona') + '».',
          bullets: bullets,
          wa: 'Hola Alejandro, hice el Checklist de Visibilidad Local. Mi negocio es ' + (v.negocio || 'N/D') + ' (' + (v.sector || 'N/D') + ') en ' + (v.zona || 'N/D') + '. Resultado: ' + pts + '/5. ¿Revisamos mi ficha 15 minutos?'
        };
      }
    },
    fuga: {
      title: 'Calculadora de Fuga por Demora en Respuesta',
      sub: 'Cuántos clientes potenciales se enfrían mientras su negocio tarda en contestar.',
      fields: [
        { name: 'consultas', label: 'Consultas recibidas al día', type: 'number', placeholder: 'Ej. 20' },
        { name: 'tiempo', label: 'Tiempo promedio de respuesta', type: 'select', options: ['Menos de 5 minutos', '5 a 30 minutos', '1 a 4 horas', 'Más de 4 horas'] },
        { name: 'canal', label: 'Canal principal', type: 'select', options: ['WhatsApp', 'Instagram / Facebook', 'Llamadas', 'Formulario web', 'Apps de delivery'] },
        { name: 'ticket', label: 'Ticket promedio (COP)', type: 'number', placeholder: 'Ej. 60000' }
      ],
      calc: function (v) {
        var rates = { 'Menos de 5 minutos': 0.05, '5 a 30 minutos': 0.20, '1 a 4 horas': 0.45, 'Más de 4 horas': 0.70 };
        var rate = rates[v.tiempo] || 0.2;
        var lost = num(v.consultas) * 30 * num(v.ticket) * rate;
        var lostMsgs = Math.round(num(v.consultas) * 30 * rate);
        return {
          score: money(lost) + '/mes', scoreLabel: 'FUGA ESTIMADA POR DEMORA',
          finding: 'Con ' + num(v.consultas) + ' consultas/día por ' + esc(v.canal || 'tu canal') + ' y una respuesta de ' + esc((v.tiempo || '').toLowerCase()) + ', alrededor de ' + lostMsgs + ' conversaciones al mes se enfrían antes de su respuesta.',
          bullets: [
            { t: 'Consultas/mes: ' + Math.round(num(v.consultas) * 30) },
            { t: 'Tasa de enfriamiento estimada: ' + Math.round(rate * 100) + '%' },
            { t: 'Ticket promedio: ' + money(num(v.ticket)) },
            { t: 'Oportunidad: responder en menos de 5 min reduce la fuga a ~5%', gap: true }
          ],
          wa: 'Hola Alejandro, usé la Calculadora de Fuga. Recibo ' + num(v.consultas) + ' consultas/día por ' + (v.canal || 'WhatsApp') + ', respondo en ' + (v.tiempo || 'N/D').toLowerCase() + ' y mi ticket es ' + money(num(v.ticket)) + '. La fuga estimada es ' + money(lost) + '/mes. ¿Me ayudan a automatizar la respuesta?'
        };
      }
    },
    web: {
      title: 'Evaluador: ¿Web, Landing o Catálogo?',
      sub: 'Un veredicto directo según cómo compran sus clientes hoy.',
      fields: [
        { name: 'tipo', label: 'Tipo de negocio', type: 'select', options: ['Restaurante / cafetería', 'Clínica / consultorio', 'Retail / tienda', 'Servicios profesionales', 'Gimnasio / spa', 'Otro'] },
        { name: 'canal', label: '¿Dónde vende hoy?', type: 'select', options: ['Solo redes sueltas', 'Envío de catálogo y precios a mano', 'Plataforma de pedidos / reservas', 'Sitio web propio'] },
        { name: 'objetivo', label: 'Objetivo principal', type: 'select', options: ['Más clientes nuevos', 'Más citas o pedidos', 'Subir el ticket promedio'] },
        { name: 'webactual', label: '¿Tiene web actualmente?', type: 'select', options: ['No tengo', 'Tengo, pero no me trae clientes', 'Tengo y funciona bien'] }
      ],
      calc: function (v) {
        var verdict = 'Landing de captación', reason = 'Necesita una página enfocada en una sola acción: solicitar información o agendar.';
        if (v.canal === 'Solo redes sueltas') { verdict = 'Catálogo + Landing'; reason = 'Sus clientes dependen de publicaciones sueltas; un catálogo ordenado con WhatsApp directo convierte mejor.'; }
        if (v.canal === 'Envío de catálogo y precios a mano') { verdict = 'Catálogo digital'; reason = 'Está perdiendo tiempo enviando precios uno por uno; un catálogo con precios claros trabaja por usted.'; }
        if (v.objetivo === 'Más citas o pedidos') { verdict = 'Landing con reserva'; reason = 'Su Prioridad es agendar o recibir pedidos: la web debe llevar a ese botón, no a un menú amplio.'; }
        if (v.webactual === 'Tengo, pero no me trae clientes') { verdict = 'Web optimizada + SEO local'; reason = 'Ya tiene el activo; lo que falta es velocidad, contenido local y un camino claro al WhatsApp.'; }
        return {
          score: verdict, scoreLabel: 'RECOMENDACIÓN',
          finding: reason,
          bullets: [
            { t: 'Negocio: ' + esc(v.tipo || 'N/D') },
            { t: 'Canal actual: ' + esc(v.canal || 'N/D') },
            { t: 'Objetivo: ' + esc(v.objetivo || 'N/D') },
            { t: 'Entrega sugerida: 72 horas (Sprint DogWeb)', gap: true }
          ],
          wa: 'Hola Alejandro, hice el Evaluador y me recomienda ' + verdict + '. Mi negocio es ' + (v.tipo || 'N/D') + ', vendo por ' + (v.canal || 'N/D') + ' y quiero ' + (v.objetivo || 'N/D').toLowerCase() + '. ¿Armamos la propuesta?'
        };
      }
    },
    vision: {
      title: 'Checklist de Operación con Visión IA (Hikvision / Dahua)',
      sub: 'Descubra si sus cámaras solo graban o si pueden entregar datos útiles a su operación.',
      fields: [
        { name: 'marca', label: 'Marca de cámaras', type: 'select', options: ['Hikvision', 'Dahua', 'Otra / no sé', 'No tengo cámaras'] },
        { name: 'operativas', label: '¿Están operativas?', type: 'select', options: ['Sí, todas', 'Sí, pero algunas fallan', 'No, están en almacén', 'No tengo'] },
        { name: 'problema', label: '¿Qué quiere ordenar u observar?', type: 'select', options: ['Conteo de personas', 'Arqueo / conciliación', 'Flujo horario', 'Detección de anomalías operativas', 'Aún no lo sé'] },
        { name: 'contacto', label: 'Teléfono / WhatsApp', type: 'tel', placeholder: '+57 3xx xxx xxxx' }
      ],
      calc: function (v) {
        var ready = (v.marca === 'Hikvision' || v.marca === 'Dahua') && (v.operativas === 'Sí, todas' || v.operativas === 'Sí, pero algunas fallan');
        var bullets = [
          { t: 'Equipo ' + esc(v.marca || 'N/D') + ': ' + (ready ? 'apto para visión IA' : 'requiere revisión previa'), gap: !ready },
          { t: 'Estado: ' + esc(v.operativas || 'N/D') },
          { t: 'Caso de uso: ' + esc(v.problema || 'N/D') },
          { t: ready ? 'Sin licencias costosas en prueba: se mide con datos reales' : 'Paso 1: inventario y puesta en marcha del equipo', gap: !ready }
        ];
        return {
          score: ready ? 'LISTO PARA MEDIR' : 'REQUIERE REVISIÓN', scoreLabel: 'ESTADO OPERATIVO',
          finding: ready ? 'Su equipo puede apoyar ' + esc((v.problema || 'su operación').toLowerCase()) + ' y convertir video en datos para un panel; sin depender de vigilancia ni licencias innecesarias.'
                         : 'Antes de medir, conviene revisar el estado del equipo y definir un solo problema operativo a observar.',
          bullets: bullets,
          wa: 'Hola Alejandro, hice el Checklist de Operación con Visión IA. Tengo ' + (v.marca || 'N/D') + ', estado: ' + (v.operativas || 'N/D') + ', y quiero observar ' + (v.problema || 'N/D').toLowerCase() + '. Resultado: ' + (ready ? 'listo para medir' : 'requiere revisión') + '. ¿Me muestran un panel con mis datos?'
        };
      }
    },
    ticket: {
      title: 'Simulador de Ticket Promedio',
      sub: 'Combos y adicionales para vender más sin bajar margen.',
      fields: [
        { name: 'producto', label: 'Producto o servicio principal', type: 'text', placeholder: 'Ej. Café + pastel' },
        { name: 'ticket', label: 'Ticket actual estimado (COP)', type: 'number', placeholder: 'Ej. 25000' },
        { name: 'zona', label: 'Zona', type: 'text', placeholder: 'Ej. Centro, Bogotá' },
        { name: 'adicionales', label: '¿Vende adicionales hoy?', type: 'select', options: ['No, solo el producto principal', 'Sí, pero sin estructura', 'Sí, combos definidos'] }
      ],
      calc: function (v) {
        var base = num(v.ticket), uplift = v.adicionales === 'Sí, combos definidos' ? 0.12 : 0.25;
        var target = base * (1 + uplift);
        var name = (v.producto || 'su producto').trim();
        return {
          score: money(target), scoreLabel: 'TICKET POTENCIAL',
          finding: 'Con ' + esc(name) + ' en ' + esc(v.zona || 'su zona') + ' y ' + esc((v.adicionales || '').toLowerCase()) + ', una estructura de 3 combos puede subir el ticket cerca de ' + Math.round(uplift * 100) + '% sin cambiar su precio base.',
          bullets: [
            { t: 'Combo 1: ' + name + ' + adicional dulce/salado' },
            { t: 'Combo 2: versión duo para compartir' },
            { t: 'Combo 3: promoción por hora valle' },
            { t: 'Ticket actual ' + money(base) + ' → potencial ' + money(target), gap: true }
          ],
          wa: 'Hola Alejandro, usé el Simulador de Ticket. Vendo ' + (v.producto || 'N/D') + ' en ' + (v.zona || 'N/D') + ', ticket actual ' + money(base) + ', potencial ' + money(target) + '. ¿Aplicamos un piloto con mi carta?'
        };
      }
    }
  };

  function fieldHTML(f) {
    var id = 'dwf-' + f.name;
    var label = '<label for="' + id + '">' + esc(f.label) + '</label>';
    if (f.type === 'select') {
      var opts = '<option value="">Seleccione…</option>' + f.options.map(function (o) {
        return '<option value="' + esc(o) + '">' + esc(o) + '</option>';
      }).join('');
      return '<div class="dw-field">' + label + '<select id="' + id + '" name="' + esc(f.name) + '">' + opts + '</select></div>';
    }
    return '<div class="dw-field">' + label + '<input id="' + id + '" name="' + esc(f.name) + '" type="' + esc(f.type) + '" placeholder="' + esc(f.placeholder || '') + '"' + (f.type === 'number' ? ' min="0" step="any"' : '') + '></div>';
  }

  function openTool(key) {
    var t = TOOLS[key];
    if (!t) return;
    current = key;
    titleEl.textContent = t.title;
    subEl.textContent = t.sub;
    form.innerHTML = t.fields.map(fieldHTML).join('') +
      '<button class="dw-tool-submit" type="submit">Ver mi diagnóstico →</button>';
    result.hidden = true;
    result.innerHTML = '';
    statusEl.textContent = '';
    work.hidden = false;
    if (window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      work.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      work.scrollIntoView();
    }
    var first = form.querySelector('input,select');
    if (first) first.focus({ preventScroll: true });
  }

  root.addEventListener('click', function (e) {
    var card = e.target.closest('[data-open]');
    if (card) { openTool(card.getAttribute('data-open')); return; }
    if (e.target.closest('[data-close]')) {
      work.hidden = true; current = null;
      var c = root.querySelector('[data-open]'); if (c) c.focus();
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!current) return;
    var t = TOOLS[current], v = {};
    t.fields.forEach(function (f) { var el = document.getElementById('dwf-' + f.name); v[f.name] = el ? el.value.trim() : ''; });
    var missing = t.fields.filter(function (f) { return !v[f.name]; });
    if (missing.length) {
      statusEl.textContent = 'Faltan campos: ' + missing.map(function (f) { return f.label; }).join(', ');
      var el = document.getElementById('dwf-' + missing[0].name); if (el) el.focus();
      return;
    }
    var r = t.calc(v);
    var bullets = r.bullets.map(function (b) { return '<li class="' + (b.gap ? 'is-gap' : '') + '">' + esc(b.t) + '</li>'; }).join('');
    result.innerHTML =
      '<div class="dw-tool-score"><b>' + esc(r.score) + '</b><span>' + esc(r.scoreLabel) + '</span></div>' +
      '<div class="dw-tool-finding"><strong>1 fuga detectada</strong>' + r.finding + '</div>' +
      '<ul class="dw-tool-list">' + bullets + '</ul>' +
      '<div class="dw-tool-next">' +
        '<p><strong>¿Quiere que lo revisemos en 15 minutos?</strong> Déjenos su WhatsApp y le enviamos este diagnóstico con el siguiente paso.</p>' +
        '<div class="dw-field"><label for="dwf-contacto">Su WhatsApp o correo</label><input id="dwf-contacto" type="text" placeholder="+57 3xx xxx xxxx o correo@ejemplo.com"></div>' +
        '<a class="dw-tool-wa" id="dw-tool-wa" href="#">Enviar diagnóstico y abrir WhatsApp →</a>' +
      '</div>';
    var link = document.getElementById('dw-tool-wa');
    link.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(r.wa);
    result.hidden = false;
    var waBtn = document.getElementById('dw-tool-wa');
    waBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      var contact = (document.getElementById('dwf-contacto') || {}).value || '';
      var extra = contact.trim() ? ' Me escribo desde ' + contact.trim() + '.' : '';
      waBtn.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(r.wa + extra);
      sendLead(current, t, v, contact);
      window.open(waBtn.href, '_blank', 'noopener,noreferrer');
    });
    form.hidden = true;
  });

  function sendLead(key, tool, values, contact) {
    var fd = new FormData();
    if (accessKey) fd.append('access_key', accessKey);
    fd.append('_subject', 'Lead Free · ' + tool.title);
    fd.append('_template', 'table');
    fd.append('_honey', '');
    fd.append('herramienta', tool.title);
    fd.append('origen', 'free-tool:' + key);
    fd.append('sector', values.sector || values.tipo || values.marca || '');
    fd.append('zona', values.zona || '');
    fd.append('urgencia', values.tiempo || values.operativas || values.objetivo || 'media');
    fd.append('contacto', contact || '');
    Object.keys(values).forEach(function (k) { fd.append('dato_' + k, values[k]); });
    var st = document.getElementById('dw-tool-status');
    fetch(webhook || 'https://api.web3forms.com/submit', { method: 'POST', body: fd, mode: 'cors' })
      .then(function () { if (st) st.textContent = 'Diagnóstico registrado. Si no se abre WhatsApp, escribanos al ' + WA + '.'; })
      .catch(function () { if (st) st.textContent = 'Registro no disponible. Escríbanos directamente al ' + WA + '.'; });
  }

  var params = new URLSearchParams(location.search);
  var h = params.get('h');
  if (h && TOOLS[h]) openTool(h);
})();
