// Eventos inesperados: interrumpen la misión entre el reto y la comunicación.
// Se elige uno al azar en cada partida. Cada opción incorrecta explica por qué.
// PENDIENTE: validación del equipo docente y ajuste a protocolos locales.

export const EVENTS = [
  {
    id: "spo2",
    title: "¡Alarma de saturación!",
    alarm:
      "Suena la alarma del pulsioxímetro y la curva desaparece del monitor.",
    options: [
      {
        text: "Avisar de inmediato a anestesia y comprobar que el sensor sigue colocado.",
        safe: !0,
      },
      {
        text: "Silenciar la alarma: seguramente es el sensor.",
        safe: !1,
        why: "Suponer un fallo del sensor puede ocultar una desaturación real; anestesia debe valorarlo.",
      },
      {
        text: "Seguir con tu tarea: anestesia ya lo verá.",
        safe: !1,
        why: "Toda alarma se comunica; no se da por hecho que otra persona la atendió.",
      },
    ],
    good: "Anestesia confirmó que el sensor se había desplazado. La curva vuelve.",
  },
  {
    id: "gasa",
    title: "¡Gasa al suelo!",
    alarm: "Una gasa cae al suelo durante el procedimiento.",
    options: [
      {
        text: "Avisar a la circulante para dejarla a la vista y registrarla en el conteo.",
        safe: !0,
      },
      {
        text: "Tirarla al cubo para mantener la sala ordenada.",
        safe: !1,
        why: "Si sale del conteo sin registrarse, al cierre aparecerá una discrepancia difícil de conciliar.",
      },
      {
        text: "Recogerla y devolverla a la mesa si parece limpia.",
        safe: !1,
        why: "Lo que cae al suelo deja de ser estéril y no vuelve al campo.",
      },
    ],
    good: "La gasa quedó visible y registrada. El conteo sigue siendo fiable.",
  },
  {
    id: "guante",
    title: "¡Guante perforado!",
    alarm: "Notas una perforación en tu guante en pleno procedimiento.",
    options: [
      {
        text: "Avisar, apartarte del campo y cambiar el guante según el protocolo.",
        safe: !0,
      },
      {
        text: "Ponerte otro guante encima sin retirar el perforado.",
        safe: !1,
        why: "Un guante roto ya no es una barrera estéril; se retira y se sustituye según el protocolo.",
      },
      {
        text: "Terminar este paso y cambiarlo después.",
        safe: !1,
        why: "Seguir trabajando con la barrera rota compromete el campo y tu protección.",
      },
    ],
    good: "Cambiaste el guante y el campo se mantuvo estéril.",
  },
  {
    id: "instrumento",
    title: "¡Instrumento al suelo!",
    alarm: "Un instrumento que el cirujano va a necesitar cae al suelo.",
    options: [
      {
        text: "Avisar, apartarlo del uso y pedir uno estéril de reemplazo.",
        safe: !0,
      },
      {
        text: "Limpiarlo con una gasa estéril y devolverlo a la mesa.",
        safe: !1,
        why: "Limpiarlo no lo reesteriliza: se retira y se sustituye.",
      },
      {
        text: "Dejarlo en el suelo sin decir nada.",
        safe: !1,
        why: "El equipo debe saberlo: falta una pieza y hay que conciliarla en el conteo.",
      },
    ],
    good: "Llegó un reemplazo estéril y la pieza caída quedó registrada.",
  },
  {
    id: "lampara",
    title: "¡Falla la lámpara!",
    alarm: "La lámpara principal parpadea y pierde intensidad sobre el campo.",
    options: [
      {
        text: "Avisar al equipo y pedir a la circulante que la ajuste o cambie a la auxiliar.",
        safe: !0,
      },
      {
        text: "Moverla tú desde el mango de la estructura, que no es estéril.",
        safe: !1,
        why: "Con bata y guantes estériles solo se tocan los mangos estériles; el resto lo ajusta la circulante.",
      },
      {
        text: "Esperar a que el cirujano lo note.",
        safe: !1,
        why: "Una visibilidad reducida es un riesgo: se comunica en cuanto se detecta.",
      },
    ],
    good: "La circulante activó la lámpara auxiliar. El campo vuelve a estar iluminado.",
  },
  {
    id: "puerta",
    title: "¡Puerta abierta!",
    alarm:
      "Alguien mantiene la puerta del quirófano abierta mientras conversa.",
    options: [
      {
        text: "Pedir con respeto que la cierre para mantener el ambiente controlado.",
        safe: !0,
      },
      {
        text: "No decir nada: no es tu responsabilidad.",
        safe: !1,
        why: "La seguridad del ambiente es de todo el equipo; se comunica con respeto.",
      },
      {
        text: "Ir a cerrarla tú, aunque tengas que salir del campo estéril.",
        safe: !1,
        why: "Salir del campo lo compromete; se pide a quien no está vestido de forma estéril.",
      },
    ],
    good: "La puerta se cerró y el flujo de aire volvió a ser el previsto.",
  },
];
