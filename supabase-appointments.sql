-- AMREAL appointments & availability
-- Run after supabase-schema.sql in the Supabase SQL editor.
-- Public customers can read active services and use the booking RPCs. Appointment
-- and admin data remain protected by RLS; admin table access requires Supabase Auth.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 5 AND 720),
  buffer_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_minutes BETWEEN 0 AND 240),
  eligible_employees TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.availability_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  opens_at TIME NOT NULL DEFAULT '10:00',
  closes_at TIME NOT NULL DEFAULT '18:00',
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_interval_minutes BETWEEN 5 AND 240),
  buffer_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_minutes BETWEEN 0 AND 240),
  breaks JSONB NOT NULL DEFAULT '[]'::JSONB,
  advance_booking_days INTEGER NOT NULL DEFAULT 60 CHECK (advance_booking_days BETWEEN 1 AND 730),
  minimum_notice_hours INTEGER NOT NULL DEFAULT 2 CHECK (minimum_notice_hours BETWEEN 0 AND 8760),
  max_daily_bookings INTEGER NOT NULL DEFAULT 12 CHECK (max_daily_bookings BETWEEN 1 AND 500),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (closes_at > opens_at)
);

DROP INDEX IF EXISTS public.availability_settings_business_day;
CREATE UNIQUE INDEX availability_settings_business_day
  ON public.availability_settings (weekday, is_demo) WHERE service_id IS NULL;
DROP INDEX IF EXISTS public.availability_settings_service_day;
CREATE UNIQUE INDEX availability_settings_service_day
  ON public.availability_settings (service_id, weekday, is_demo) WHERE service_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.employee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  is_working BOOLEAN NOT NULL DEFAULT TRUE,
  opens_at TIME NOT NULL DEFAULT '10:00',
  closes_at TIME NOT NULL DEFAULT '18:00',
  breaks JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, weekday),
  CHECK (closes_at > opens_at)
);

CREATE TABLE IF NOT EXISTS public.employee_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show')),
  notes TEXT NOT NULL DEFAULT '',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.appointment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_booking', 'confirmed', 'cancelled', 'rescheduled')),
  channel TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.appointment_audit_history (
  id BIGSERIAL PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_starts_at_idx ON public.appointments (starts_at);
CREATE INDEX IF NOT EXISTS appointments_service_starts_at_idx ON public.appointments (service_id, starts_at);
CREATE INDEX IF NOT EXISTS appointments_customer_phone_idx ON public.appointments (phone);
CREATE INDEX IF NOT EXISTS appointments_status_starts_at_idx ON public.appointments (status, starts_at);
CREATE INDEX IF NOT EXISTS blocked_slots_period_idx ON public.blocked_slots (starts_at, ends_at);
CREATE INDEX IF NOT EXISTS employee_time_off_period_idx ON public.employee_time_off (employee_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS appointment_notifications_status_idx ON public.appointment_notifications (status, created_at);

CREATE OR REPLACE FUNCTION public.set_appointment_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS services_updated_at ON public.services;
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_appointment_updated_at();
DROP TRIGGER IF EXISTS availability_settings_updated_at ON public.availability_settings;
CREATE TRIGGER availability_settings_updated_at BEFORE UPDATE ON public.availability_settings
FOR EACH ROW EXECUTE FUNCTION public.set_appointment_updated_at();
DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.set_appointment_updated_at();
DROP TRIGGER IF EXISTS employee_schedules_updated_at ON public.employee_schedules;
CREATE TRIGGER employee_schedules_updated_at BEFORE UPDATE ON public.employee_schedules
FOR EACH ROW EXECUTE FUNCTION public.set_appointment_updated_at();

CREATE OR REPLACE FUNCTION public.audit_appointment_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.appointment_audit_history (appointment_id, action, old_values, new_values, actor_id)
  VALUES (
    NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN OLD.starts_at IS DISTINCT FROM NEW.starts_at THEN 'rescheduled'
      WHEN OLD.status IS DISTINCT FROM NEW.status THEN NEW.status
      ELSE 'updated' END,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS appointments_audit ON public.appointments;
CREATE TRIGGER appointments_audit AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.audit_appointment_changes();

CREATE OR REPLACE FUNCTION public.notify_appointment_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE event_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    event_name := 'new_booking';
  ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmed' THEN
    event_name := 'confirmed';
  ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'cancelled' THEN
    event_name := 'cancelled';
  ELSIF OLD.starts_at IS DISTINCT FROM NEW.starts_at THEN
    event_name := 'rescheduled';
  ELSE
    RETURN NEW;
  END IF;
  INSERT INTO public.appointment_notifications (appointment_id, event_type, payload)
  VALUES (NEW.id, event_name, jsonb_build_object(
    'booking_id', NEW.booking_id, 'customer_name', NEW.customer_name,
    'phone', NEW.phone, 'email', NEW.email, 'starts_at', NEW.starts_at
  ));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS appointments_notify ON public.appointments;
CREATE TRIGGER appointments_notify AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_change();

DROP FUNCTION IF EXISTS public.get_available_appointment_slots(UUID, DATE);
CREATE FUNCTION public.get_available_appointment_slots(
  p_service_id UUID,
  p_date DATE,
  p_exclude_appointment UUID DEFAULT NULL
)
RETURNS TABLE(slot_time TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  svc public.services%ROWTYPE;
  setting public.availability_settings%ROWTYPE;
  local_start TIMESTAMP;
  local_end TIMESTAMP;
  slot_end TIMESTAMP;
  start_at TIMESTAMPTZ;
  end_at TIMESTAMPTZ;
  day_count INTEGER;
  dow SMALLINT;
BEGIN
  SELECT * INTO svc FROM public.services WHERE id = p_service_id AND active = TRUE;
  IF NOT FOUND THEN RETURN; END IF;
  IF svc.is_demo AND auth.uid() IS NULL THEN RETURN; END IF;
  IF p_date < (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE THEN RETURN; END IF;
  dow := EXTRACT(DOW FROM p_date)::SMALLINT;
  SELECT * INTO setting FROM public.availability_settings
    WHERE service_id = p_service_id AND weekday = dow AND is_demo = svc.is_demo;
  IF NOT FOUND THEN
    SELECT * INTO setting FROM public.availability_settings
      WHERE service_id IS NULL AND weekday = dow AND is_demo = svc.is_demo;
  END IF;
  IF NOT FOUND OR NOT setting.is_open THEN RETURN; END IF;
  IF p_date > (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + setting.advance_booking_days THEN RETURN; END IF;
  SELECT count(*) INTO day_count FROM public.appointments a
    WHERE a.starts_at >= (p_date::TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
      AND a.starts_at < ((p_date + 1)::TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
      AND a.status IN ('pending', 'confirmed') AND a.is_demo = svc.is_demo
      AND a.id IS DISTINCT FROM p_exclude_appointment;
  IF day_count >= setting.max_daily_bookings THEN RETURN; END IF;

  local_start := p_date + setting.opens_at;
  local_end := p_date + setting.closes_at;
  WHILE local_start + make_interval(mins => svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes) <= local_end LOOP
    slot_end := local_start + make_interval(mins => svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes);
    start_at := local_start AT TIME ZONE 'Asia/Kolkata';
    end_at := slot_end AT TIME ZONE 'Asia/Kolkata';
    IF start_at >= NOW() + make_interval(hours => setting.minimum_notice_hours)
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(setting.breaks) b
        WHERE local_start::TIME < (b->>'end')::TIME
          AND slot_end::TIME > (b->>'start')::TIME
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.blocked_slots bs
        WHERE bs.is_demo = svc.is_demo AND (bs.service_id IS NULL OR bs.service_id = p_service_id)
          AND bs.starts_at < end_at AND bs.ends_at > start_at
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.is_demo = svc.is_demo AND a.status IN ('pending', 'confirmed')
          AND a.id IS DISTINCT FROM p_exclude_appointment
          AND a.starts_at < end_at AND a.ends_at > start_at
          AND (cardinality(svc.eligible_employees) = 0 OR a.employee_id IS NULL)
      )
      AND (
        cardinality(svc.eligible_employees) = 0
        OR EXISTS (
          SELECT 1 FROM unnest(svc.eligible_employees) eligible(name)
          JOIN public.employees e ON e.name = eligible.name AND e.active = TRUE
          JOIN public.employee_schedules es ON es.employee_id = e.id
            AND es.weekday = dow AND es.is_working
            AND local_start::TIME >= es.opens_at AND slot_end::TIME <= es.closes_at
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(es.breaks) b
            WHERE local_start::TIME < (b->>'end')::TIME AND slot_end::TIME > (b->>'start')::TIME
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.employee_time_off off
            WHERE off.employee_id = e.id AND off.starts_at < end_at AND off.ends_at > start_at
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.employee_id = e.id AND a.is_demo = svc.is_demo
              AND a.status IN ('pending', 'confirmed') AND a.id IS DISTINCT FROM p_exclude_appointment
              AND a.starts_at < end_at AND a.ends_at > start_at
          )
        )
      )
    THEN
      slot_time := to_char(local_start, 'HH24:MI');
      RETURN NEXT;
    END IF;
    local_start := local_start + make_interval(mins => setting.slot_interval_minutes);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_appointment_booking(
  p_service_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_customer_name TEXT,
  p_phone TEXT,
  p_email TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  svc public.services%ROWTYPE;
  setting public.availability_settings%ROWTYPE;
  booking_start TIMESTAMPTZ;
  booking_end TIMESTAMPTZ;
  employee UUID;
  result_row public.appointments%ROWTYPE;
  demo_mode BOOLEAN;
  dow SMALLINT;
BEGIN
  IF length(trim(p_customer_name)) NOT BETWEEN 1 AND 120
    OR length(trim(p_phone)) NOT BETWEEN 7 AND 32
    OR length(trim(p_email)) NOT BETWEEN 3 AND 254 THEN
    RAISE EXCEPTION 'Please enter a valid name, phone number and email address.';
  END IF;
  SELECT * INTO svc FROM public.services WHERE id = p_service_id AND active = TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This service is not currently available.'; END IF;
  demo_mode := svc.is_demo;
  IF demo_mode AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Demo services are only available in the admin demonstration workspace.';
  END IF;
  dow := EXTRACT(DOW FROM p_date)::SMALLINT;
  SELECT * INTO setting FROM public.availability_settings
    WHERE service_id = p_service_id AND weekday = dow AND is_demo = demo_mode;
  IF NOT FOUND THEN
    SELECT * INTO setting FROM public.availability_settings
      WHERE service_id IS NULL AND weekday = dow AND is_demo = demo_mode;
  END IF;
  IF NOT FOUND OR NOT setting.is_open THEN
    RAISE EXCEPTION 'This service is not available on the selected date.';
  END IF;
  booking_start := (p_date + p_start_time) AT TIME ZONE 'Asia/Kolkata';

  -- Serialize every booking on a local business date, then recheck before insert.
  PERFORM pg_advisory_xact_lock(hashtext(p_date::TEXT));
  IF NOT EXISTS (
    SELECT 1 FROM public.get_available_appointment_slots(p_service_id, p_date) s
    WHERE s.slot_time = to_char(p_start_time, 'HH24:MI')
  ) THEN
    RAISE EXCEPTION 'That appointment slot is no longer available. Please choose another time.';
  END IF;

  booking_end := booking_start + make_interval(mins =>
    svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes);
  IF cardinality(svc.eligible_employees) > 0 THEN
    SELECT e.id INTO employee
    FROM unnest(svc.eligible_employees) eligible(name)
    JOIN public.employees e ON e.name = eligible.name AND e.active
    JOIN public.employee_schedules es ON es.employee_id = e.id
      AND es.weekday = EXTRACT(DOW FROM p_date)::SMALLINT AND es.is_working
      AND p_start_time >= es.opens_at
      AND p_start_time + make_interval(mins =>
        svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes) <= es.closes_at
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(es.breaks) b
        WHERE p_start_time < (b->>'end')::TIME
          AND p_start_time + make_interval(mins =>
            svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes) > (b->>'start')::TIME
      )
    WHERE NOT EXISTS (
      SELECT 1 FROM public.employee_time_off off
      WHERE off.employee_id = e.id AND off.starts_at < booking_end AND off.ends_at > booking_start
    )
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a WHERE a.employee_id = e.id AND a.is_demo = demo_mode
          AND a.status IN ('pending', 'confirmed') AND a.starts_at < booking_end AND a.ends_at > booking_start
      )
    ORDER BY e.name LIMIT 1;
    IF employee IS NULL THEN RAISE EXCEPTION 'No eligible employee is available for that time.'; END IF;
  END IF;

  INSERT INTO public.appointments (
    booking_id, customer_name, phone, email, service_id, employee_id, starts_at, ends_at, status, is_demo
  ) VALUES (
    CASE WHEN demo_mode THEN 'AM-DEMO-' ELSE 'AM-' END || upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 8)),
    trim(p_customer_name), trim(p_phone), lower(trim(p_email)), p_service_id, employee,
    booking_start, booking_end, 'pending', demo_mode
  ) RETURNING * INTO result_row;
  RETURN to_jsonb(result_row) || jsonb_build_object('service_name', svc.name);
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_appointment_booking(
  p_appointment_id UUID,
  p_date DATE,
  p_start_time TIME
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  booking public.appointments%ROWTYPE;
  svc public.services%ROWTYPE;
  setting public.availability_settings%ROWTYPE;
  booking_start TIMESTAMPTZ;
  booking_end TIMESTAMPTZ;
  employee UUID;
  dow SMALLINT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Administrator sign-in is required.'; END IF;
  SELECT * INTO booking FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND OR booking.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Only pending or confirmed appointments can be rescheduled.';
  END IF;
  SELECT * INTO svc FROM public.services WHERE id = booking.service_id AND active = TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This service is not currently available.'; END IF;
  dow := EXTRACT(DOW FROM p_date)::SMALLINT;
  SELECT * INTO setting FROM public.availability_settings
    WHERE service_id = booking.service_id AND weekday = dow AND is_demo = booking.is_demo;
  IF NOT FOUND THEN
    SELECT * INTO setting FROM public.availability_settings
      WHERE service_id IS NULL AND weekday = dow AND is_demo = booking.is_demo;
  END IF;
  IF NOT FOUND OR NOT setting.is_open THEN RAISE EXCEPTION 'This service is not available on the selected date.'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext(LEAST(
    (booking.starts_at AT TIME ZONE 'Asia/Kolkata')::DATE::TEXT, p_date::TEXT)));
  PERFORM pg_advisory_xact_lock(hashtext(GREATEST(
    (booking.starts_at AT TIME ZONE 'Asia/Kolkata')::DATE::TEXT, p_date::TEXT)));
  IF NOT EXISTS (
    SELECT 1 FROM public.get_available_appointment_slots(
      booking.service_id, p_date, p_appointment_id
    ) s WHERE s.slot_time = to_char(p_start_time, 'HH24:MI')
  ) THEN
    RAISE EXCEPTION 'That appointment slot is no longer available. Please choose another time.';
  END IF;

  booking_start := (p_date + p_start_time) AT TIME ZONE 'Asia/Kolkata';
  booking_end := booking_start + make_interval(mins =>
    svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes);
  IF cardinality(svc.eligible_employees) > 0 THEN
    SELECT e.id INTO employee
    FROM unnest(svc.eligible_employees) eligible(name)
    JOIN public.employees e ON e.name = eligible.name AND e.active = TRUE
    JOIN public.employee_schedules es ON es.employee_id = e.id
      AND es.weekday = dow AND es.is_working
      AND p_start_time >= es.opens_at
      AND p_start_time + make_interval(mins =>
        svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes) <= es.closes_at
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(es.breaks) b
      WHERE p_start_time < (b->>'end')::TIME
        AND p_start_time + make_interval(mins =>
          svc.duration_minutes + svc.buffer_minutes + setting.buffer_minutes) > (b->>'start')::TIME
    )
      AND NOT EXISTS (
        SELECT 1 FROM public.employee_time_off off
        WHERE off.employee_id = e.id AND off.starts_at < booking_end AND off.ends_at > booking_start
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.employee_id = e.id AND a.is_demo = booking.is_demo
          AND a.status IN ('pending', 'confirmed') AND a.id <> p_appointment_id
          AND a.starts_at < booking_end AND a.ends_at > booking_start
      )
    ORDER BY e.name LIMIT 1;
    IF employee IS NULL THEN RAISE EXCEPTION 'No eligible employee is available for that time.'; END IF;
  END IF;

  UPDATE public.appointments
  SET starts_at = booking_start, ends_at = booking_end, employee_id = employee
  WHERE id = p_appointment_id;
END;
$$;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_audit_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active services" ON public.services;
CREATE POLICY "Public read active services" ON public.services FOR SELECT USING (active = TRUE AND is_demo = FALSE);
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'services', 'employees', 'availability_settings', 'employee_schedules',
    'employee_time_off', 'blocked_slots', 'appointments',
    'appointment_notifications', 'appointment_audit_history'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Authenticated appointment admin ' || table_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      'Authenticated appointment admin ' || table_name, table_name
    );
  END LOOP;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
    ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_appointment_slots(UUID, DATE, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_appointment_booking(UUID, DATE, TIME, TEXT, TEXT, TEXT) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.reschedule_appointment_booking(UUID, DATE, TIME) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reschedule_appointment_booking(UUID, DATE, TIME) TO authenticated;

INSERT INTO public.services (id, name, description, duration_minutes, buffer_minutes, active, is_demo)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'Product Consultation', 'Personalized product and routine consultation.', 30, 10, TRUE, TRUE),
  ('00000000-0000-4000-8000-000000000002', 'Product Demonstration', 'A guided demonstration of AMREAL professional products.', 45, 15, TRUE, TRUE),
  ('00000000-0000-4000-8000-000000000003', 'Salon Consultation', 'Discuss salon treatments and professional protocols.', 45, 10, TRUE, TRUE),
  ('00000000-0000-4000-8000-000000000004', 'Professional Meeting', 'Meet with the AMREAL professional team.', 60, 0, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.availability_settings (weekday, is_open, opens_at, closes_at, slot_interval_minutes, buffer_minutes, breaks, advance_booking_days, minimum_notice_hours, max_daily_bookings, is_demo)
SELECT day, day <> 0, '10:00', '18:00', 30, 10, '[{"start":"13:00","end":"14:00"}]'::JSONB, 60, 2, 12, TRUE
FROM generate_series(0, 6) AS day
ON CONFLICT (weekday, is_demo) WHERE service_id IS NULL DO NOTHING;

INSERT INTO public.appointments (booking_id, customer_name, phone, email, service_id, starts_at, ends_at, status, notes, is_demo)
VALUES
  ('AM-DEMO-001', 'Priya Sharma', '+91 98765 43210', 'priya@example.com', '00000000-0000-4000-8000-000000000001', (((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + 1 + TIME '11:00') AT TIME ZONE 'Asia/Kolkata'), (((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + 1 + TIME '11:50') AT TIME ZONE 'Asia/Kolkata'), 'pending', '', TRUE),
  ('AM-DEMO-002', 'Ananya Mehta', '+91 98123 45678', 'ananya@example.com', '00000000-0000-4000-8000-000000000003', (((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + 1 + TIME '14:00') AT TIME ZONE 'Asia/Kolkata'), (((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + 1 + TIME '15:05') AT TIME ZONE 'Asia/Kolkata'), 'confirmed', 'Interested in a salon treatment plan.', TRUE),
  ('AM-DEMO-003', 'Rohan Kapoor', '+91 99887 76655', 'rohan@example.com', '00000000-0000-4000-8000-000000000002', (((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + 3 + TIME '12:00') AT TIME ZONE 'Asia/Kolkata'), (((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE + 3 + TIME '13:10') AT TIME ZONE 'Asia/Kolkata'), 'confirmed', '', TRUE)
ON CONFLICT (booking_id) DO NOTHING;
