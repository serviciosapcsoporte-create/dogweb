/* Loader de Cristal para dogweb.lat — define config y carga el motor */
(function () {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "chat/cristal.css";
  document.head.appendChild(link);

  window.CRISTAL_CONFIG = {
    site: "dogweb",
    brand: "DogWeb",
    waUrl: "https://wa.me/573337450634",
    formUrl: "https://api.web3forms.com/submit",
    policyUrl: "https://serviciosapc.site/documentos/Politica_Tratamiento_Datos_serviciosapc.pdf",
    pains: [
      { label: "Página web", step: "pain_web" },
      { label: "Bot de WhatsApp", step: "pain_ia" },
      { label: "Videos / contenido", step: "pain_flujo" },
      { label: "Publicidad / ads", step: "pain_datos" },
      { label: "Mantenimiento", step: "pain_otro" },
      { label: "Otro", step: "pain_otro" },
    ],
    servicesByPain: {
      web: "<strong>Páginas web a la medida:</strong> sitios rápidos, responsive y optimizados para Google. Desde una landing hasta tu tienda.",
      ia: "<strong>Bot de WhatsApp con IA:</strong> responde, agenda y vende por ti 24/7 sin contratar más gente.",
      flujo: "<strong>Videos y contenido:</strong> edits, reels y piezas que convierten seguidores en clientes.",
      datos: "<strong>Publicidad y ads:</strong> campañas en Meta/Google que traen clientes reales, no likes vanos.",
      otro: "Cubrimos tu presencia digital completa: web, IA, videos y publicidad. Te armo el plan.",
    },
    fallbackService: "Cubrimos tu presencia digital completa: web, IA, videos y publicidad. Te armo el plan.",
  };

  var s = document.createElement("script");
  s.src = "chat/cristal.js";
  document.body.appendChild(s);
})();
