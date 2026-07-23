/*!
 * Cristal — Asistente de ventas conversacional (scriptado, sin LLM)
 * Configuración por sitio. Lee window.CRISTAL_CONFIG.
 */
(function () {
  "use strict";

  var C = window.CRISTAL_CONFIG;
  if (!C) { return; }

  // ---- Estado de la conversación ----
  var state = {
    step: "intro",
    name: "",
    phone: "",
    email: "",
    pain: "",
    hot: false,
  };

  var messages = [];

  // ---- Utilidades ----
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function pushMsg(who, html, typing) {
    return new Promise(function (resolve) {
      var wrap = el("div", "cr-msg " + (who === "bot" ? "cr-bot" : "cr-user"));
      if (typing) {
        wrap.innerHTML = '<div class="cr-typing"><span></span><span></span><span></span></div>';
      } else {
        wrap.innerHTML = '<div class="cr-bubble">' + html + "</div>";
      }
      chatLog.appendChild(wrap);
      scrollDown();
      if (typing) {
        setTimeout(function () {
          wrap.innerHTML = '<div class="cr-bubble">' + html + "</div>";
          scrollDown();
          resolve();
        }, 650 + Math.random() * 500);
      } else {
        resolve();
      }
    });
  }

  function scrollDown() {
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function showQuick(opts) {
    quickBar.innerHTML = "";
    opts.forEach(function (o) {
      var b = el("button", "cr-quick", o.label);
      b.onclick = function () { handle(o.value); };
      quickBar.appendChild(b);
    });
  }

  function clearQuick() { quickBar.innerHTML = ""; }

  // ---- Lógica de flujo ----
  function handle(value) {
    // value puede ser un paso explícito o texto libre
    if (value && value.step) {
      return goStep(value.step, value.data);
    }
    // texto libre: lo interpretamos según el contexto actual
    return classify(value);
  }

  // ¿El usuario quiere cerrar / avanzar / hablar ya?
  function isAffirm(text) {
    var t = (text || "").toLowerCase();
    return /(si|sí|dale|vale|bueno|ok|esta bien|hagamos|activ|cotiz|quiero|adelante|proced|apart|envi|dejame|me interesa|hablemos|hablar|whatsapp|wa|contact|empez|contrat|compr)/.test(t);
  }

  // ¿El usuario pide explícitamente hablar con alguien / ir a WhatsApp?
  function isTalkIntent(text) {
    var t = (text || "").toLowerCase();
    return /(whatsapp|habla|hablemos|asesor|persona|llam|contacto|telefono|celular)/.test(t);
  }

  function classify(text) {
    var t = (text || "").toLowerCase();

    // Si estamos en un momento de cierre (oferta o "déjame pensarlo"),
    // cualquier afirmación debe llevar al formulario o a WhatsApp, no dar vueltas.
    if (state.step === "offer" || state.step === "close") {
      if (isTalkIntent(t)) return goStep("wa");
      if (isAffirm(t)) return goStep("capture");
      // si no es afirmación ni hablar, asumimos duda -> volver a ofrecer cierre claro
      return goStep("close");
    }

    // En cualquier otro punto, si pide hablar directo, lo llevamos a WA
    if (isTalkIntent(t)) return goStep("wa");

    // Clasificación de dolor por palabras clave
    var pain = "otro";
    if (/(camara|cctv|seguridad|vigilar|robo|video|monitoreo)/.test(t)) pain = "camaras";
    else if (/(gente|cliente|flujo|persona|concurrencia|aglomer|cola|fila|espera)/.test(t)) pain = "flujo";
    else if (/(web|pagina|sitio|google|seo|aparecer|posicion|digital)/.test(t)) pain = "web";
    else if (/(whatsapp|bot|automat|ia|chat|respuesta|cliente)/.test(t)) pain = "ia";
    else if (/(dato|analitic|dashboard|reporte|kpi|metr|eficien)/.test(t)) pain = "datos";
    state.pain = pain;

    // Si el texto es una afirmación suelta sin palabra de dolor conocida,
    // lo mandamos a la oferta para cerrar en vez de preguntar de nuevo.
    if (pain === "otro" && isAffirm(t)) return goStep("offer", { pain: state.pain || "otro" });

    return goStep("pain_" + pain);
  }

  function goStep(step, data) {
    state.step = step;
    if (data) Object.assign(state, data);

    switch (step) {
      case "intro":
        return startIntro();
      case "menu":
        return showMenu();
      case "pain_camaras":
        return painCamaras();
      case "pain_flujo":
        return painFlujo();
      case "pain_web":
        return painWeb();
      case "pain_ia":
        return painIA();
      case "pain_datos":
        return painDatos();
      case "pain_otro":
        return painOtro();
      case "offer":
        return offer();
      case "close":
        return closeAsk();
      case "capture":
        return askData();
      case "wa":
        return goWA();
      default:
        return showMenu();
    }
  }

  function startIntro() {
    clearQuick();
    pushMsg("bot", "Hola, soy <strong>Cristal</strong> de " + C.brand + ". Hablo contigo porque veo que estás en nuestra página y <strong>algo te trajo aquí</strong>. ¿Buscas resolver algo hoy o solo estás mirando?")
      .then(function () {
        showQuick([
          { label: "Tengo un problema", step: "menu" },
          { label: "Solo estoy mirando", step: "close" },
          { label: "Quiero cotizar", step: "menu" },
        ]);
      });
  }

  function showMenu() {
    clearQuick();
    pushMsg("bot", "Cuéntame, ¿qué te está costando dinero o tiempo hoy en tu negocio? Elige lo que más te raspe:")
      .then(function () {
        showQuick(C.pains);
      });
  }

  // --- Dolor: Cámaras / CCTV ---
  function painCamaras() {
    clearQuick();
    pushMsg("bot", "Las cámaras que no sirven son un gasto que se ve todos los días y no avisa cuando falla. En Bogotá instalamos <strong>CCTV inteligente</strong> que no solo graba: <strong>detecta</strong>, alerta en tiempo real y se integra con tu celular.")
      .then(function () {
        pushMsg("bot", "Mientras lo piensas, la competencia que ya tiene visión activa está viendo lo que tú no. ¿Quieres que te muestre cómo quedaría en tu local?");
      })
      .then(function () {
        showQuick([
          { label: "Sí, muéstrame", step: "offer", data: { pain: "camaras" } },
          { label: "Cuánto cuesta", step: "offer", data: { pain: "camaras" } },
          { label: "Habla con alguien", step: "wa" },
        ]);
      });
  }

  function painFlujo() {
    clearQuick();
    pushMsg("bot", "El flujo de gente que no convierte es la fuga más cara y la menos visible. Con <strong>conteo de personas y mapas de calor</strong> ves exactamente dónde se pierden los clientes y abres caja antes de que se vayan.")
      .then(function () {
        pushMsg("bot", "Cada semana que pasa sin medirlo, sigues regalando ventas a quien sí lo hace. ¿Aparto tu demo de esta semana?");
      })
      .then(function () {
        showQuick([
          { label: "Aparta mi demo", step: "capture", data: { pain: "flujo" } },
          { label: "Ver beneficios", step: "offer", data: { pain: "flujo" } },
          { label: "Hablar por WA", step: "wa" },
        ]);
      });
  }

  function painWeb() {
    clearQuick();
    pushMsg("bot", "Si no apareces cuando buscan, el cliente va con otro. Hacemos <strong>páginas web y SEO local en Bogotá</strong> para que te encuentren las personas que hoy compran con la competencia.")
      .then(function () {
        pushMsg("bot", "La primera posición en Google la ocupa alguien; puede ser tú o tu rival. ¿Lo dejamos para después?");
      })
      .then(function () {
        showQuick([
          { label: "Quiero aparecer", step: "capture", data: { pain: "web" } },
          { label: "Ver opciones", step: "offer", data: { pain: "web" } },
          { label: "Hablar por WA", step: "wa" },
        ]);
      });
  }

  function painIA() {
    clearQuick();
    pushMsg("bot", "Un bot de WhatsApp que responde solo 24/7 cierra por ti mientras duermes. <strong>Automatizamos la atención, agendas y pedidos</strong> sin que contrates más gente.")
      .then(function () {
        pushMsg("bot", "Mientras decides, los clientes que escriben de madrugada se van con quien les contesta al instante. ¿Lo activamos?");
      })
      .then(function () {
        showQuick([
          { label: "Activalo", step: "capture", data: { pain: "ia" } },
          { label: "Cómo funciona", step: "offer", data: { pain: "ia" } },
          { label: "Hablar por WA", step: "wa" },
        ]);
      });
  }

  function painDatos() {
    clearQuick();
    pushMsg("bot", "Sin datos no sabes si ganaste o perdiste. El <strong>dashboard analítico</strong> te dice en tiempo real lo que deja dinero y lo que lo quema.")
      .then(function () {
        pushMsg("bot", "La decisión rápida es la que gana; la que se pospone la toma tu competencia. ¿Revisamos tus números?");
      })
      .then(function () {
        showQuick([
          { label: "Revisa mis números", step: "capture", data: { pain: "datos" } },
          { label: "Ver dashboard", step: "offer", data: { pain: "datos" } },
          { label: "Hablar por WA", step: "wa" },
        ]);
      });
  }

  function painOtro() {
    clearQuick();
    pushMsg("bot", "Cuéntame con tus palabras ¿qué necesitas? Analytics, cámaras, web, bots o algo que aún no tengo etiquetado. Yo te digo si lo resolvemos.")
      .then(function () {
        // espera texto libre; el input lo manda a classify
        showQuick(C.pains);
      });
  }

  function offer() {
    clearQuick();
    var p = state.pain || "otro";
    var svc = (C.servicesByPain && C.servicesByPain[p]) || C.fallbackService;
    pushMsg("bot", "Esto es lo que encaja contigo:")
      .then(function () {
        pushMsg("bot", svc);
      })
      .then(function () {
        pushMsg("bot", "La agenda de esta semana se está llenando. Si dejamos ir esta oportunidad, la toma quien sí decidió. ¿Avanzamos?");
      })
      .then(function () {
        showQuick([
          { label: "Sí, avancemos", step: "capture" },
          { label: "Quiero hablar con alguien", step: "wa" },
          { label: "Déjame pensarlo", step: "close" },
        ]);
      });
  }

  function closeAsk() {
    clearQuick();
    pushMsg("bot", "Entiendo. Pero seamos claros: mientras lo piensas, la competencia sigue avanzando y la agenda se ocupa. Cuando decidas, el espacio puede no estar.")
      .then(function () {
        pushMsg("bot", "Te dejo abierto por si cambias de idea. ¿Quieres que te avise cuando haya un cupo libre?");
      })
      .then(function () {
        showQuick([
          { label: "Avísame y tomo datos", step: "capture" },
          { label: "Mejor háblale a alguien", step: "wa" },
          { label: "Gracias, después", step: "end" },
        ]);
      });
  }

  function askData() {
    clearQuick();
    pushMsg("bot", "Déjame tus datos y un asesor de " + C.brand + " te contacta en menos de 24h. <strong>Tus datos los tratamos bajo la Ley 1581</strong> (puedes ver la política abajo).")
      .then(function () {
        // mostramos formulario embebido
        renderCaptureForm();
      });
  }

  function renderCaptureForm() {
    var form = el("div", "cr-form");
    form.innerHTML =
      '<input class="cr-input" id="cr_name" placeholder="Tu nombre">' +
      '<input class="cr-input" id="cr_phone" placeholder="WhatsApp / teléfono">' +
      '<input class="cr-input" id="cr_email" placeholder="Correo (opcional)">' +
      '<button class="cr-send" id="cr_send">Enviar y apartar cupo</button>' +
      '<a class="cr-legal" href="' + C.policyUrl + '" target="_blank" rel="noopener noreferrer">Política de Tratamiento de Datos (Ley 1581)</a>';
    chatLog.appendChild(form);
    scrollDown();
    document.getElementById("cr_send").onclick = function () {
      var name = document.getElementById("cr_name").value.trim();
      var phone = document.getElementById("cr_phone").value.trim();
      if (!name || !phone) {
        pushMsg("bot", "Necesito al menos tu nombre y un WhatsApp para apartar el cupo. ¿Me los das?");
        return;
      }
      state.name = name; state.phone = phone;
      state.email = document.getElementById("cr_email").value.trim();
      sendLead();
    };
  }

  function sendLead() {
    var payload = {
      name: state.name,
      phone: state.phone,
      email: state.email,
      pain: state.pain,
      source: "cristal_" + (C.site || "web"),
      brand: C.brand,
    };
    pushMsg("bot", "Recibiendo tus datos" + (state.name ? ", " + state.name : "") + "…").then(function () {
      fetch(C.formUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function () { successLead(); })
        .catch(function () { successLead(); });
    });
  }

  function successLead() {
    clearQuick();
    pushMsg("bot", "¡Listo! Cupo en proceso. Un asesor de " + C.brand + " te escribe en menos de 24h. Mientras tanto, si tienes prisa, háblale directo por WhatsApp.")
      .then(function () {
        showQuick([
          { label: "Escribir por WhatsApp", step: "wa" },
          { label: "Cerrar", step: "end" },
        ]);
      });
  }

  function goWA() {
    clearQuick();
    var txt = encodeURIComponent("Hola " + C.brand + ", hablo desde el chat Cristal. " + (state.pain ? "Mi interés: " + state.pain + ". " : "") + (state.name ? "Soy " + state.name + "." : ""));
    window.open(C.waUrl + "?text=" + txt, "_blank", "noopener");
    pushMsg("bot", "Te abrí WhatsApp con " + C.brand + ". Si no puedes ahora, déjame tus datos y te escribimos nosotros.");
    showQuick([
      { label: "Dejar mis datos", step: "capture" },
      { label: "Cerrar", step: "end" },
    ]);
  }

  // ---- Montaje del DOM ----
  var mount = document.getElementById(C.mountId || "cristal-mount");
  if (!mount) {
    mount = el("div");
    mount.id = "cristal-mount";
    document.body.appendChild(mount);
  }
  mount.innerHTML =
    '<div class="cr-launcher" id="cr-launcher" aria-label="Abrir asistente Cristal">' +
      '<span class="cr-avatar">C</span>' +
      '<span class="cr-launcher-dot"></span>' +
    '</div>' +
    '<div class="cr-panel" id="cr-panel" aria-hidden="true">' +
      '<div class="cr-header">' +
        '<div class="cr-header-info"><span class="cr-avatar sm">C</span>' +
          '<div><div class="cr-name">Cristal</div><div class="cr-role">' + C.brand + ' · Asesora virtual</div></div></div>' +
        '<button class="cr-close" id="cr-close" aria-label="Cerrar">×</button>' +
      '</div>' +
      '<div class="cr-log" id="cr-log"></div>' +
      '<div class="cr-quick" id="cr-quick"></div>' +
      '<div class="cr-inputbar">' +
        '<input class="cr-text" id="cr-text" placeholder="Escribe tu respuesta…" autocomplete="off">' +
        '<button class="cr-sendbtn" id="cr-sendbtn" aria-label="Enviar">➤</button>' +
      '</div>' +
      '<div class="cr-foot"><a href="' + C.policyUrl + '" target="_blank" rel="noopener noreferrer">Tus datos · Ley 1581</a></div>' +
    '</div>';

  var launcher = mount.querySelector("#cr-launcher");
  var panel = mount.querySelector("#cr-panel");
  var chatLog = mount.querySelector("#cr-log");
  var quickBar = mount.querySelector("#cr-quick");
  var textInput = mount.querySelector("#cr-text");
  var sendBtn = mount.querySelector("#cr-sendbtn");

  function openPanel() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    launcher.classList.add("hidden");
    // ocultar redes flotantes para que el panel no las tape
    document.querySelectorAll(".social-float").forEach(function (n) {
      n.style.transition = "opacity .2s ease";
      n.style.opacity = "0";
      n.style.pointerEvents = "none";
    });
    if (state.step === "intro" && chatLog.children.length === 0) {
      goStep("intro");
    }
    setTimeout(function () { textInput.focus(); }, 200);
  }
  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    launcher.classList.remove("hidden");
    document.querySelectorAll(".social-float").forEach(function (n) {
      n.style.opacity = "1";
      n.style.pointerEvents = "auto";
    });
  }

  launcher.onclick = openPanel;
  mount.querySelector("#cr-close").onclick = closePanel;

  function userSend() {
    var v = textInput.value.trim();
    if (!v) return;
    textInput.value = "";
    var um = el("div", "cr-msg cr-user");
    um.innerHTML = '<div class="cr-bubble">' + v.replace(/</g, "&lt;") + "</div>";
    chatLog.appendChild(um);
    scrollDown();
    handle(v);
  }
  sendBtn.onclick = userSend;
  textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") userSend();
  });

  // proactivo: abrir solo el launcher a los 8s
  setTimeout(function () {
    if (!panel.classList.contains("open")) launcher.classList.add("pulse");
    setTimeout(function () { launcher.classList.remove("pulse"); }, 4000);
  }, 8000);
})();
