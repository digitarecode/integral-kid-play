import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const VENTANA_MINUTOS = 5;

const tituloRecordatorio = (actividad: string) => `⏰ ¡Casi es hora de ${actividad}!`;

const cuerpoRecordatorio = (hora: string, minutosAntes: number) => {
  if (minutosAntes <= 0) return `Empieza ahora, a las ${hora}. ¡Vamos! 🌟`;
  return `Empieza en ${minutosAntes} minutos, a las ${hora}. ¡Prepárate! 🌟`;
};

interface HoraLocal {
  minutos: number;
  diaSemana: number;
  fecha: string;
}

const horaLocal = (zona: string): HoraLocal => {
  const ahora = new Date();
  let formateador: Intl.DateTimeFormat;
  try {
    formateador = new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hour12: false,
    });
  } catch {
    formateador = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hour12: false,
    });
  }

  const partes = formateador.formatToParts(ahora);
  const valor = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '00';
  const dias: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hora = Number(valor('hour')) % 24;
  const minuto = Number(valor('minute'));

  return {
    minutos: hora * 60 + minuto,
    diaSemana: dias[valor('weekday')] ?? 0,
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
  };
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:reminders@example.com';

  if (!publicKey || !privateKey) {
    return new Response(JSON.stringify({ error: 'Faltan las claves VAPID' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data: recordatorios, error } = await supabase
    .from('scheduled_reminders')
    .select('*')
    .eq('enabled', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let enviados = 0;
  let omitidos = 0;

  for (const recordatorio of recordatorios ?? []) {
    const local = horaLocal(recordatorio.timezone || 'UTC');
    const [hh, mm] = String(recordatorio.local_time).split(':').map(Number);
    let objetivo = hh * 60 + mm - Number(recordatorio.minutes_before ?? 0);
    let diaObjetivo = Number(recordatorio.day_of_week);

    // Si el aviso cae el día anterior por la antelación, ajusta el día.
    if (objetivo < 0) {
      objetivo += 24 * 60;
      diaObjetivo = (diaObjetivo + 6) % 7;
    }

    const enVentana =
      local.diaSemana === diaObjetivo && local.minutos >= objetivo && local.minutos < objetivo + VENTANA_MINUTOS;

    if (!enVentana) {
      omitidos += 1;
      continue;
    }

    // Anti-duplicados: una sola entrega por recordatorio y fecha local.
    const { error: errorMarca } = await supabase
      .from('notification_deliveries')
      .insert({ reminder_id: recordatorio.id, scheduled_local_date: local.fecha });

    if (errorMarca) {
      omitidos += 1;
      continue;
    }

    const { data: suscripciones } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', recordatorio.user_id)
      .eq('active', true);

    const payload = JSON.stringify({
      title: tituloRecordatorio(recordatorio.activity_title),
      body: cuerpoRecordatorio(recordatorio.local_time, Number(recordatorio.minutes_before ?? 0)),
      url: '/',
      tag: `matriz-${recordatorio.occurrence_id}`,
    });

    for (const suscripcion of suscripciones ?? []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: suscripcion.endpoint,
            keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth },
          },
          payload,
        );
        enviados += 1;
      } catch (e) {
        const statusCode = (e as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').update({ active: false }).eq('endpoint', suscripcion.endpoint);
        }
        await supabase
          .from('notification_deliveries')
          .update({ status: 'error', error_message: String((e as Error).message ?? e) })
          .eq('reminder_id', recordatorio.id)
          .eq('scheduled_local_date', local.fecha);
      }
    }
  }

  return new Response(JSON.stringify({ enviados, omitidos, total: recordatorios?.length ?? 0 }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
