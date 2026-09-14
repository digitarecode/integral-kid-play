-- Push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);
CREATE INDEX push_subscriptions_user_idx ON public.push_subscriptions (user_id) WHERE active;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own push subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scheduled reminders
CREATE TABLE public.scheduled_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  occurrence_id TEXT NOT NULL,
  practica_id TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  module_id TEXT NOT NULL,
  day_of_week SMALLINT NOT NULL,
  local_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  minutes_before SMALLINT NOT NULL DEFAULT 10,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scheduled_reminders_user_occurrence_key UNIQUE (user_id, occurrence_id),
  CONSTRAINT scheduled_reminders_day_check CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT scheduled_reminders_local_time_check CHECK (local_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  CONSTRAINT scheduled_reminders_minutes_check CHECK (minutes_before IN (0,5,10,15,30))
);
CREATE INDEX scheduled_reminders_due_idx ON public.scheduled_reminders (day_of_week, local_time) WHERE enabled;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reminders TO authenticated;
GRANT ALL ON public.scheduled_reminders TO service_role;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own scheduled reminders" ON public.scheduled_reminders
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notification deliveries (internal only)
CREATE TABLE public.notification_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID NOT NULL REFERENCES public.scheduled_reminders(id) ON DELETE CASCADE,
  scheduled_local_date DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  CONSTRAINT notification_deliveries_unique UNIQUE (reminder_id, scheduled_local_date)
);

GRANT ALL ON public.notification_deliveries TO service_role;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_reminders_updated_at
  BEFORE UPDATE ON public.scheduled_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();