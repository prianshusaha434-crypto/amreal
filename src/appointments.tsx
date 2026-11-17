import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3,
  Edit3, Loader, Mail, MessageCircle, Plus, Save, Search, X,
} from "lucide-react";
import {
  addBlockedDate, addEmployeeTimeOff, AppointmentBundle, AppointmentRecord, AppointmentService, AvailabilityDay, EmployeeSchedule,
  createAppointment, getAppointmentDate, getAppointmentDateTime, getAppointmentTime,
  getAvailableSlots, getIndiaDate, getWeekdayName, loadAppointmentBundle, loadBookableServices, removeBlockedDate,
  removeEmployeeTimeOff, saveAppointmentService, saveAvailabilityDay, saveEmployee, saveEmployeeSchedule,
  subscribeToAppointmentChanges, updateAppointment,
} from "./appointmentData";

type ModuleTab = "dashboard" | "appointments" | "availability" | "services";
type DataScope = "production" | "demo";
type Message = { type: "ok" | "err"; text: string } | null;
const STATUSES = ["pending", "confirmed", "completed", "cancelled", "rejected", "no_show"] as const;
const EMPTY_SERVICE: Partial<AppointmentService> = {
  name: "", description: "", duration_minutes: 30, buffer_minutes: 10, active: true,
};

function showStatus(status: string): string {
  return status.replace("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function dateInputValue(iso: string): string {
  return getAppointmentDate(iso);
}

function defaultAvailability(weekday = 1, isDemo = false, serviceId: string | null = null): AvailabilityDay {
  return {
    weekday, service_id: serviceId, is_open: weekday !== 0, opens_at: "10:00", closes_at: "18:00",
    slot_interval_minutes: 30, buffer_minutes: 10, breaks: [], advance_booking_days: 60,
    minimum_notice_hours: 2, max_daily_bookings: 12, is_demo: isDemo,
  };
}

function Flash({ message }: { message: Message }) {
  if (!message) return null;
  return <div className={`admin-flash ${message.type}`}><AlertCircle size={15} />{message.text}</div>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`appointment-status status-${status}`}>{showStatus(status)}</span>;
}

function useAppointmentData() {
  const [bundle, setBundle] = useState<AppointmentBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setBundle(await loadAppointmentBundle());
      setMessage(null);
    } catch (error) {
      setMessage({ type: "err", text: error instanceof Error ? error.message : "Could not load appointment data." });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => subscribeToAppointmentChanges(() => { void reload(); }), [reload]);
  const run = async (action: () => Promise<unknown>, success: string): Promise<boolean> => {
    try {
      await action();
      await reload();
      setMessage({ type: "ok", text: success });
      return true;
    } catch (error) {
      setMessage({ type: "err", text: error instanceof Error ? error.message : "The change could not be saved." });
      return false;
    }
  };
  return { bundle, loading, message, setMessage, reload, run };
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone?: string }) {
  return <article className={`appointment-summary ${tone || ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

export function AppointmentAdmin({ initialTab = "dashboard" }: { initialTab?: ModuleTab }) {
  const { bundle, loading, message, setMessage, reload, run } = useAppointmentData();
  const [tab, setTab] = useState<ModuleTab>(initialTab);
  const [scope, setScope] = useState<DataScope>("production");
  const [selected, setSelected] = useState<AppointmentRecord | null>(null);
  const [month, setMonth] = useState(() => new Date(`${getIndiaDate(new Date())}T12:00:00+05:30`));

  useEffect(() => setTab(initialTab), [initialTab]);
  const dataScope: DataScope = bundle?.demo ? "demo" : scope;
  const scopedBundle = useMemo(() => {
    if (!bundle) return null;
    const isDemo = dataScope === "demo";
    const appointments = bundle.appointments.filter(item => Boolean(item.is_demo) === isDemo);
    const appointmentIds = new Set(appointments.map(item => item.id));
    return {
      ...bundle,
      services: bundle.services.filter(item => Boolean(item.is_demo) === isDemo),
      appointments,
      availability: bundle.availability.filter(item => Boolean(item.is_demo) === isDemo),
      blocked: bundle.blocked.filter(item => Boolean(item.is_demo) === isDemo),
      notifications: bundle.notifications.filter(item => appointmentIds.has(item.appointment_id)),
    };
  }, [bundle, dataScope]);
  const appointments = scopedBundle?.appointments || [];
  const tabs: { id: ModuleTab; name: string }[] = [
    { id: "dashboard", name: "Dashboard" }, { id: "appointments", name: "Appointments" },
    { id: "availability", name: "Availability" }, { id: "services", name: "Services" },
  ];

  return (
    <section className="admin-tab appointment-admin">
      {bundle?.demo && <div className="appointment-demo-banner"><span>DEMO WORKSPACE</span> These bookings are stored in this browser only and are separate from live production data.</div>}
      {bundle && !bundle.demo && <div className="appointment-data-scope"><span>Data workspace</span><select value={scope} onChange={event => { setSelected(null); setScope(event.target.value as DataScope); }}><option value="production">Production records</option><option value="demo">Demo sample data</option></select></div>}
      <Flash message={message} />
      <nav className="appointment-tabs" aria-label="Appointments and availability">
        {tabs.map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.name}</button>)}
      </nav>
      {loading && !bundle ? <div className="admin-loading"><Loader className="spin" size={28} /></div> : null}
      {scopedBundle && tab === "dashboard" && <Dashboard
        bundle={scopedBundle} month={month} setMonth={setMonth} setSelected={setSelected}
        onOpenAppointments={() => setTab("appointments")}
      />}
      {scopedBundle && tab === "appointments" && <AppointmentsList
        bundle={scopedBundle} appointments={appointments} onSelect={setSelected}
      />}
      {scopedBundle && tab === "availability" && <AvailabilityPanel bundle={scopedBundle} run={run} demoData={dataScope === "demo"} />}
      {scopedBundle && tab === "services" && <ServicesPanel bundle={scopedBundle} run={run} demoData={dataScope === "demo"} />}
      {selected && scopedBundle && <AppointmentDetails
        appointment={appointments.find(item => item.id === selected.id) || selected}
        appointments={appointments}
        services={scopedBundle.services}
        onClose={() => setSelected(null)}
        onSave={(updates, success) => run(() => updateAppointment(selected.id, updates), success)}
        reload={reload}
      />}
      <span className="appointment-timezone">All appointment times are shown in Asia/Kolkata (IST).</span>
    </section>
  );
}

function Dashboard({ bundle, month, setMonth, setSelected, onOpenAppointments }: {
  bundle: AppointmentBundle;
  month: Date;
  setMonth: (date: Date) => void;
  setSelected: (appointment: AppointmentRecord) => void;
  onOpenAppointments: () => void;
}) {
  const today = getIndiaDate(new Date());
  const now = Date.now();
  const todayAppointments = bundle.appointments.filter(item => getAppointmentDate(item.starts_at) === today && !["cancelled", "rejected"].includes(item.status));
  const upcoming = bundle.appointments.filter(item => new Date(item.starts_at).getTime() >= now && !["cancelled", "rejected"].includes(item.status));
  const pending = bundle.appointments.filter(item => item.status === "pending");
  const completed = bundle.appointments.filter(item => item.status === "completed");
  const cancelled = bundle.appointments.filter(item => ["cancelled", "rejected"].includes(item.status));
  const firstService = bundle.services.find(item => item.active);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotError, setSlotError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  useEffect(() => {
    if (!firstService) { setSlots([]); setSlotError(""); return; }
    let active = true;
    void getAvailableSlots(firstService.id, today).then(result => {
      if (active) { setSlots(result); setSlotError(""); }
    }).catch(error => {
      if (active) {
        setSlots([]);
        setSlotError(error instanceof Error ? error.message : "Available slots could not be loaded.");
      }
    });
    return () => { active = false; };
  }, [firstService?.id, today]);
  const maxStatusCount = Math.max(1, ...STATUSES.map(status => bundle.appointments.filter(item => item.status === status).length));
  const recent = [...bundle.appointments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(month);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthAppointments = bundle.appointments.filter(item => getAppointmentDate(item.starts_at).startsWith(monthKey));
  const weekDays = useMemo(() => {
    const first = new Date(`${today}T12:00:00+05:30`);
    first.setDate(first.getDate() - first.getDay() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(first);
      day.setDate(first.getDate() + index);
      return getIndiaDate(day);
    });
  }, [today, weekOffset]);
  const todaySchedule = todayAppointments.slice().sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const pendingRequests = bundle.appointments.filter(item => item.status === "pending")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at)).slice(0, 5);
  const weekday = new Date(`${today}T12:00:00+05:30`).getDay();
  return (
    <div className="appointment-dashboard">
      <div className="appointment-panel-heading"><div><p className="appointment-eyebrow">OVERVIEW</p><h2>Appointment dashboard</h2></div><button className="button button-small button-secondary" onClick={onOpenAppointments}>View all appointments <ChevronRight size={14} /></button></div>
      <div className="appointment-summary-grid">
        <SummaryCard label="Today" value={todayAppointments.length} detail="Scheduled today" />
        <SummaryCard label="Upcoming" value={upcoming.length} detail="Future bookings" />
        <SummaryCard label="Pending confirmation" value={pending.length} detail="Need your attention" tone="pending" />
        <SummaryCard label="Completed" value={completed.length} detail="All-time" />
        <SummaryCard label="Cancelled" value={cancelled.length} detail="Cancelled or rejected" />
        <SummaryCard label="Available slots today" value={slots.length} detail={slotError || (firstService ? firstService.name : "Add a service to begin")} tone="available" />
      </div>
      <div className="appointment-dashboard-grid">
        <section className="appointment-card appointment-calendar">
          <div className="appointment-card-heading"><div><h3>Booking calendar</h3><span>{monthLabel}</span></div><div className="appointment-month-controls">
            <button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
            <button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
          </div></div>
          <div className="appointment-calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span className="calendar-weekday" key={day}>{day}</span>)}
            {Array.from({ length: leadingDays }, (_, index) => <span className="calendar-empty" key={`empty-${index}`} />)}
            {Array.from({ length: dayCount }, (_, index) => {
              const day = index + 1;
              const date = `${monthKey}-${String(day).padStart(2, "0")}`;
              const count = monthAppointments.filter(item => getAppointmentDate(item.starts_at) === date).length;
              return <button key={date} className={`calendar-day ${date === today ? "today" : ""} ${count ? "has-bookings" : ""}`} onClick={() => {
                const match = monthAppointments.find(item => getAppointmentDate(item.starts_at) === date);
                if (match) setSelected(match);
              }} title={count ? `${count} appointment${count === 1 ? "" : "s"}` : undefined}>
                {day}{count > 0 && <i>{count}</i>}
              </button>;
            })}
          </div>
          <div className="appointment-calendar-legend"><span><i className="legend-dot" /> Bookings</span><span><i className="legend-dot today-dot" /> Today</span></div>
        </section>
        <section className="appointment-card appointment-distribution">
          <div className="appointment-card-heading"><div><h3>Status distribution</h3><span>All appointments</span></div></div>
          {STATUSES.map(status => {
            const count = bundle.appointments.filter(item => item.status === status).length;
            return <div className="status-bar-row" key={status}><span>{showStatus(status)}</span><div className="status-bar-track"><i className={`status-bar-fill status-${status}`} style={{ width: `${count / maxStatusCount * 100}%` }} /></div><b>{count}</b></div>;
          })}
        </section>
      </div>
      <section className="appointment-card appointment-week-calendar">
        <div className="appointment-card-heading"><div><h3>Weekly booking calendar</h3><span>Appointments by day · India Standard Time</span></div><div className="appointment-month-controls">
          <button aria-label="Previous week" onClick={() => setWeekOffset(value => value - 1)}><ChevronLeft size={17} /></button>
          <button aria-label="Next week" onClick={() => setWeekOffset(value => value + 1)}><ChevronRight size={17} /></button>
        </div></div>
        <div className="appointment-week-grid">{weekDays.map(date => {
          const dateAppointments = bundle.appointments.filter(item => getAppointmentDate(item.starts_at) === date
            && !["cancelled", "rejected"].includes(item.status)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          const dateLabel = new Intl.DateTimeFormat("en-IN", {
            weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata",
          }).format(new Date(`${date}T12:00:00+05:30`));
          return <div className={`appointment-week-day ${date === today ? "today" : ""}`} key={date}>
            <strong>{dateLabel}</strong>
            {dateAppointments.length ? dateAppointments.map(item => <button key={item.id} onClick={() => setSelected(item)}>
              <span>{getAppointmentTime(item.starts_at)} · {item.customer_name}</span><small>{item.service_name}</small>
            </button>) : <span className="appointment-week-empty">No bookings</span>}
          </div>;
        })}</div>
      </section>
      <div className="appointment-dashboard-grid appointment-dashboard-secondary">
        <section className="appointment-card">
          <div className="appointment-card-heading"><div><h3>Today’s schedule</h3><span>{todaySchedule.length} appointments</span></div></div>
          {todaySchedule.length ? <div className="appointment-compact-list">{todaySchedule.map(item => <button key={item.id} onClick={() => setSelected(item)}>
            <span className="appointment-compact-time">{getAppointmentTime(item.starts_at)}</span><span><strong>{item.customer_name}</strong><small>{item.service_name} · {showStatus(item.status)}</small></span><ChevronRight size={15} />
          </button>)}</div> : <p className="appointment-empty">No appointments scheduled for today.</p>}
        </section>
        <section className="appointment-card">
          <div className="appointment-card-heading"><div><h3>Pending requests</h3><span>Awaiting confirmation</span></div><button className="appointment-text-button" onClick={onOpenAppointments}>Review <ChevronRight size={14} /></button></div>
          {pendingRequests.length ? <div className="appointment-compact-list">{pendingRequests.map(item => <button key={item.id} onClick={() => setSelected(item)}>
            <span className="appointment-pending-dot" /><span><strong>{item.customer_name}</strong><small>{item.service_name} · {getAppointmentDateTime(item.starts_at)}</small></span><ChevronRight size={15} />
          </button>)}</div> : <p className="appointment-empty">No booking requests need confirmation.</p>}
        </section>
      </div>
      <div className="appointment-dashboard-grid appointment-dashboard-secondary">
        <section className="appointment-card">
          <div className="appointment-card-heading"><div><h3>Employee availability</h3><span>{getWeekdayName(weekday)} · scheduled to work</span></div></div>
          {bundle.employees.filter(item => item.active).length ? <div className="employee-availability-list">
            {bundle.employees.filter(item => item.active).map(employee => {
              const schedule = bundle.employeeSchedules.find(item => item.employee_id === employee.id && item.weekday === weekday);
              const busy = bundle.appointments.some(item => item.employee_id === employee.id
                && getAppointmentDate(item.starts_at) === today && ["pending", "confirmed"].includes(item.status))
                || bundle.employeeTimeOff.some(item => item.employee_id === employee.id
                  && getAppointmentDate(item.starts_at) === today);
              return <div key={employee.id}><span className={`employee-dot ${schedule?.is_working ? "working" : ""}`} /><span><strong>{employee.name}</strong><small>{schedule?.is_working ? `${schedule.opens_at.slice(0, 5)}–${schedule.closes_at.slice(0, 5)}` : "Not scheduled today"}</small></span><em>{schedule?.is_working ? (busy ? "Booked" : "Available") : "Off"}</em></div>;
            })}
          </div> : <p className="appointment-empty">Add employees in Availability to manage staff schedules.</p>}
        </section>
        <section className="appointment-card">
          <div className="appointment-card-heading"><div><h3>Admin notifications</h3><span>Latest booking updates</span></div></div>
          {bundle.notifications.length ? <div className="appointment-compact-list">{bundle.notifications.slice(0, 5).map(notification => {
            const appointment = bundle.appointments.find(item => item.id === notification.appointment_id);
            return <div className="appointment-notification-row" key={notification.id}><span className="appointment-pending-dot" /><span><strong>{showStatus(notification.event_type.replace("_", " "))}</strong><small>{appointment?.customer_name || "Appointment"} · {appointment ? getAppointmentDateTime(notification.created_at) : "Booking update"}</small></span></div>;
          })}</div> : <p className="appointment-empty">Booking updates will appear here.</p>}
        </section>
      </div>
      <section className="appointment-card">
        <div className="appointment-card-heading"><div><h3>Recent bookings</h3><span>Latest customer requests</span></div><button className="appointment-text-button" onClick={onOpenAppointments}>All appointments <ChevronRight size={14} /></button></div>
        {recent.length ? <div className="appointment-table-wrap"><table className="appointment-table"><thead><tr><th>Customer</th><th>Service</th><th>Date & time</th><th>Status</th></tr></thead>
          <tbody>{recent.map(item => <tr key={item.id} onClick={() => setSelected(item)}><td><strong>{item.customer_name}</strong><small>{item.phone}</small></td><td>{item.service_name || "Service"}</td><td>{getAppointmentDateTime(item.starts_at)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody>
        </table></div> : <p className="appointment-empty">No bookings yet. Customer requests will appear here.</p>}
      </section>
    </div>
  );
}

function AppointmentsList({ bundle, appointments, onSelect }: {
  bundle: AppointmentBundle;
  appointments: AppointmentRecord[];
  onSelect: (appointment: AppointmentRecord) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [serviceId, setServiceId] = useState("all");
  const filtered = appointments.filter(item => {
    const text = `${item.customer_name} ${item.phone} ${item.email} ${item.booking_id}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase()))
      && (status === "all" || item.status === status)
      && (serviceId === "all" || item.service_id === serviceId)
      && (!date || getAppointmentDate(item.starts_at) === date);
  }).sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  return (
    <div className="appointment-list-panel">
      <div className="appointment-panel-heading"><div><p className="appointment-eyebrow">BOOKINGS</p><h2>Appointments</h2></div><span className="appointment-result-count">{filtered.length} booking{filtered.length === 1 ? "" : "s"}</span></div>
      <div className="appointment-filters">
        <label className="appointment-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search customer, phone or booking ID" /></label>
        <label><span>Status</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{STATUSES.map(item => <option key={item} value={item}>{showStatus(item)}</option>)}</select></label>
        <label><span>Service</span><select value={serviceId} onChange={event => setServiceId(event.target.value)}><option value="all">All services</option>{bundle.services.map(service => <option value={service.id} key={service.id}>{service.name}</option>)}</select></label>
        <label><span>Date</span><input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
        {bundle.demo && <span className="appointment-demo-pill">DEMO DATA</span>}
      </div>
      {filtered.length ? <div className="appointment-table-wrap"><table className="appointment-table"><thead><tr><th>Booking / customer</th><th>Service</th><th>Date & time (IST)</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>{filtered.map(item => <tr key={item.id} onClick={() => onSelect(item)}><td><strong>{item.booking_id}</strong><small>{item.customer_name} · {item.phone}</small></td><td>{item.service_name || "Service"}</td><td>{getAppointmentDateTime(item.starts_at)}</td><td><StatusBadge status={item.status} /></td><td>{getAppointmentDateTime(item.created_at)}</td></tr>)}</tbody></table></div>
        : <div className="appointment-empty"><CalendarDays size={26} /><p>No appointments match these filters.</p></div>}
    </div>
  );
}

function AppointmentDetails({ appointment, appointments, services, onClose, onSave, reload }: {
  appointment: AppointmentRecord;
  appointments: AppointmentRecord[];
  services: AppointmentService[];
  onClose: () => void;
  onSave: (updates: Partial<Pick<AppointmentRecord, "status" | "notes" | "starts_at" | "ends_at">>, success: string) => void;
  reload: () => Promise<void>;
}) {
  const [notes, setNotes] = useState(appointment.notes || "");
  const [date, setDate] = useState(dateInputValue(appointment.starts_at));
  const [time, setTime] = useState(getAppointmentTime(appointment.starts_at));
  const [slots, setSlots] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(false);
  const service = services.find(item => item.id === appointment.service_id);
  const customerHistory = appointments.filter(item => item.id !== appointment.id
    && (item.phone === appointment.phone || item.email.toLowerCase() === appointment.email.toLowerCase()));
  const contactMessage = `Hello ${appointment.customer_name}, your AMREAL appointment ${appointment.booking_id} is currently ${showStatus(appointment.status).toLowerCase()}. ${appointment.service_name || "Your service"}: ${getAppointmentDateTime(appointment.starts_at)} IST.`;
  const whatsappUrl = `https://wa.me/${appointment.phone.replace(/\D/g, "")}?text=${encodeURIComponent(contactMessage)}`;
  const emailUrl = `mailto:${encodeURIComponent(appointment.email)}?subject=${encodeURIComponent(`AMREAL appointment ${appointment.booking_id}`)}&body=${encodeURIComponent(contactMessage)}`;

  useEffect(() => {
    if (service && date) void getAvailableSlots(service.id, date, appointment.id).then(setSlots).catch(err => setError(err.message));
  }, [service?.id, date, appointment.id]);

  const saveStatus = async (status: AppointmentRecord["status"]) => {
    setBusy(true);
    await onSave({ status }, `Booking ${showStatus(status).toLowerCase()}.`);
    setBusy(false);
  };
  const reschedule = async () => {
    if (!service || !slots.includes(time)) { setError("Choose an available slot before rescheduling."); return; }
    setBusy(true);
    const start = new Date(`${date}T${time}:00+05:30`);
    const end = new Date(start.getTime() + (service.duration_minutes + service.buffer_minutes) * 60000);
    await onSave({ starts_at: start.toISOString(), ends_at: end.toISOString() }, "Appointment rescheduled.");
    setBusy(false);
  };
  const saveNotes = async () => {
    setBusy(true);
    await onSave({ notes }, "Internal notes saved.");
    setBusy(false);
  };

  return <div className="appointment-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="appointment-detail-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-detail-title">
      <header><div><p className="appointment-eyebrow">{appointment.booking_id}</p><h2 id="appointment-detail-title">{appointment.customer_name}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close details"><X size={19} /></button></header>
      {error && <p className="appointment-error">{error}</p>}
      <div className="appointment-detail-grid">
        <div><span>Phone</span><a href={`tel:${appointment.phone}`}>{appointment.phone}</a></div>
        <div><span>Email</span><a href={`mailto:${appointment.email}`}>{appointment.email}</a></div>
        <div><span>Service</span><strong>{appointment.service_name || "Service"}</strong></div>
        <div><span>Date & time</span><strong>{getAppointmentDateTime(appointment.starts_at)}–{getAppointmentTime(appointment.ends_at)} IST</strong></div>
        <div><span>Status</span><StatusBadge status={appointment.status} /></div>
        <div><span>Created</span><strong>{getAppointmentDateTime(appointment.created_at)}</strong></div>
      </div>
      <div className="appointment-detail-actions">
        {appointment.status === "pending" && <><button className="button button-small" disabled={busy} onClick={() => void saveStatus("confirmed")}><Check size={14} /> Confirm</button><button className="button button-small appointment-reject" disabled={busy} onClick={() => void saveStatus("rejected")}>Reject</button></>}
        {["pending", "confirmed"].includes(appointment.status) && <><button className="button button-small button-secondary" disabled={busy} onClick={() => void saveStatus("cancelled")}>Cancel booking</button><button className="button button-small button-secondary" disabled={busy} onClick={() => void saveStatus("completed")}>Mark completed</button><button className="button button-small button-secondary" disabled={busy} onClick={() => void saveStatus("no_show")}>Mark no-show</button></>}
      </div>
      <div className="appointment-contact-actions">
        <a className="button button-small button-secondary" href={emailUrl}><Mail size={13} /> Email customer</a>
        <a className="button button-small button-secondary" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={13} /> WhatsApp customer</a>
      </div>
      {["pending", "confirmed"].includes(appointment.status) && <div className="appointment-reschedule">
        <h3><Clock3 size={15} /> Reschedule</h3><div className="appointment-reschedule-fields"><label>Date<input type="date" min={getIndiaDate(new Date())} value={date} onChange={event => setDate(event.target.value)} /></label><label>Available time<select value={time} onChange={event => setTime(event.target.value)}><option value="">Select a slot</option>{slots.map(slot => <option key={slot} value={slot}>{slot}</option>)}</select></label><button className="button button-small" disabled={busy || !slots.includes(time)} onClick={() => void reschedule()}>Save time</button></div>
      </div>}
      <div className="appointment-notes"><label htmlFor="appointment-notes">Internal notes</label><textarea id="appointment-notes" rows={3} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Add a private note for the team" /><button className="button button-small button-secondary" disabled={busy} onClick={() => void saveNotes()}><Save size={13} /> Save notes</button></div>
      <div className="appointment-history"><button className="appointment-text-button" onClick={() => setHistory(!history)}>Customer booking history ({customerHistory.length}) <ChevronRight className={history ? "rotate-90" : ""} size={14} /></button>
        {history && (customerHistory.length ? customerHistory.map(item => <div className="appointment-history-item" key={item.id}><span>{item.booking_id} · {item.service_name}</span><span>{getAppointmentDateTime(item.starts_at)} · {showStatus(item.status)}</span></div>) : <p>No previous bookings for this customer.</p>)}
      </div>
    </section>
  </div>;
}

function AvailabilityPanel({ bundle, run, demoData }: {
  bundle: AppointmentBundle;
  run: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
  demoData: boolean;
}) {
  const [selectedService, setSelectedService] = useState("");
  const [weekday, setWeekday] = useState(1);
  const existing = bundle.availability.find(item => item.weekday === weekday
    && item.service_id === (selectedService || null) && Boolean(item.is_demo) === demoData);
  const [draft, setDraft] = useState<AvailabilityDay>(existing || defaultAvailability(weekday, demoData, selectedService || null));
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isHoliday, setIsHoliday] = useState(true);
  const [breakStart, setBreakStart] = useState("13:00");
  const [breakEnd, setBreakEnd] = useState("14:00");
  useEffect(() => {
    const value = bundle.availability.find(item => item.weekday === weekday
      && item.service_id === (selectedService || null) && Boolean(item.is_demo) === demoData);
    setDraft(value || defaultAvailability(weekday, demoData, selectedService || null));
  }, [weekday, selectedService, bundle.availability, demoData]);
  const update = (key: keyof AvailabilityDay, value: AvailabilityDay[keyof AvailabilityDay]) => setDraft(current => ({ ...current, [key]: value }));
  const addBreak = () => {
    if (breakStart >= breakEnd) return;
    update("breaks", [...draft.breaks, { start: breakStart, end: breakEnd }]);
  };
  const submitBlockedDate = async () => {
    if (!blockDate || !blockReason.trim()) return;
    const saved = await run(() => addBlockedDate(blockDate, blockReason.trim(), isHoliday, demoData), isHoliday ? "Holiday added." : "Date blocked.");
    if (saved) {
      setBlockDate("");
      setBlockReason("");
    }
  };
  return <div className="availability-panel">
    <div className="appointment-panel-heading"><div><p className="appointment-eyebrow">OPERATING HOURS</p><h2>Availability</h2></div></div>
    <p className="appointment-panel-intro">Set business hours, slot spacing, breaks and booking limits. A service-specific schedule overrides the business default for that day.</p>
    <section className="appointment-card availability-editor">
      <div className="availability-top-controls"><label>Schedule for<select value={selectedService} onChange={event => setSelectedService(event.target.value)}><option value="">Business default</option>{bundle.services.map(service => <option value={service.id} key={service.id}>{service.name}</option>)}</select></label><label>Day<select value={weekday} onChange={event => setWeekday(Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => <option value={index} key={index}>{getWeekdayName(index)}</option>)}</select></label></div>
      <label className="availability-open-toggle"><input type="checkbox" checked={draft.is_open} onChange={event => update("is_open", event.target.checked)} /> Open for bookings on {getWeekdayName(weekday)}</label>
      <div className="appointment-form-grid">
        <label>Opening time<input type="time" value={draft.opens_at} onChange={event => update("opens_at", event.target.value)} disabled={!draft.is_open} /></label>
        <label>Closing time<input type="time" value={draft.closes_at} onChange={event => update("closes_at", event.target.value)} disabled={!draft.is_open} /></label>
        <label>Booking interval (minutes)<input type="number" min="5" step="5" value={draft.slot_interval_minutes} onChange={event => update("slot_interval_minutes", Number(event.target.value))} /></label>
        <label>Default buffer (minutes)<input type="number" min="0" step="5" value={draft.buffer_minutes} onChange={event => update("buffer_minutes", Number(event.target.value))} /></label>
        <label>Advance booking (days)<input type="number" min="1" value={draft.advance_booking_days} onChange={event => update("advance_booking_days", Number(event.target.value))} /></label>
        <label>Minimum notice (hours)<input type="number" min="0" value={draft.minimum_notice_hours} onChange={event => update("minimum_notice_hours", Number(event.target.value))} /></label>
        <label>Maximum bookings per day<input type="number" min="1" value={draft.max_daily_bookings} onChange={event => update("max_daily_bookings", Number(event.target.value))} /></label>
      </div>
      <div className="availability-break-editor"><strong>Breaks</strong>{draft.breaks.map((period, index) => <div className="availability-break-row" key={`${period.start}-${index}`}><span>{period.start}–{period.end}</span><button className="appointment-text-button" onClick={() => update("breaks", draft.breaks.filter((_, breakIndex) => breakIndex !== index))}>Remove</button></div>)}<div className="availability-add-break"><input type="time" value={breakStart} onChange={event => setBreakStart(event.target.value)} /><span>to</span><input type="time" value={breakEnd} onChange={event => setBreakEnd(event.target.value)} /><button className="button button-small button-secondary" onClick={addBreak}><Plus size={13} /> Add break</button></div></div>
      <button className="button button-small" onClick={() => void run(() => saveAvailabilityDay(draft), "Availability saved.")}><Save size={13} /> Save {selectedService ? "service" : "business"} hours</button>
    </section>
    <EmployeeAvailability bundle={bundle} run={run} />
    <section className="appointment-card"><div className="appointment-card-heading"><div><h3>Holidays & blocked dates</h3><span>Unavailable dates are removed from customer booking slots.</span></div></div>
      <div className="blocked-date-form"><label>Date<input type="date" min={getIndiaDate(new Date())} value={blockDate} onChange={event => setBlockDate(event.target.value)} /></label><label>Reason<input value={blockReason} onChange={event => setBlockReason(event.target.value)} placeholder="e.g. Public holiday" /></label><label className="availability-open-toggle"><input type="checkbox" checked={isHoliday} onChange={event => setIsHoliday(event.target.checked)} /> Mark as holiday</label><button className="button button-small" disabled={!blockDate || !blockReason.trim()} onClick={() => void submitBlockedDate()}><Plus size={13} /> Add date</button></div>
      {bundle.blocked.length ? bundle.blocked.map(item => <div className="blocked-date-row" key={item.id}><strong>{dateInputValue(item.starts_at)}</strong><span>{item.reason}{item.is_holiday ? " · Holiday" : " · Blocked"}</span><button className="appointment-text-button" onClick={() => void run(() => removeBlockedDate(item.id), "Blocked date removed.")}>Remove</button></div>) : <p className="appointment-empty">No holidays or blocked dates configured.</p>}
    </section>
  </div>;
}

function EmployeeAvailability({ bundle, run }: {
  bundle: AppointmentBundle;
  run: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState(bundle.employees[0]?.id || "");
  const [weekday, setWeekday] = useState(1);
  const [breakStart, setBreakStart] = useState("13:00");
  const [breakEnd, setBreakEnd] = useState("14:00");
  const [timeOffDate, setTimeOffDate] = useState(() => {
    const tomorrow = new Date(`${getIndiaDate(new Date())}T12:00:00+05:30`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getIndiaDate(tomorrow);
  });
  const [timeOffStart, setTimeOffStart] = useState("10:00");
  const [timeOffEnd, setTimeOffEnd] = useState("11:00");
  const [timeOffReason, setTimeOffReason] = useState("");
  const [draft, setDraft] = useState<EmployeeSchedule>({
    employee_id: employeeId, weekday, is_working: true, opens_at: "10:00", closes_at: "18:00", breaks: [],
  });
  const selectedEmployee = bundle.employees.find(item => item.id === employeeId);
  useEffect(() => {
    const saved = bundle.employeeSchedules.find(item => item.employee_id === employeeId && item.weekday === weekday);
    setDraft(saved || {
      employee_id: employeeId, weekday, is_working: weekday !== 0,
      opens_at: "10:00", closes_at: "18:00", breaks: [],
    });
  }, [employeeId, weekday, bundle.employeeSchedules]);

  const addEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await run(async () => {
      const saved = await saveEmployee(name);
      setEmployeeId(saved.id);
      setName("");
    }, "Employee added.");
    return result;
  };
  const saveSchedule = () => {
    if (draft.is_working && draft.opens_at >= draft.closes_at) {
      return run(() => Promise.reject(new Error("Closing time must be after opening time.")), "");
    }
    return run(() => saveEmployeeSchedule(draft), "Employee schedule saved.");
  };
  const addBreak = () => {
    if (breakStart >= breakEnd) return;
    setDraft(current => ({ ...current, breaks: [...current.breaks, { start: breakStart, end: breakEnd }] }));
  };
  const addTimeOff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeId) return;
    const saved = await run(() => addEmployeeTimeOff(employeeId, timeOffDate, timeOffStart, timeOffEnd, timeOffReason), "Employee time off added.");
    if (saved) setTimeOffReason("");
  };

  return <section className="appointment-card employee-schedule-panel">
    <div className="appointment-card-heading"><div><h3>Employee availability</h3><span>Optional schedules refine slots for services assigned to an employee.</span></div></div>
    <form className="employee-add-form" onSubmit={event => void addEmployee(event)}>
      <label>Add employee<input value={name} onChange={event => setName(event.target.value)} placeholder="Employee name" required /></label>
      <button className="button button-small button-secondary" type="submit"><Plus size={13} /> Add employee</button>
    </form>
    {bundle.employees.length ? <>
      <div className="employee-schedule-controls">
        <label>Employee<select value={employeeId} onChange={event => setEmployeeId(event.target.value)}>{bundle.employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}{employee.active ? "" : " · Inactive"}</option>)}</select></label>
        <label>Day<select value={weekday} onChange={event => setWeekday(Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => <option key={index} value={index}>{getWeekdayName(index)}</option>)}</select></label>
      </div>
      {selectedEmployee && <p className="employee-schedule-caption">Editing {selectedEmployee.name} · {getWeekdayName(weekday)}</p>}
      <label className="availability-open-toggle"><input type="checkbox" checked={draft.is_working} onChange={event => setDraft(current => ({ ...current, is_working: event.target.checked }))} /> Working this day</label>
      <div className="appointment-form-grid">
        <label>Opening time<input type="time" value={draft.opens_at} disabled={!draft.is_working} onChange={event => setDraft(current => ({ ...current, opens_at: event.target.value }))} /></label>
        <label>Closing time<input type="time" value={draft.closes_at} disabled={!draft.is_working} onChange={event => setDraft(current => ({ ...current, closes_at: event.target.value }))} /></label>
      </div>
      <div className="availability-break-editor"><strong>Employee breaks</strong>
        {draft.breaks.map((period, index) => <div className="availability-break-row" key={`${period.start}-${index}`}><span>{period.start}–{period.end}</span><button type="button" className="appointment-text-button" onClick={() => setDraft(current => ({ ...current, breaks: current.breaks.filter((_, breakIndex) => breakIndex !== index) }))}>Remove</button></div>)}
        <div className="availability-add-break"><input type="time" value={breakStart} onChange={event => setBreakStart(event.target.value)} /><span>to</span><input type="time" value={breakEnd} onChange={event => setBreakEnd(event.target.value)} /><button type="button" className="button button-small button-secondary" onClick={addBreak}><Plus size={13} /> Add break</button></div>
      </div>
      <button className="button button-small" onClick={() => void saveSchedule()}><Save size={13} /> Save employee schedule</button>
      <div className="employee-timeoff">
        <h4>Employee time off</h4>
        <form className="blocked-date-form" onSubmit={event => void addTimeOff(event)}>
          <label>Date<input type="date" min={getIndiaDate(new Date())} value={timeOffDate} onChange={event => setTimeOffDate(event.target.value)} required /></label>
          <label>From<input type="time" value={timeOffStart} onChange={event => setTimeOffStart(event.target.value)} required /></label>
          <label>To<input type="time" value={timeOffEnd} onChange={event => setTimeOffEnd(event.target.value)} required /></label>
          <label>Reason<input value={timeOffReason} onChange={event => setTimeOffReason(event.target.value)} placeholder="Leave, unavailable, etc." required /></label>
          <button className="button button-small button-secondary" type="submit"><Plus size={13} /> Add time off</button>
        </form>
        {bundle.employeeTimeOff.filter(item => item.employee_id === employeeId).map(item => <div className="blocked-date-row" key={item.id}>
          <strong>{getAppointmentDate(item.starts_at)}</strong><span>{getAppointmentTime(item.starts_at)}–{getAppointmentTime(item.ends_at)} · {item.reason}</span>
          <button className="appointment-text-button" onClick={() => void run(() => removeEmployeeTimeOff(item.id), "Employee time off removed.")}>Remove</button>
        </div>)}
      </div>
    </> : <p className="appointment-empty">Add an employee to configure individual working days and hours.</p>}
  </section>;
}

function ServicesPanel({ bundle, run, demoData }: {
  bundle: AppointmentBundle;
  run: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
  demoData: boolean;
}) {
  const [editing, setEditing] = useState<Partial<AppointmentService> | null>(null);
  const [employees, setEmployees] = useState<string[]>([]);
  const [error, setError] = useState("");
  const save = async () => {
    if (!editing?.name?.trim()) { setError("Service name is required."); return; }
    if (!Number(editing.duration_minutes) || Number(editing.duration_minutes) < 5) { setError("Service duration must be at least 5 minutes."); return; }
    setError("");
    const saved = await run(() => saveAppointmentService({
      ...editing, name: editing.name?.trim(), duration_minutes: Number(editing.duration_minutes),
      buffer_minutes: Number(editing.buffer_minutes || 0),
      employee_ids: employees,
      is_demo: editing.id ? editing.is_demo : demoData,
    }), editing.id ? "Service updated." : "Service created.");
    if (saved) setEditing(null);
  };
  return <div className="services-panel">
    <div className="appointment-panel-heading"><div><p className="appointment-eyebrow">BOOKABLE OFFERINGS</p><h2>Services</h2></div><button className="button button-small" onClick={() => { setEditing({ ...EMPTY_SERVICE }); setEmployees([]); }}><Plus size={14} /> Add service</button></div>
    <p className="appointment-panel-intro">Service duration and buffer time are included in slot calculations. Inactive services are hidden from customer booking.</p>
    {error && <p className="appointment-error">{error}</p>}
    {editing && <section className="appointment-card service-editor">
      <div className="appointment-card-heading"><h3>{editing.id ? "Edit service" : "New service"}</h3><button className="icon-btn" onClick={() => setEditing(null)} aria-label="Close"><X size={18} /></button></div>
      <div className="appointment-form-grid">
        <label>Service name<input value={editing.name || ""} onChange={event => setEditing({ ...editing, name: event.target.value })} placeholder="e.g. Product Consultation" /></label>
        <label>Duration (minutes)<input type="number" min="5" step="5" value={editing.duration_minutes || 30} onChange={event => setEditing({ ...editing, duration_minutes: Number(event.target.value) })} /></label>
        <label>Buffer time (minutes)<input type="number" min="0" step="5" value={editing.buffer_minutes ?? 10} onChange={event => setEditing({ ...editing, buffer_minutes: Number(event.target.value) })} /></label>
        <label className="appointment-wide">Description<textarea rows={3} value={editing.description || ""} onChange={event => setEditing({ ...editing, description: event.target.value })} placeholder="Describe what customers can expect" /></label>
        <fieldset className="appointment-wide service-employee-options"><legend>Eligible employees</legend>
          {bundle.employees.filter(employee => employee.active).length
            ? bundle.employees.filter(employee => employee.active).map(employee => <label key={employee.id}><input type="checkbox" checked={employees.includes(employee.name)} onChange={event => setEmployees(current => event.target.checked
              ? [...current, employee.name]
              : current.filter(name => name !== employee.name))} /> {employee.name}</label>)
            : <small>No active employees yet. Leave this service on the shared business calendar or add employees in Availability.</small>}
          <small>Select staff for this service, or leave all unchecked to use the shared business calendar.</small>
        </fieldset>
        <label className="availability-open-toggle"><input type="checkbox" checked={editing.active !== false} onChange={event => setEditing({ ...editing, active: event.target.checked })} /> Active and bookable</label>
      </div>
      <div className="appointment-form-actions"><button className="button button-small" onClick={() => void save()}><Save size={13} /> Save service</button><button className="button button-small button-secondary" onClick={() => setEditing(null)}>Cancel</button></div>
    </section>}
    <div className="service-cards">{bundle.services.map(service => <article className="service-card" key={service.id}>
      <div className="service-card-top"><span className={service.active ? "service-active" : "service-inactive"}>{service.active ? "Active" : "Inactive"}</span><button className="appointment-text-button" onClick={() => { setEditing({ ...service }); setEmployees(service.employee_ids || []); }}><Edit3 size={14} /> Edit</button></div>
      <h3>{service.name}</h3><p>{service.description || "No description added."}</p><div className="service-card-meta"><span><Clock3 size={14} /> {service.duration_minutes} min</span><span>{service.buffer_minutes} min buffer</span></div>
      <div className="service-card-availability">{service.employee_ids?.length ? `Eligible: ${service.employee_ids.join(", ")}` : "Any available employee"} · Availability: {bundle.availability.some(day => day.service_id === service.id) ? "Custom schedule" : "Business default"}</div>
    </article>)}</div>
  </div>;
}

export function AppointmentBookingPage() {
  const [services, setServices] = useState<AppointmentService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<AppointmentRecord | null>(null);
  const minDate = getIndiaDate(new Date());

  useEffect(() => {
    let mounted = true;
    void loadBookableServices().then(activeServices => {
      if (!mounted) return;
      setServices(activeServices);
      if (activeServices[0]) setServiceId(activeServices[0].id);
    }).catch(err => {
      if (mounted) setError(err instanceof Error ? err.message : "Could not load bookable services.");
    });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!serviceId || !date) { setSlots([]); setTime(""); return; }
    let active = true;
    setLoading(true);
    setError("");
    void getAvailableSlots(serviceId, date).then(result => {
      if (active) setSlots(result);
    }).catch(err => {
      if (active) setError(err instanceof Error ? err.message : "Could not load available times.");
    }).finally(() => { if (active) setLoading(false); });
    setTime("");
    return () => { active = false; };
  }, [serviceId, date]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!serviceId || !date || !time) { setError("Choose a service, date and available time."); return; }
    setSubmitting(true);
    setError("");
    try {
      const appointment = await createAppointment({
        service_id: serviceId, date, time,
        customer_name: String(form.get("name") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
      });
      setConfirmation(appointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your booking could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const selectedService = services.find(service => service.id === serviceId);

  return <main className="booking-page">
    <header className="booking-page-header"><Link to="/" className="booking-brand"><img src="/assets/amreal-logo-golden-above.png" alt="AMREAL Professional" /></Link><Link to="/" className="booking-back"><ArrowLeft size={15} /> Back to website</Link></header>
    <section className="booking-hero"><p className="appointment-eyebrow">AMREAL PROFESSIONAL</p><h1>Book an appointment</h1><p>Choose a service and a time that works for you. We’ll confirm your request shortly.</p></section>
    {confirmation ? <section className="booking-confirmation"><span className="booking-confirmation-icon"><Check size={25} /></span><p className="appointment-eyebrow">REQUEST RECEIVED</p><h2>Your appointment is pending confirmation</h2><p>We’ll be in touch to confirm the details.</p><div><span>Booking ID</span><strong>{confirmation.booking_id}</strong><span>Service</span><strong>{confirmation.service_name || selectedService?.name}</strong><span>Date & time (IST)</span><strong>{getAppointmentDateTime(confirmation.starts_at)}</strong></div><button className="button button-small button-secondary" onClick={() => { setConfirmation(null); setDate(""); setTime(""); }}>Make another booking</button></section>
      : <form className="booking-form" onSubmit={submit}>
        {error && <p className="appointment-error"><AlertCircle size={15} /> {error}</p>}
        <div className="booking-step"><span>01</span><div><h2>Choose your service</h2><p>Select the appointment type you need.</p></div></div>
        <label className="booking-field">Service<select required value={serviceId} onChange={event => setServiceId(event.target.value)}><option value="">Choose a service</option>{services.map(service => <option key={service.id} value={service.id}>{service.name} · {service.duration_minutes} min</option>)}</select>{selectedService?.description && <small>{selectedService.description}</small>}{!services.length && !error && <small>Appointments are not available right now. Please contact AMREAL directly.</small>}</label>
        <div className="booking-step"><span>02</span><div><h2>Select a date & time</h2><p>Available times update using the current appointment schedule.</p></div></div>
        <label className="booking-field">Date<input type="date" min={minDate} value={date} onChange={event => setDate(event.target.value)} required /></label>
        {date && <div className="booking-slot-section"><span>Available times</span>{loading ? <p className="booking-slot-message"><Loader className="spin" size={15} /> Finding available times…</p> : slots.length ? <div className="booking-slot-grid">{slots.map(slot => <button type="button" className={time === slot ? "selected" : ""} key={slot} onClick={() => setTime(slot)}>{slot}</button>)}</div> : <p className="booking-slot-message">No times available on this date. Try another date.</p>}</div>}
        <div className="booking-step"><span>03</span><div><h2>Your details</h2><p>We’ll use these details to contact you about the booking.</p></div></div>
        <div className="booking-contact-grid"><label className="booking-field">Full name<input name="name" autoComplete="name" required maxLength={120} /></label><label className="booking-field">Mobile number<input name="phone" type="tel" autoComplete="tel" required maxLength={32} placeholder="+91" /></label><label className="booking-field booking-wide">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label></div>
        <button className="button booking-submit" disabled={submitting || loading || !services.length || !time}>{submitting ? <Loader className="spin" size={15} /> : <CalendarDays size={15} />}{submitting ? "Submitting…" : "Request appointment"}</button>
        <p className="booking-privacy-note">Your booking is only confirmed after AMREAL reviews your request. All times are in India Standard Time.</p>
      </form>}
    <footer className="booking-footer">AMREAL Professional · Appointment bookings</footer>
  </main>;
}
