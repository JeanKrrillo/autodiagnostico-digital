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
      text: "¿Cómo vas con la fecha del 1 de julio?", 
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
        negativo: { label: "Sí, tengo una o dos que uso en varios lugares", value: 40 }
      }
    },
    { 
      id: 3, 
      text: "Cuando te piden un código de verificación, ¿cómo te llega?", 
      opciones: {
        positivo: { label: "Lo genero en una app como Google Authenticator o Authy", value: 0 },
        neutro: { label: "No lo tengo activado o no lo sé", value: 20 },
        negativo: { label: "Me llega por mensaje de texto (SMS)", value: 40 }
      }
    },
    { 
      id: 4, 
      text: "Si hoy perdieras tu correo electrónico, ¿podrías recuperarlo sin usar tu número de celular?", 
      opciones: {
        positivo: { label: "Sí, tengo un correo alternativo o llaves de recuperación", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "No, el único método que tengo es un SMS", value: 40 }
      }
    },
    { 
      id: 5, 
      text: "Cuando usas Wi-Fi público, ¿qué haces normalmente?", 
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
        negativo: { label: "Las memorizo o las anoto en papel o en notas del celular", value: 40 }
      }
    },
    { 
      id: 7, 
      text: "¿Alguna vez te llegó un código de verificación que no pediste, de WhatsApp, tu correo o tu banco?", 
      opciones: {
        positivo: { label: "No, nunca", value: 0 },
        neutro: { label: "No lo recuerdo", value: 20 },
        negativo: { label: "Sí, me ha pasado al menos una vez", value: 40 }
      }
    },
    { 
      id: 8, 
      text: "¿Tu celular alguna vez perdió servicio de forma inesperada y sin razón clara?", 
      opciones: {
        positivo: { label: "No, nunca me ha pasado eso", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Sí, y tardó horas o días en volver", value: 40 }
      }
    },
    { 
      id: 9, 
      text: "¿Tienes cuentas importantes registradas con un número que ya no usas o que cancelaste?", 
      opciones: {
        positivo: { label: "No, siempre actualizo mis datos cuando cambio", value: 0 },
        neutro: { label: "No sé, nunca lo había pensado", value: 20 },
        negativo: { label: "Posiblemente sí, he cambiado de número sin actualizar todo", value: 40 }
      }
    },
    { 
      id: 10, 
      text: "¿Tienes respaldados los códigos de emergencia de tus cuentas más importantes, fuera de tu teléfono?", 
      opciones: {
        positivo: { label: "Sí, los tengo impresos o guardados fuera del celular", value: 0 },
        neutro: { label: "No tengo verificación en dos pasos activada", value: 20 },
        negativo: { label: "No, y no sabía que existían", value: 40 }
      }
    },
    { 
      id: 11, 
      text: "¿Cuántos servicios importantes crees que tienen guardado tu número de celular actual?", 
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
      text: "¿Tu chip tiene un PIN propio activado, diferente al que usas para desbloquear la pantalla?", 
      opciones: {
        positivo: { label: "Sí, tengo un PIN del chip configurado", value: 0 },
        neutro: { label: "No sabía que eso existía", value: 20 },
        negativo: { label: "No lo he configurado, pero quiero hacerlo", value: 40 }
      }
    },
    { 
      id: 14, 
      text: "¿Estarás fuera de México entre junio y julio de este año?", 
      opciones: {
        positivo: { label: "No, voy a estar en México", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Sí, tengo viaje planeado en esas fechas", value: 40 }
      }
    },
    { 
      id: 15, 
      text: "¿Cómo prefieres resolver lo que encontremos?", 
      opciones: {
        positivo: { label: "Prefiero que alguien me acompañe paso a paso en una sesión", value: 0 },
        neutro: { label: "No estoy seguro / No sé", value: 20 },
        negativo: { label: "Prefiero aprenderlo y hacerlo por mi cuenta con una guía", value: 40 }
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
    negativo: "No te preocupes, es normal y con este diagnóstico vamos a aclararlo poco a poco.",
    neutro: "Responder este diagnóstico ya es el primer paso 👍",
    positivo: "Bien. Ahora conviene revisar si las cuentas siguen dependiendo del SMS, porque registrar el número no resuelve eso."
  },
  q2: {
    negativo: "No te preocupes, es lo más común y tiene solución.",
    neutro: "Vale la pena auditar tus cuentas para asegurar que no repitas contraseñas.",
    positivo: "Muy bien, eso ya es un buen hábito."
  },
  q3: {
    negativo: "Es lo más común. Vamos a ver si conviene cambiarlo antes del 1 de julio.",
    neutro: "No te preocupes, muchas personas no lo saben y lo vamos a revisar.",
    positivo: "Muy bien, ese método no depende del número y es lo que conviene tener."
  },
  q4: {
    negativo: "Es lo más común y tiene solución, vamos a revisarlo.",
    neutro: "Es importante configurar correos alternativos de respaldo.",
    positivo: "Muy bien, eso es exactamente el respaldo que se necesita."
  },
  q5: {
    negativo: "Es lo más normal y es uno de los riesgos más fáciles de evitar.",
    neutro: "Perfecto, eso lo elimina por completo.",
    positivo: "Muy bien, eso evita ese tipo de intercepción."
  },
  q6: {
    negativo: "Es lo más común. El problema es que lleva a contraseñas simples o repetidas porque nadie puede memorizar 50 claves distintas.",
    neutro: "Es mejor que nada, aunque si alguien accede a la computadora desbloqueada, podría ver tus claves.",
    positivo: "Muy bien, genera claves difíciles de adivinar y las recuerda por ti."
  },
  q7: {
    negativo: "Ten cuidado, eso confirma que alguien tiene el número y lo está probando.",
    neutro: "Vale la pena estar más al pendiente de eso porque muchas personas los ignoran pensando que son errores.",
    positivo: "Bien, aunque puede cambiar, especialmente después del 1 de julio."
  },
  q8: {
    negativo: "Puede haber sido un fallo temporal o un intento de robo real. Si en esa época notaste algo raro en tus cuentas, vale la pena revisarlo.",
    neutro: "Mantente alerta a pérdidas repentinas de señal.",
    positivo: "Buena señal, aunque no descarta el riesgo."
  },
  q9: {
    negativo: "Es un riesgo. Nadie avisa cuando el número se reasigna y vale la pena revisar los datos de contacto del banco y del correo.",
    neutro: "Saber qué número tiene registrado cada cuenta toma pocos minutos y vale la pena revisarlo, si deseas asistencia, me puedes contactar.",
    positivo: "Muy bien, mantener eso actualizado es una de las cosas más sencillas"
  },
  q10: {
    negativo: "No te preocupes, la mayoría está en esa situación.",
    neutro: "Sin verificación en dos pasos, una contraseña filtrada es suficiente para perder el acceso completo. Es lo primero que conviene activar.",
    positivo: "Muy bien, un respaldo físico que no depende de señal ni batería es lo que se necesita 👍"
  },
  q11: {
    negativo: "Con ese nivel de dependencia, perder el número o que lo clonen afectaría varios servicios a la vez. Vamos a priorizar lo más crítico.",
    neutro: "Es la situación más común y con un plan concreto es manejable.",
    positivo: "La exposición es manejable y con poco tiempo se puede migrar todo a métodos más seguros."
  },
  q12: {
    negativo: "Si tenía apps bancarias o redes abiertas, vale la pena revisar si hubo actividad inusual después de eso.",
    neutro: "Configura el borrado remoto en tu dispositivo por prevención.",
    positivo: "Tener activado el borrado remoto es una buena precaución por si llega a ocurrir."
  },
  q13: {
    negativo: "No lo he configurado, pero quiero hacerlo. Si deseas asistencia, me puedes contactar👍",
    neutro: "No te preocupes, es lo más normal y activarlo toma pocos minutos. Si deseas asistencia, me puedes contactar👍",
    positivo: "Muy bien, si alguien roba el chip no puede usarlo sin ese código y es una protección que poca gente tiene."
  },
  q14: {
    negativo: "Eso hace más urgente resolver las vulnerabilidades antes de salir porque estando fuera las opciones se reducen bastante.",
    neutro: "Si viajas, considera asegurar tus cuentas con métodos offline.",
    positivo: "Bien, eso da margen para resolver lo necesario con calma."
  },
  q15: {
    negativo: "Cualquiera de las dos opciones lleva al mismo resultado.",
    neutro: "Cualquiera de las dos opciones lleva al mismo resultado.",
    positivo: "Cualquiera de las dos opciones lleva al mismo resultado."
  }
};

const QUIZ_SYNTHESIS = {
  q1: {
    negativo: "Desconocimiento sobre el registro obligatorio de tu línea ante la operadora.",
    neutro: "Falta de claridad sobre el registro obligatorio de tu línea telefónica.",
    positivo: "Registro preventivo de tu número celular ante la operadora telefónica."
  },
  q2: {
    negativo: "Uso de contraseñas repetidas en múltiples servicios críticos.",
    neutro: "Falta de certeza en la unicidad de las contraseñas utilizadas.",
    positivo: "Uso de una contraseña exclusiva y única para cada cuenta."
  },
  q3: {
    negativo: "Uso de códigos de verificación por SMS (vulnerable a SIM Swapping).",
    neutro: "Falta de un método seguro de verificación en dos pasos (2FA).",
    positivo: "Uso de aplicaciones de autenticación independientes (TOTP) para tus accesos."
  },
  q4: {
    negativo: "Centralización del respaldo de tu correo en la línea celular (SMS).",
    neutro: "Incertidumbre sobre los métodos de recuperación de tu correo principal.",
    positivo: "Métodos alternativos de recuperación de correo que no dependen del chip."
  },
  q5: {
    negativo: "Conexión desprotegida a redes Wi-Fi públicas de libre acceso.",
    neutro: "Prevención de riesgos al evitar el uso de redes Wi-Fi públicas.",
    positivo: "Uso de VPN o datos móviles para proteger tu tráfico en redes públicas."
  },
  q6: {
    negativo: "Almacenamiento de claves en papel, notas del celular o memoria física perezosa.",
    neutro: "Dependencia exclusiva del navegador web para recordar tus contraseñas.",
    positivo: "Uso de un gestor de contraseñas dedicado para almacenar y encriptar tus claves."
  },
  q7: {
    negativo: "Recepción de códigos de verificación no solicitados (posible intrusión).",
    neutro: "Posibles solicitudes de códigos no registrados o ignorados.",
    positivo: "Sin reportes ni recepciones sospechosas de códigos ajenos."
  },
  q8: {
    negativo: "Historial de pérdida sospechosa de señal móvil en tu dispositivo.",
    neutro: "Incertidumbre ante posibles incidentes previos de caída de señal de red.",
    positivo: "Línea móvil estable sin pérdidas de servicio injustificadas."
  },
  q9: {
    negativo: "Cuentas registradas con números telefónicos antiguos u obsoletos.",
    neutro: "Posible existencia de cuentas ligadas a números de teléfono que ya no posees.",
    positivo: "Actualización sistemática de tus datos de contacto en cada servicio."
  },
  q10: {
    negativo: "Falta de códigos de emergencia respaldados fuera de tus dispositivos.",
    neutro: "Cuentas expuestas por no tener activada la verificación en dos pasos.",
    positivo: "Respaldo físico y externo de los códigos de emergencia de tus cuentas."
  },
  q11: {
    negativo: "Exposición crítica: más de 15 aplicaciones vinculadas directamente al SMS.",
    neutro: "Exposición moderada: entre 6 y 15 aplicaciones vinculadas a tu número celular.",
    positivo: "Exposición baja: menos de 5 aplicaciones asociadas a tu número telefónico."
  },
  q12: {
    negativo: "Incidente de robo o extravío de dispositivo móvil en el último año.",
    neutro: "Falta de medidas preventivas ante posible pérdida o robo de equipo.",
    positivo: "Sin incidentes recientes de pérdida o robo de tu dispositivo."
  },
  q13: {
    negativo: "Falta de configuración de un PIN de seguridad en tu tarjeta SIM física.",
    neutro: "Desconocimiento sobre la protección por PIN de la tarjeta SIM física.",
    positivo: "Tarjeta SIM física protegida con un PIN de bloqueo personalizado."
  },
  q14: {
    negativo: "Viaje al extranjero planificado durante el periodo crítico de transición de línea.",
    neutro: "Posible ausencia del país durante fechas clave para la gestión de tu línea.",
    positivo: "Estancia en el país durante las fechas de transición, asegurando soporte."
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

