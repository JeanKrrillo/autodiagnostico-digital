/**
 * MOTOR DE PONDERACIÓN DE RIESGO - PROTOCOLO DE RESILIENCIA 2025
 * Este archivo centraliza los pesos, valores y lógica de cálculo, 
 * sin generalizar opciones, incluyendo "No sé" y "No la uso".
 */

const RISK_CONFIG = {
  // PESOS DE LAS FASES (Suman 100%)
  PONDERACION_TOTAL: {
    QUIZ: 0.30,      // 30%
    ASSETS: 0.45,    // 45%
    PASSWORD: 0.25   // 25%
  },

  // FASE 1: PREGUNTAS (15 Preguntas)
  // Cada respuesta suma puntos. El máximo posible se usa para normalizar al 30%.
  questions: [
    { 
      id: 1, 
      text: "¿Sabes qué sucede el 1 de julio?",
      opciones: {
        positivo: { label: "Ya registré mi número con mi operadora", value: 0 },
        neutro: { label: "Sé que existe pero no sé qué hacer", value: 20 },
        negativo: { label: "No sabía nada de esto", value: 40 }
      }
    },
    { 
      id: 2, 
      text: "¿Usas la misma contraseña en más de un servicio?", 
      opciones: {
        positivo: { label: "No, cada cuenta tiene la suya", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Sí, repito alguna en varios lugares", value: 40 }
      }
    },
    { 
      id: 3, 
      text: "Cuando una app te pide un código para entrar ¿cómo te llega?",
      opciones: {
        positivo: { label: "Lo genero en una app (Authenticator, Authy)", value: 0 },
        neutro: { label: "No lo tengo activado o no lo sé", value: 20 },
        negativo: { label: "Me llega por mensaje de texto (SMS)", value: 40 }
      }
    },
    { 
      id: 4, 
      text: "Si pierdes tu correo ¿podrías recuperarlo sin tu número?",
      opciones: {
        positivo: { label: "Sí, tengo correo alterno o llaves de recuperación", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "No, el único método que tengo es un SMS", value: 40 }
      }
    },
    { 
      id: 5, 
      text: "Cuando usas Wi-Fi público ¿qué haces normalmente?",
      opciones: {
        positivo: { label: "Uso VPN o prefiero mis datos móviles", value: 0 },
        neutro: { label: "No uso Wi-Fi público", value: 0 },
        negativo: { label: "Me conecto sin ninguna protección adicional", value: 40 }
      }
    },
    { 
      id: 6, 
      text: "¿Cómo guardas actualmente tus contraseñas?", 
      opciones: {
        positivo: { label: "Uso un gestor de contraseñas", value: 0 },
        neutro: { label: "El navegador las recuerda por mí", value: 20 },
        negativo: { label: "Las memorizo o las anoto en papel o notas", value: 40 }
      }
    },
    { 
      id: 7, 
      text: "¿Alguna vez te llegó un código SMS de verificación que no pediste?",
      opciones: {
        positivo: { label: "No, nunca", value: 0 },
        neutro: { label: "No lo recuerdo", value: 20 },
        negativo: { label: "Sí, me ha pasado", value: 40 }
      }
    },
    { 
      id: 8, 
      text: "¿Tu celular ha perdido señal de repente y sin razón?",
      opciones: {
        positivo: { label: "No, nunca", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Sí, tardó horas o días en volver", value: 40 }
      }
    },
    { 
      id: 9, 
      text: "¿Tienes cuentas registradas con un número que ya no usas?",
      opciones: {
        positivo: { label: "No, siempre actualizo cuando cambio", value: 0 },
        neutro: { label: "Nunca lo había pensado", value: 20 },
        negativo: { label: "Posiblemente, he cambiado de número sin actualizar", value: 40 }
      }
    },
    { 
      id: 10, 
      text: "¿Tienes los códigos de emergencia de tus cuentas guardados fuera del celular?",
      opciones: {
        positivo: { label: "Sí, los tengo guardados fuera del celular", value: 0 },
        neutro: { label: "No tengo verificación en dos pasos activada", value: 20 },
        negativo: { label: "No sabía que existían", value: 40 }
      }
    },
    { 
      id: 11, 
      text: "¿Cuántos servicios tienen guardado tu número de celular?",
      opciones: {
        positivo: { label: "1-5 apps", value: 0 },
        neutro: { label: "6-15 apps", value: 20 },
        negativo: { label: "+15 apps", value: 40 }
      }
    },
    { 
      id: 12, 
      text: "¿Has perdido o te han robado el celular en el último año?", 
      opciones: {
        positivo: { label: "No en este último año", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Sí, me pasó recientemente", value: 40 }
      }
    },
    { 
      id: 13, 
      text: "¿Tu chip tiene el PIN activado, diferente al de la pantalla?",
      opciones: {
        positivo: { label: "Sí, lo tengo activado", value: 0 },
        neutro: { label: "No sabía que eso existía", value: 20 },
        negativo: { label: "No, pero quiero hacerlo", value: 40 }
      }
    },
    { 
      id: 14, 
      text: "¿Estarás fuera de México entre junio y julio de este año?", 
      opciones: {
        positivo: { label: "No, voy a estar en México", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Sí, voy a viajar en esas fechas", value: 40 }
      }
    },
    { 
      id: 15, 
      text: "¿Cómo prefieres resolver lo que encontremos?", 
      opciones: {
        positivo: { label: "Con ayuda — Prefiero que alguien me ayude haciéndolo", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Por mi cuenta — Prefiero aprender y hacerlo con una guía", value: 40 }
      }
    }
  ],

  // FASE 2: INVENTARIO DE ACTIVOS (63 Aplicaciones)
  // Opciones: "No la uso" (0 pts), "Protegida" (0 pts), "Vulnerable" (Suma el peso)
  apps: {
    criticas: {
      peso: 5,
      list: [
        "WhatsApp", "Apple ID", "Google/Gmail", "Microsoft/Outlook", "Bitwarden", 
        "BBVA", "Santander", "Banorte", "HSBC", "Nu Bank", "Binance", "Bitso", 
        "PayPal", "Revolut", "Samsung Account", "Signal", "Mercado Pago"
      ]
    },
    moderadas: {
      peso: 3,
      list: [
        "Instagram", "TikTok", "Facebook", "LinkedIn", "Telegram", "X (Twitter)", 
        "Amazon", "Mercado Libre", "Uber", "ChatGPT", "Claude", "Yahoo!", 
        "Rappi", "DiDi", "Zoom", "Reddit", "Discord", "Adobe", "Canva", 
        "Figma", "Notion", "Airbnb", "Aeroméxico", "Volaris", "Walmart", 
        "Liverpool", "Coppel", "Trello", "Messenger"
      ]
    },
    bajas: {
      peso: 1,
      list: [
        "Netflix", "Spotify", "YouTube", "Twitch", "Disney+", "Nintendo", 
        "Pinterest", "Temu", "Shein", "Dropbox", "Shazam", "Snapchat", 
        "Steam", "Epic Games", "Xbox", "Roblox", "Evernote"
      ]
    }
  },

  // FASE 3: HIVE SYSTEMS (Password Strength)
  password_risk: {
    "instantaneo": { percent: 100, label: "Instantáneo", color: "Púrpura/Rojo brillante" },
    "minutos_horas": { percent: 85, label: "Minutos / Horas", color: "Rojo suave" },
    "dias_meses": { percent: 55, label: "Días / Meses", color: "Naranja" },
    "anos": { percent: 30, label: "Años", color: "Amarillo" },
    "siglos": { percent: 10, label: "Siglos", color: "Verde claro" },
    "milenios": { percent: 0, label: "Milenios+", color: "Verde oscuro" }
  }
};

/**
 * Función principal de cálculo
 * @param {Object} userData - Estado actual de respuestas del usuario
 */
function calculateFinalRisk(userData) {
  let scoreQuiz = 0;
  let scoreApps = 0;
  let scorePass = 0;

  // 1. Cálculo Quiz (Normalizado)
  // Sumamos los máximos posibles de las 15 preguntas (15 * 40 = 600 puntos)
  let maxQuizPoints = RISK_CONFIG.questions.reduce((acc, q) => acc + q.opciones.negativo.value, 0);
  
  userData.quizAnswers.forEach(answer => {
    // answer: { questionId, value: 'positivo' | 'neutro' | 'negativo' }
    const question = RISK_CONFIG.questions.find(q => q.id === answer.questionId);
    if (question && question.opciones[answer.value]) {
      scoreQuiz += question.opciones[answer.value].value;
    }
  });
  const quizResult = (scoreQuiz / maxQuizPoints) * RISK_CONFIG.PONDERACION_TOTAL.QUIZ;

  // 2. Cálculo Apps (Normalizado)
  // El máximo posible es que TODAS las apps que el usuario "Usa" sean "Vulnerables"
  let pointsEarnedApps = 0;
  let totalMaxApps = 0;

  userData.appStatus.forEach(app => {
    // app: { name, status: 'no_uso' | 'protegida' | 'vulnerable' }
    let weight = 0;
    if (RISK_CONFIG.apps.criticas.list.includes(app.name)) weight = RISK_CONFIG.apps.criticas.peso;
    else if (RISK_CONFIG.apps.moderadas.list.includes(app.name)) weight = RISK_CONFIG.apps.moderadas.peso;
    else if (RISK_CONFIG.apps.bajas.list.includes(app.name)) weight = RISK_CONFIG.apps.bajas.peso;

    // Solo se toma en cuenta si la app sí se usa
    if (app.status !== 'no_uso') {
      totalMaxApps += weight;
      if (app.status === 'vulnerable') pointsEarnedApps += weight;
    }
  });
  
  const appsResult = totalMaxApps > 0 
    ? (pointsEarnedApps / totalMaxApps) * RISK_CONFIG.PONDERACION_TOTAL.ASSETS 
    : 0;

  // 3. Cálculo Password
  const passCategory = RISK_CONFIG.password_risk[userData.passwordTime];
  scorePass = passCategory ? passCategory.percent : 0;
  const passResult = (scorePass / 100) * RISK_CONFIG.PONDERACION_TOTAL.PASSWORD;

  // Resultado Final (0 a 100)
  let totalRisk = (quizResult + appsResult + passResult) * 100;
  
  // SPOF: Punto Único de Fallo
  // Si el usuario responde que depende del SMS (Q3: negativo) y 
  // que es su único respaldo (Q4: negativo), activamos el bono de riesgo
  const q3Answer = userData.quizAnswers.find(q => q.questionId === 3);
  const q4Answer = userData.quizAnswers.find(q => q.questionId === 4);
  
  if (q3Answer && q3Answer.value === 'negativo' && q4Answer && q4Answer.value === 'negativo') {
    if (totalRisk < 70) {
      totalRisk = 70; // SPOF Floor
    }
  }

  return Math.round(totalRisk);
}

const POST_RESPONSES = {
  q1: {
    negativo: "No te preocupes, es normal, para eso es este diagnóstico.",
    neutro: "Responder este diagnóstico ya es el primer paso 👍",
    positivo: "Bien. Ahora conviene revisar si tus cuentas siguen dependiendo del SMS, porque el registro no resuelve eso."
  },
  q2: {
    negativo: "Es lo más común y tiene solución.",
    neutro: "Vale la pena revisar para que no repitas contraseñas.",
    positivo: "Eso ya es un buen hábito."
  },
  q3: {
    negativo: "Veremos si conviene cambiarlo antes del 1 de julio.",
    neutro: "Muchas personas no lo saben.",
    positivo: "Tendremos que revisar."
  },
  q4: {
    negativo: "Tiene solución y lo vamos a revisar.",
    neutro: "Conviene configurar un correo alterno de respaldo.",
    positivo: "Justo el respaldo que se necesita."
  },
  q5: {
    negativo: "Es lo más normal, pero es riesgoso.",
    neutro: "Perfecto, eso disminuye el riesgo.",
    positivo: "Muy bien, buena precaución."
  },
  q6: {
    negativo: "Cuidado, nadie logra memorizar 50 claves distintas.",
    neutro: "Es mejor que nada, aunque no te descuides.",
    positivo: "✅ Muy bien, genera claves difíciles de adivinar y las recuerda por ti."
  },
  q7: {
    negativo: "Alguien intentó entrar. Vale la pena revisar esa cuenta.",
    neutro: "Mucha gente los ignora. Conviene estar al pendiente.",
    positivo: "Bien, aunque puede cambiar, especialmente después del 1 de julio."
  },
  q8: {
    negativo: "Pudo ser un fallo. Si notaste algo raro, revisa.",
    neutro: "Si pasa alguna vez, ya sabes qué puede significar.",
    positivo: "Bien. Si pasa alguna vez, ya sabes qué checar."
  },
  q9: {
    negativo: "Nadie avisa cuando reasignan tu número. Revisa tus cuentas principales.",
    neutro: "Revísalo rápido desde la configuración de cada cuenta.",
    positivo: "Eso es de lo más sencillo y ya lo tienes."
  },
  q10: {
    negativo: "La mayoría no los conoce. Se generan desde la configuración de cada cuenta.",
    neutro: "Si tu contraseña se filtra, pierdes el acceso. Conviene activar verificación en dos pasos.",
    positivo: "✅ Muy bien, es un respaldo que no depende de señal ni batería👍"
  },
  q11: {
    negativo: "Con ese nivel de dependencia, perder el número o que lo clonen afectaría varios servicios a la vez. Vamos a priorizar lo más crítico.",
    neutro: "Es la situación más común y con un plan concreto es manejable.",
    positivo: "La exposición es manejable y con poco tiempo se puede migrar todo a métodos más seguros."
  },
  q12: {
    negativo: "Si tenías apps bancarias o redes abiertas, vale la pena revisar.",
    neutro: "Tener borrado remoto activado es buena precaución.",
    positivo: "Tener borrado remoto activado es buena precaución."
  },
  q13: {
    negativo: "Se activa desde la configuración del celular en unos minutos.",
    neutro: "La mayoría no sabe que existe. Activarlo toma pocos minutos.",
    positivo: "Casi nadie lo tiene activado. Buena protección."
  },
  q14: {
    negativo: "Conviene resolver todo antes de salir.",
    neutro: "Si viajas, conviene tener todo configurado antes de salir.",
    positivo: "Bien, hay margen para resolverlo con calma."
  },
  q15: {
    negativo: "Cualquiera de las dos opciones lleva al mismo resultado.",
    neutro: "Cualquiera de las dos opciones lleva al mismo resultado.",
    positivo: "Cualquiera de las dos opciones lleva al mismo resultado."
  }
};

const QUIZ_SYNTHESIS = {
  q1: {
    negativo: "No conocías el registro obligatorio de línea.",
    neutro: "Conoces el registro pero no has hecho nada al respecto.",
    positivo: "Tu línea ya está registrada ante la operadora."
  },
  q2: {
    negativo: "Usas la misma contraseña en varias cuentas.",
    neutro: "No tienes certeza de si repites contraseñas.",
    positivo: "Cada cuenta tiene su propia contraseña."
  },
  q3: {
    negativo: "Tus códigos de verificación llegan por SMS.",
    neutro: "No tienes verificación en dos pasos activada.",
    positivo: "Usas una app de autenticación para tus códigos."
  },
  q4: {
    negativo: "Tu correo solo se recupera por SMS.",
    neutro: "No sabes cómo se recupera tu correo principal.",
    positivo: "Tu correo tiene métodos de recuperación que no dependen del chip."
  },
  q5: {
    negativo: "Te conectas a Wi-Fi público sin protección.",
    neutro: "No usas Wi-Fi público.",
    positivo: "Usas VPN o datos móviles en redes públicas."
  },
  q6: {
    negativo: "Guardas contraseñas de memoria, en papel o en notas del celular.",
    neutro: "El navegador guarda tus contraseñas.",
    positivo: "Usas un gestor de contraseñas."
  },
  q7: {
    negativo: "Has recibido códigos de verificación que no pediste.",
    neutro: "No recuerdas si te han llegado códigos que no pediste.",
    positivo: "No te han llegado códigos que no hayas pedido."
  },
  q8: {
    negativo: "Tu celular perdió señal de forma inesperada.",
    neutro: "No sabes si tu celular ha perdido señal de forma inusual.",
    positivo: "Tu línea no ha presentado pérdidas de señal inusuales."
  },
  q9: {
    negativo: "Tienes cuentas con un número que ya no usas.",
    neutro: "No sabes si alguna cuenta tiene un número viejo.",
    positivo: "Actualizas tus datos de contacto cuando cambias de número."
  },
  q10: {
    negativo: "No tienes códigos de emergencia guardados fuera del celular.",
    neutro: "No tienes verificación en dos pasos activada.",
    positivo: "Tienes códigos de emergencia guardados fuera del celular."
  },
  q11: {
    negativo: "Más de 15 apps dependen de tu número.",
    neutro: "Entre 6 y 15 apps dependen de tu número.",
    positivo: "Menos de 5 apps dependen de tu número."
  },
  q12: {
    negativo: "Perdiste o te robaron el celular recientemente.",
    neutro: "No tienes medidas configuradas por si pierdes el celular.",
    positivo: "No has perdido ni te han robado el celular recientemente."
  },
  q13: {
    negativo: "Tu chip no tiene PIN activado.",
    neutro: "No sabías que el chip tiene opción de PIN.",
    positivo: "Tu chip tiene PIN activado."
  },
  q14: {
    negativo: "Tienes viaje planificado durante las fechas de transición.",
    neutro: "No sabes si estarás en México durante las fechas clave.",
    positivo: "Estarás en México durante las fechas de transición."
  }
};

// Exportación Global para el Navegador o Node.js
if (typeof window !== 'undefined') {
    window.RISK_CONFIG = RISK_CONFIG;
    window.calculateFinalRisk = calculateFinalRisk;
    window.POST_RESPONSES = POST_RESPONSES;
    window.QUIZ_SYNTHESIS = QUIZ_SYNTHESIS;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RISK_CONFIG, calculateFinalRisk, POST_RESPONSES, QUIZ_SYNTHESIS };
}

