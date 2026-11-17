import { isSupabaseConfigured, supabase } from "./supabase";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "no_show";
export type AppointmentService = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  buffer_minutes: number;
  active: boolean;
  employee_ids?: string[];
  is_demo?: boolean;
};
export type AppointmentRecord = {
  id: string;
  booking_id: string;
  customer_name: string;
  phone: string;
  email: string;
  service_id: string;
  employee_id?: string | null;
  service_name?: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  is_demo?: boolean;
};
export type Employee = {
  id: string;
  name: string;
  active: boolean;
  is_demo?: boolean;
};
export type EmployeeSchedule = {
  id?: string;
  employee_id: string;
  weekday: number;
  is_working: boolean;
  opens_at: string;
  closes_at: string;
  breaks: BreakPeriod[];
  is_demo?: boolean;
};
export type EmployeeTimeOff = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  is_demo?: boolean;
};
export type AppointmentNotification = {
  id: string;
  appointment_id: string;
  event_type: "new_booking" | "confirmed" | "cancelled" | "rescheduled";
  created_at: string;
  status: string;
};
export type BreakPeriod = { start: string; end: string };
export type AvailabilityDay = {
  id?: string;
  weekday: number;
  service_id: string | null;
  is_open: boolean;
  opens_at: string;
  closes_at: string;
  slot_interval_minutes: number;
  buffer_minutes: number;
  breaks: BreakPeriod[];
  advance_booking_days: number;
  minimum_notice_hours: number;
  max_daily_bookings: number;
  is_demo?: boolean;
};
export type BlockedSlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  is_holiday: boolean;
  is_demo?: boolean;
};
export type AppointmentBundle = {
  services: AppointmentService[];
  appointments: AppointmentRecord[];
  employees: Employee[];
  employeeSchedules: EmployeeSchedule[];
  employeeTimeOff: EmployeeTimeOff[];
  availability: AvailabilityDay[];
  blocked: BlockedSlot[];
  notifications: AppointmentNotification[];
  demo: boolean;
};

const STORAGE_KEY = "amreal_appointment_demo_v1";
const ACTIVE_STATUSES: AppointmentStatus[] = ["pending", "confirmed"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type DemoStore = Pick<AppointmentBundle, "services" | "appointments" | "employees" | "employeeSchedules" | "employeeTimeOff" | "availability" | "blocked" | "notifications">;

function dateInIndia(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function localDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00+05:30`).toISOString();
}

function seedDemoStore(): DemoStore {
  const services: AppointmentService[] = [
    { id: "demo-service-consultation", name: "Product Consultation", description: "Personalized product and routine consultation.", duration_minutes: 30, buffer_minutes: 10, active: true, is_demo: true },
    { id: "demo-service-demo", name: "Product Demonstration", description: "A guided demonstration of AMREAL professional products.", duration_minutes: 45, buffer_minutes: 15, active: true, is_demo: true },
    { id: "demo-service-salon", name: "Salon Consultation", description: "Discuss salon treatments and professional protocols.", duration_minutes: 45, buffer_minutes: 10, active: true, is_demo: true },
    { id: "demo-service-meeting", name: "Professional Meeting", description: "Meet with the AMREAL professional team.", duration_minutes: 60, buffer_minutes: 0, active: true, is_demo: true },
  ];
  const today = dateInIndia(new Date());
  const tomorrow = new Date(`${today}T12:00:00+05:30`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const tomorrowDate = dateInIndia(tomorrow);
  const dayAfterDate = dateInIndia(dayAfter);
  const appointments: AppointmentRecord[] = [
    {
      id: "demo-appointment-1", booking_id: "AM-DEMO-001", customer_name: "Priya Sharma", phone: "+91 98765 43210",
      email: "priya@example.com", service_id: services[0].id, service_name: services[0].name,
      starts_at: localDateTime(tomorrowDate, "11:00"), ends_at: localDateTime(tomorrowDate, "11:50"),
      status: "pending", notes: "", created_at: new Date().toISOString(), is_demo: true,
    },
    {
      id: "demo-appointment-2", booking_id: "AM-DEMO-002", customer_name: "Ananya Mehta", phone: "+91 98123 45678",
      email: "ananya@example.com", service_id: services[2].id, service_name: services[2].name,
      starts_at: localDateTime(tomorrowDate, "14:00"), ends_at: localDateTime(tomorrowDate, "15:05"),
      status: "confirmed", notes: "Interested in a salon treatment plan.", created_at: new Date().toISOString(), is_demo: true,
    },
    {
      id: "demo-appointment-3", booking_id: "AM-DEMO-003", customer_name: "Rohan Kapoor", phone: "+91 99887 76655",
      email: "rohan@example.com", service_id: services[1].id, service_name: services[1].name,
      starts_at: localDateTime(dayAfterDate, "12:00"), ends_at: localDateTime(dayAfterDate, "13:10"),
      status: "confirmed", notes: "", created_at: new Date().toISOString(), is_demo: true,
    },
  ];
  const availability = DAY_NAMES.map((_, weekday): AvailabilityDay => ({
    weekday, service_id: null, is_open: weekday !== 0, opens_at: "10:00", closes_at: "18:00",
    slot_interval_minutes: 30, buffer_minutes: 10, breaks: [{ start: "13:00", end: "14:00" }],
    advance_booking_days: 60, minimum_notice_hours: 2, max_daily_bookings: 12, is_demo: true,
  }));
  const employees: Employee[] = [
    { id: "demo-employee-1", name: "AMREAL Specialist", active: true, is_demo: true },
    { id: "demo-employee-2", name: "Studio Consultant", active: true, is_demo: true },
  ];
  const employeeSchedules = employees.flatMap(employee => DAY_NAMES.map((_, weekday): EmployeeSchedule => ({
    employee_id: employee.id, weekday, is_working: weekday !== 0, opens_at: "10:00", closes_at: "18:00",
    breaks: [{ start: "13:00", end: "14:00" }], is_demo: true,
  })));
  const notifications: AppointmentNotification[] = appointments.slice(0, 2).map((appointment, index) => ({
    id: `demo-notification-${index + 1}`,
    appointment_id: appointment.id,
    event_type: index === 0 ? "new_booking" : "confirmed",
    created_at: appointment.created_at,
    status: "pending",
  }));
  return { services, appointments, employees, employeeSchedules, employeeTimeOff: [], availability, blocked: [], notifications };
}

function readDemoStore(): DemoStore {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as DemoStore;
      if (Array.isArray(parsed.services) && Array.isArray(parsed.appointments) && Array.isArray(parsed.availability)) {
        const defaults = seedDemoStore();
        const migrated = {
          ...parsed,
          employees: Array.isArray(parsed.employees) ? parsed.employees : defaults.employees,
          employeeSchedules: Array.isArray(parsed.employeeSchedules) ? parsed.employeeSchedules : defaults.employeeSchedules,
          employeeTimeOff: Array.isArray(parsed.employeeTimeOff) ? parsed.employeeTimeOff : [],
          blocked: Array.isArray(parsed.blocked) ? parsed.blocked : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaults.notifications,
        };
        if (!Array.isArray(parsed.employees) || !Array.isArray(parsed.employeeSchedules)
          || !Array.isArray(parsed.employeeTimeOff) || !Array.isArray(parsed.blocked)
          || !Array.isArray(parsed.notifications)) persistDemoStore(migrated);
        return migrated;
      }
    } catch (error) {
      console.warn("Could not read the appointment demo data; restoring the sample data.", error);
    }
  }
  const seeded = seedDemoStore();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function persistDemoStore(store: DemoStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function validateService(service: Partial<AppointmentService>): void {
  if (!service.name?.trim() || service.name.trim().length > 120) throw new Error("Enter a service name under 120 characters.");
  if (!Number.isInteger(service.duration_minutes) || Number(service.duration_minutes) < 5
    || Number(service.duration_minutes) > 720) throw new Error("Service duration must be from 5 to 720 minutes.");
  if (!Number.isInteger(service.buffer_minutes) || Number(service.buffer_minutes) < 0
    || Number(service.buffer_minutes) > 240) throw new Error("Service buffer must be from 0 to 240 minutes.");
}

function isValidTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return Boolean(match && Number(match[1]) <= 23 && Number(match[2]) <= 59);
}

function validateBreaks(breaks: BreakPeriod[]): void {
  if (breaks.some(period => !isValidTime(period.start) || !isValidTime(period.end)
    || period.start >= period.end)) throw new Error("Each break must have a valid start time before its end time.");
}

function validateAvailability(day: AvailabilityDay): void {
  if (!Number.isInteger(day.weekday) || day.weekday < 0 || day.weekday > 6) throw new Error("Choose a valid operating day.");
  if (!isValidTime(day.opens_at) || !isValidTime(day.closes_at)
    || day.closes_at <= day.opens_at) throw new Error("Closing time must be after opening time.");
  if (!Number.isInteger(day.slot_interval_minutes) || day.slot_interval_minutes < 5
    || day.slot_interval_minutes > 240) throw new Error("Booking interval must be from 5 to 240 minutes.");
  if (!Number.isInteger(day.buffer_minutes) || day.buffer_minutes < 0 || day.buffer_minutes > 240) {
    throw new Error("Default buffer must be from 0 to 240 minutes.");
  }
  if (!Number.isInteger(day.advance_booking_days) || day.advance_booking_days < 1 || day.advance_booking_days > 730) {
    throw new Error("Advance booking must be from 1 to 730 days.");
  }
  if (!Number.isInteger(day.minimum_notice_hours) || day.minimum_notice_hours < 0 || day.minimum_notice_hours > 8760) {
    throw new Error("Minimum notice must be from 0 to 8760 hours.");
  }
  if (!Number.isInteger(day.max_daily_bookings) || day.max_daily_bookings < 1 || day.max_daily_bookings > 500) {
    throw new Error("Daily booking limit must be from 1 to 500.");
  }
  validateBreaks(day.breaks);
}

export async function loadAppointmentBundle(): Promise<AppointmentBundle> {
  if (!isSupabaseConfigured()) return { ...readDemoStore(), demo: true };
  const [servicesResult, appointmentsResult, employeesResult, employeeSchedulesResult, employeeTimeOffResult, availabilityResult, blockedResult, notificationsResult] = await Promise.all([
    supabase.from("services").select("*").order("name"),
    supabase.from("appointments").select("*, services(name)").order("starts_at", { ascending: false }),
    supabase.from("employees").select("*").order("name"),
    supabase.from("employee_schedules").select("*").order("weekday"),
    supabase.from("employee_time_off").select("*").order("starts_at"),
    supabase.from("availability_settings").select("*").order("weekday"),
    supabase.from("blocked_slots").select("*").order("starts_at"),
    supabase.from("appointment_notifications").select("id,appointment_id,event_type,created_at,status").order("created_at", { ascending: false }).limit(10),
  ]);
  const error = servicesResult.error || appointmentsResult.error || employeesResult.error || employeeSchedulesResult.error || employeeTimeOffResult.error
    || availabilityResult.error || blockedResult.error || notificationsResult.error;
  if (error) throw new Error(error.message);
  return {
    services: ((servicesResult.data || []) as (AppointmentService & { eligible_employees?: string[] })[])
      .map(row => ({ ...row, employee_ids: row.eligible_employees || row.employee_ids || [] })),
    appointments: ((appointmentsResult.data || []) as (AppointmentRecord & { services?: { name: string } | null })[])
      .map(row => ({ ...row, service_name: row.services?.name || "Service" })),
    employees: (employeesResult.data || []) as Employee[],
    employeeSchedules: (employeeSchedulesResult.data || []) as EmployeeSchedule[],
    employeeTimeOff: (employeeTimeOffResult.data || []) as EmployeeTimeOff[],
    availability: (availabilityResult.data || []) as AvailabilityDay[],
    blocked: (blockedResult.data || []) as BlockedSlot[],
    notifications: (notificationsResult.data || []) as AppointmentNotification[],
    demo: false,
  };
}

export async function loadBookableServices(): Promise<AppointmentService[]> {
  if (!isSupabaseConfigured()) return readDemoStore().services.filter(service => service.active);
  const { data, error } = await supabase.from("services")
    .select("id,name,description,duration_minutes,buffer_minutes,eligible_employees,active")
    .eq("active", true).eq("is_demo", false).order("name");
  if (error) throw new Error(error.message);
  return ((data || []) as (AppointmentService & { eligible_employees?: string[] })[])
    .map(row => ({ ...row, employee_ids: row.eligible_employees || row.employee_ids || [] }));
}

export function subscribeToAppointmentChanges(onChange: () => void): () => void {
  if (!isSupabaseConfigured()) {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) onChange();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }
  const channel = supabase.channel("amreal-appointments")
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}

export async function saveAppointmentService(service: Partial<AppointmentService>): Promise<AppointmentService> {
  validateService(service);
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    const saved: AppointmentService = service.id
      ? { ...store.services.find(item => item.id === service.id)!, ...service } as AppointmentService
      : { ...service, id: `demo-service-${crypto.randomUUID()}`, is_demo: true } as AppointmentService;
    store.services = service.id
      ? store.services.map(item => item.id === saved.id ? saved : item)
      : [...store.services, saved];
    persistDemoStore(store);
    return saved;
  }
  const payload = {
    name: service.name,
    description: service.description,
    duration_minutes: service.duration_minutes,
    buffer_minutes: service.buffer_minutes,
    eligible_employees: service.employee_ids || [],
    active: service.active,
    is_demo: service.is_demo ?? false,
  };
  const result = service.id
    ? await supabase.from("services").update(payload).eq("id", service.id).select().single()
    : await supabase.from("services").insert(payload).select().single();
  if (result.error) throw new Error(result.error.message);
  return result.data as AppointmentService;
}

export async function saveAvailabilityDay(day: AvailabilityDay): Promise<void> {
  validateAvailability(day);
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    store.availability = store.availability.filter(item => !(item.weekday === day.weekday && item.service_id === day.service_id));
    store.availability.push({ ...day, is_demo: true });
    persistDemoStore(store);
    return;
  }
  const payload = {
    service_id: day.service_id,
    weekday: day.weekday,
    is_open: day.is_open,
    opens_at: day.opens_at,
    closes_at: day.closes_at,
    slot_interval_minutes: day.slot_interval_minutes,
    buffer_minutes: day.buffer_minutes,
    breaks: day.breaks,
    advance_booking_days: day.advance_booking_days,
    minimum_notice_hours: day.minimum_notice_hours,
    max_daily_bookings: day.max_daily_bookings,
    is_demo: day.is_demo ?? false,
  };
  const result = day.id
    ? await supabase.from("availability_settings").update(payload).eq("id", day.id).select("id").single()
    : await supabase.from("availability_settings").insert(payload).select("id").single();
  const { error } = result;
  if (error) throw new Error(error.message);
}

export async function saveEmployee(name: string, id?: string): Promise<Employee> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Employee name is required.");
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    const employee = id
      ? { ...store.employees.find(item => item.id === id)!, name: cleanName }
      : { id: `demo-employee-${crypto.randomUUID()}`, name: cleanName, active: true, is_demo: true };
    if (id) store.employees = store.employees.map(item => item.id === id ? employee : item);
    else store.employees.push(employee);
    persistDemoStore(store);
    return employee;
  }
  const result = id
    ? await supabase.from("employees").update({ name: cleanName }).eq("id", id).select().single()
    : await supabase.from("employees").insert({ name: cleanName }).select().single();
  if (result.error) throw new Error(result.error.message);
  return result.data as Employee;
}

export async function saveEmployeeSchedule(schedule: EmployeeSchedule): Promise<void> {
  if (!Number.isInteger(schedule.weekday) || schedule.weekday < 0 || schedule.weekday > 6
    || !isValidTime(schedule.opens_at) || !isValidTime(schedule.closes_at)
    || schedule.closes_at <= schedule.opens_at) throw new Error("Employee closing time must be after opening time.");
  validateBreaks(schedule.breaks);
  const payload = {
    employee_id: schedule.employee_id,
    weekday: schedule.weekday,
    is_working: schedule.is_working,
    opens_at: schedule.opens_at,
    closes_at: schedule.closes_at,
    breaks: schedule.breaks,
  };
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    store.employeeSchedules = store.employeeSchedules.filter(item =>
      item.employee_id !== schedule.employee_id || item.weekday !== schedule.weekday);
    store.employeeSchedules.push({ ...payload, is_demo: true });
    persistDemoStore(store);
    return;
  }
  const { error } = await supabase.from("employee_schedules").upsert(payload, { onConflict: "employee_id,weekday" });
  if (error) throw new Error(error.message);
}

export async function addEmployeeTimeOff(employeeId: string, date: string, startTime: string, endTime: string, reason: string): Promise<void> {
  const dateValue = new Date(`${date}T12:00:00+05:30`);
  if (!employeeId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(dateValue.getTime())
    || dateInIndia(dateValue) !== date || !isValidTime(startTime) || !isValidTime(endTime)
    || startTime >= endTime || !reason.trim()) {
    throw new Error("Choose an employee, a valid time range, and a reason.");
  }
  const startsAt = localDateTime(date, startTime);
  const endsAt = localDateTime(date, endTime);
  if (new Date(startsAt).getTime() <= Date.now()) throw new Error("Employee time off must start in the future.");
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    store.employeeTimeOff.push({
      id: `demo-time-off-${crypto.randomUUID()}`, employee_id: employeeId,
      starts_at: startsAt, ends_at: endsAt, reason: reason.trim(), is_demo: true,
    });
    persistDemoStore(store);
    return;
  }
  const { error } = await supabase.from("employee_time_off").insert({
    employee_id: employeeId, starts_at: startsAt, ends_at: endsAt, reason: reason.trim(),
  });
  if (error) throw new Error(error.message);
}

export async function removeEmployeeTimeOff(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    store.employeeTimeOff = store.employeeTimeOff.filter(item => item.id !== id);
    persistDemoStore(store);
    return;
  }
  const { error } = await supabase.from("employee_time_off").delete().eq("id", id).select("id").single();
  if (error) throw new Error(error.message);
}

export async function addBlockedDate(date: string, reason: string, isHoliday = false, isDemo = false): Promise<void> {
  const dateValue = new Date(`${date}T12:00:00+05:30`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(dateValue.getTime())
    || dateInIndia(dateValue) !== date || date < dateInIndia(new Date())) throw new Error("Choose a valid future date.");
  if (!reason.trim()) throw new Error("Enter a reason for blocking this date.");
  const startsAt = localDateTime(date, "00:00");
  const nextDate = new Date(`${date}T12:00:00+05:30`);
  nextDate.setDate(nextDate.getDate() + 1);
  const endsAt = localDateTime(dateInIndia(nextDate), "00:00");
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    store.blocked.push({ id: `demo-block-${crypto.randomUUID()}`, starts_at: startsAt, ends_at: endsAt, reason, is_holiday: isHoliday, is_demo: true });
    persistDemoStore(store);
    return;
  }
  const { error } = await supabase.from("blocked_slots").insert({
    starts_at: startsAt, ends_at: endsAt, reason, is_holiday: isHoliday, is_demo: isDemo,
  });
  if (error) throw new Error(error.message);
}

export async function removeBlockedDate(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    store.blocked = store.blocked.filter(item => item.id !== id);
    persistDemoStore(store);
    return;
  }
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id).select("id").single();
  if (error) throw new Error(error.message);
}

function getAvailabilityForDate(store: DemoStore, date: string, serviceId: string): AvailabilityDay | undefined {
  const weekday = new Date(`${date}T12:00:00+05:30`).getDay();
  return store.availability.find(item => item.weekday === weekday && item.service_id === serviceId)
    || store.availability.find(item => item.weekday === weekday && item.service_id === null);
}

export async function getAvailableSlots(serviceId: string, date: string, excludeAppointmentId?: string): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc("get_available_appointment_slots", {
      p_service_id: serviceId,
      p_date: date,
      p_exclude_appointment: excludeAppointmentId || null,
    });
    if (error) throw new Error(error.message);
    return ((data || []) as { slot_time: string }[]).map(item => item.slot_time.slice(0, 5));
  }
  const store = readDemoStore();
  const service = store.services.find(item => item.id === serviceId && item.active);
  const setting = getAvailabilityForDate(store, date, serviceId);
  if (!service || !setting?.is_open) return [];
  if (!Number.isInteger(setting.slot_interval_minutes) || setting.slot_interval_minutes < 1) return [];
  const dateValue = new Date(`${date}T12:00:00+05:30`);
  const today = new Date(`${dateInIndia(new Date())}T00:00:00+05:30`);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + setting.advance_booking_days);
  if (dateValue < today || dateValue > maxDate) return [];
  const nowWithNotice = Date.now() + setting.minimum_notice_hours * 60 * 60 * 1000;
  const startMinute = timeToMinutes(setting.opens_at);
  const closeMinute = timeToMinutes(setting.closes_at);
  const slots: string[] = [];
  const reservedCount = store.appointments.filter(item =>
    item.id !== excludeAppointmentId && ACTIVE_STATUSES.includes(item.status)
      && dateInIndia(new Date(item.starts_at)) === date).length;
  if (reservedCount >= setting.max_daily_bookings) return [];
  const duration = service.duration_minutes + service.buffer_minutes + setting.buffer_minutes;
  const eligibleEmployees = store.employees.filter(employee => employee.active
    && (!service.employee_ids?.length || service.employee_ids.includes(employee.name)));
  for (let minute = startMinute; minute + duration <= closeMinute; minute += setting.slot_interval_minutes) {
    const start = localDateTime(date, minutesToTime(minute));
    const end = localDateTime(date, minutesToTime(minute + duration));
    if (new Date(start).getTime() < nowWithNotice) continue;
    if (setting.breaks.some(period => overlaps(minute, minute + duration, timeToMinutes(period.start), timeToMinutes(period.end)))) continue;
    if (store.blocked.some(period => overlaps(new Date(start).getTime(), new Date(end).getTime(), new Date(period.starts_at).getTime(), new Date(period.ends_at).getTime()))) continue;
    const hasSharedConflict = store.appointments.some(item => item.id !== excludeAppointmentId && ACTIVE_STATUSES.includes(item.status)
      && overlaps(new Date(start).getTime(), new Date(end).getTime(), new Date(item.starts_at).getTime(), new Date(item.ends_at).getTime())
      && (!service.employee_ids?.length || !item.employee_id));
    if (hasSharedConflict) continue;
    if (service.employee_ids?.length) {
      const hasEligibleEmployee = eligibleEmployees.some(employee => {
        const schedule = store.employeeSchedules.find(item => item.employee_id === employee.id && item.weekday === setting.weekday);
        if (!schedule?.is_working || minute < timeToMinutes(schedule.opens_at)
          || minute + duration > timeToMinutes(schedule.closes_at)
          || schedule.breaks.some(period => overlaps(minute, minute + duration, timeToMinutes(period.start), timeToMinutes(period.end)))) return false;
        const hasTimeConflict = store.appointments.some(item => item.id !== excludeAppointmentId && ACTIVE_STATUSES.includes(item.status)
          && item.employee_id === employee.id
          && overlaps(new Date(start).getTime(), new Date(end).getTime(), new Date(item.starts_at).getTime(), new Date(item.ends_at).getTime()));
        const hasTimeOff = store.employeeTimeOff.some(item => item.employee_id === employee.id
          && overlaps(new Date(start).getTime(), new Date(end).getTime(), new Date(item.starts_at).getTime(), new Date(item.ends_at).getTime()));
        return !hasTimeConflict && !hasTimeOff;
      });
      if (!hasEligibleEmployee) continue;
    }
    slots.push(minutesToTime(minute));
  }
  return slots;
}

export async function createAppointment(input: {
  service_id: string;
  date: string;
  time: string;
  customer_name: string;
  phone: string;
  email: string;
}): Promise<AppointmentRecord> {
  if (input.customer_name.trim().length < 1 || input.customer_name.trim().length > 120
    || input.phone.trim().length < 7 || input.phone.trim().length > 32
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    throw new Error("Please enter a valid name, phone number and email address.");
  }
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc("create_appointment_booking", {
      p_service_id: input.service_id,
      p_date: input.date,
      p_start_time: input.time,
      p_customer_name: input.customer_name.trim(),
      p_phone: input.phone.trim(),
      p_email: input.email.trim(),
    });
    if (error) throw new Error(error.message);
    return data as AppointmentRecord;
  }
  const slots = await getAvailableSlots(input.service_id, input.date);
  if (!slots.includes(input.time)) throw new Error("That time is no longer available. Please choose another slot.");
  const store = readDemoStore();
  const service = store.services.find(item => item.id === input.service_id);
  if (!service) throw new Error("The selected service is no longer available.");
  const setting = getAvailabilityForDate(store, input.date, service.id);
  if (!setting) throw new Error("Availability is not configured for this date.");
  const startsAt = localDateTime(input.date, input.time);
  const endsAt = localDateTime(input.date, minutesToTime(timeToMinutes(input.time)
    + service.duration_minutes + service.buffer_minutes + setting.buffer_minutes));
  const latestStore = readDemoStore();
  const currentSlots = await getAvailableSlots(input.service_id, input.date);
  if (!currentSlots.includes(input.time)) throw new Error("That time is no longer available. Please choose another slot.");
  const startMinute = timeToMinutes(input.time);
  const occupiedUntil = startMinute + service.duration_minutes + service.buffer_minutes + setting.buffer_minutes;
  const employee = service.employee_ids?.length
    ? latestStore.employees.find(item => {
      if (!item.active || !service.employee_ids?.includes(item.name)) return false;
      const schedule = latestStore.employeeSchedules.find(entry =>
        entry.employee_id === item.id && entry.weekday === setting.weekday);
      if (!schedule?.is_working || startMinute < timeToMinutes(schedule.opens_at)
        || occupiedUntil > timeToMinutes(schedule.closes_at)
        || schedule.breaks.some(period => overlaps(startMinute, occupiedUntil, timeToMinutes(period.start), timeToMinutes(period.end)))) return false;
      return !latestStore.appointments.some(existing => ACTIVE_STATUSES.includes(existing.status)
        && existing.employee_id === item.id
        && overlaps(new Date(startsAt).getTime(), new Date(endsAt).getTime(),
          new Date(existing.starts_at).getTime(), new Date(existing.ends_at).getTime()))
        && !latestStore.employeeTimeOff.some(timeOff => timeOff.employee_id === item.id
          && overlaps(new Date(startsAt).getTime(), new Date(endsAt).getTime(),
            new Date(timeOff.starts_at).getTime(), new Date(timeOff.ends_at).getTime()));
    })
    : undefined;
  const record: AppointmentRecord = {
    id: `demo-appointment-${crypto.randomUUID()}`,
    booking_id: `AM-DEMO-${String(store.appointments.length + 1).padStart(3, "0")}`,
    customer_name: input.customer_name.trim(), phone: input.phone.trim(), email: input.email.trim(),
    service_id: service.id, service_name: service.name, starts_at: startsAt, ends_at: endsAt,
    status: "pending", notes: "", created_at: new Date().toISOString(), employee_id: employee?.id, is_demo: true,
  };
  latestStore.appointments.unshift(record);
  latestStore.notifications.unshift({
    id: `demo-notification-${crypto.randomUUID()}`, appointment_id: record.id,
    event_type: "new_booking", created_at: record.created_at, status: "pending",
  });
  persistDemoStore(latestStore);
  return record;
}

export async function updateAppointment(id: string, updates: Partial<Pick<AppointmentRecord, "status" | "notes" | "starts_at" | "ends_at">>): Promise<void> {
  if (updates.starts_at) {
    const start = new Date(updates.starts_at);
    const date = getAppointmentDate(start.toISOString());
    const time = getAppointmentTime(start.toISOString());
    if (isSupabaseConfigured()) {
      const { error } = await supabase.rpc("reschedule_appointment_booking", {
        p_appointment_id: id,
        p_date: date,
        p_start_time: time,
      });
      if (error) throw new Error(error.message);
      return;
    }
    const store = readDemoStore();
    const appointment = store.appointments.find(item => item.id === id);
    const service = store.services.find(item => item.id === appointment?.service_id);
    const setting = service ? getAvailabilityForDate(store, date, service.id) : undefined;
    const slots = service ? await getAvailableSlots(service.id, date, id) : [];
    if (!appointment || !service || !setting || !slots.includes(time)) {
      throw new Error("That appointment slot is no longer available. Please choose another time.");
    }
    const endsAt = localDateTime(date, minutesToTime(timeToMinutes(time)
      + service.duration_minutes + service.buffer_minutes + setting.buffer_minutes));
    store.appointments = store.appointments.map(item => item.id === id
      ? { ...item, starts_at: localDateTime(date, time), ends_at: endsAt }
      : item);
    store.notifications.unshift({
      id: `demo-notification-${crypto.randomUUID()}`, appointment_id: id,
      event_type: "rescheduled", created_at: new Date().toISOString(), status: "pending",
    });
    persistDemoStore(store);
    return;
  }
  if (!isSupabaseConfigured()) {
    const store = readDemoStore();
    if (!store.appointments.some(item => item.id === id)) throw new Error("Appointment could not be found.");
    const previous = store.appointments.find(item => item.id === id);
    store.appointments = store.appointments.map(item => item.id === id ? { ...item, ...updates } : item);
    if (previous && updates.status === "confirmed") store.notifications.unshift({
      id: `demo-notification-${crypto.randomUUID()}`, appointment_id: id,
      event_type: "confirmed", created_at: new Date().toISOString(), status: "pending",
    });
    if (previous && updates.status === "cancelled") store.notifications.unshift({
      id: `demo-notification-${crypto.randomUUID()}`, appointment_id: id,
      event_type: "cancelled", created_at: new Date().toISOString(), status: "pending",
    });
    persistDemoStore(store);
    return;
  }
  const { error } = await supabase.from("appointments").update(updates).eq("id", id).select("id").single();
  if (error) throw new Error(error.message);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function getWeekdayName(weekday: number): string {
  return DAY_NAMES[weekday];
}

export function getIndiaDate(date: Date): string {
  return dateInIndia(date);
}

export function getAppointmentDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  }).format(new Date(iso));
}

export function getAppointmentDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(iso));
}

export function getAppointmentTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(iso));
}

export function getAppointmentDataMode(): string {
  return isSupabaseConfigured() ? "Live Supabase data" : `Local demo data · ${getErrorMessage(new Error("demo")) && "not shared with production"}`;
}
