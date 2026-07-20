import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { InfoIcon, LockIcon } from '../components/icons';
import PasswordInput, { passwordIsValid } from '../components/PasswordInput';
import PhoneInput, { phoneIsValid, fullPhone } from '../components/PhoneInput';
import { homePathForRole, useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { CATEGORIES } from '../lib/categories';
import { COUNTRIES, provinces, cities, barangays, zipFor } from '../lib/philippines';

const PLANS = [
  { key: 'trial', name: 'Free Trial', price: 'Free', note: '7 days, no card required', limit: '1 business' },
  { key: 'monthly', name: 'Monthly', price: '$29/mo', note: 'Cancel anytime', limit: 'Up to 5 businesses' },
  { key: 'yearly', name: 'Yearly', price: '$290/yr', note: 'Save 2 months', limit: 'Unlimited businesses', best: true },
];

const PAYMENT_METHODS = [
  { key: 'card', label: 'Credit / Debit Card' },
  { key: 'gcash', label: 'GCash' },
  { key: 'paypal', label: 'PayPal' },
];

const GENDERS = ['Male', 'Female', 'Prefer not to say'];
const ID_TYPES = [
  'Philippine Passport',
  "Driver's License",
  'UMID / SSS',
  'PhilSys (National ID)',
  'PRC ID',
  'Postal ID',
  'TIN ID',
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRe = /^[\p{L}\p{M}\s.'-]+$/u;
const idRe = /^[A-Z0-9-]{5,20}$/;

// -- Input transforms (block unsafe characters as the user types) --
const onlyName = (v) => v.replace(/[^\p{L}\p{M}\s.'-]/gu, '').slice(0, 120);
const onlyBusiness = (v) => v.replace(/[^\p{L}\p{N}\s&.,'-]/gu, '').slice(0, 120);
const onlyStreet = (v) => v.replace(/[^\p{L}\p{N}\s.,#'/-]/gu, '').slice(0, 120);
const onlyZip = (v) => v.replace(/\D/g, '').slice(0, 4);
const onlyId = (v) => v.replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 20);
const onCardNumber = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
const onCvc = (v) => v.replace(/\D/g, '').slice(0, 4);
const onExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

// Trim + collapse whitespace + strip control characters before sending.
// eslint-disable-next-line no-control-regex
const clean = (v) => (v || '').replace(/[\x00-\x1f]/g, '').replace(/\s+/g, ' ').trim();

// Luhn check for card numbers.
function luhnOk(num) {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

// Whole years between a birth date and today.
function ageFrom(dob) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return NaN;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

// -- Roles --
const roles = [
  {
    key: 'renter',
    title: 'Renter',
    subtitle: 'Browse and book rentals',
    icon: 'M9 7a3 3 0 100-.001M4 21v-1a5 5 0 0110 0v1',
  },
  {
    key: 'owner',
    title: 'Business Owner',
    subtitle: 'List items and manage rentals',
    icon: 'M3 10h18l-1-4H4l-1 4zm0 0v9a1 1 0 001 1h16a1 1 0 001-1v-9',
  },
];

const OWNER_STEPS = ['Account', 'Owner', 'Business', 'Plan', 'Payment'];

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState(null);
  const [step, setStep] = useState('role'); // role | account | owner | business | plan | payment
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null); // {title, detail, hint, action?}
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    // Account
    fullName: '',
    email: '',
    password: '',
    // Owner information
    ownerPhoneCountry: 'PH',
    ownerPhone: '',
    dob: '',
    gender: '',
    idType: '',
    idNumber: '',
    // Business
    businessName: '',
    category: '',
    phoneCountry: 'PH',
    phone: '',
    country: 'PH',
    province: '',
    city: '',
    barangay: '',
    street: '',
    zip: '',
    description: '',
    // Plan / payment
    plan: 'trial',
    method: 'card',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const clearErrors = (...names) =>
    setFieldErrors((fe) => {
      const next = { ...fe };
      names.forEach((k) => delete next[k]);
      return next;
    });
  const onChange = (e) => {
    set({ [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) clearErrors(e.target.name);
  };

  // -- Validation (returns { field: message }) --
  const validateAccount = () => {
    const e = {};
    const fullName = form.fullName.trim();
    if (!fullName) e.fullName = 'Enter your full name.';
    else if (fullName.length < 2) e.fullName = 'That name looks too short.';
    else if (!nameRe.test(fullName)) e.fullName = 'Use letters only - no numbers or symbols.';
    if (!form.email.trim()) e.email = 'Enter your email address.';
    else if (form.email.length > 180 || !emailRe.test(form.email)) e.email = 'Enter a valid email, e.g. you@example.com.';
    if (!passwordIsValid(form.password)) e.password = 'Your password does not meet all the requirements below.';
    return e;
  };

  const validateOwner = () => {
    const e = {};
    if (!form.ownerPhone.trim()) e.ownerPhone = 'Add a contact number.';
    else if (!phoneIsValid(form.ownerPhoneCountry, form.ownerPhone)) e.ownerPhone = 'Enter a complete, valid phone number.';
    if (!form.dob) e.dob = 'Enter your date of birth.';
    else {
      const age = ageFrom(form.dob);
      if (Number.isNaN(age)) e.dob = 'Enter a valid date.';
      else if (new Date(form.dob) > new Date()) e.dob = 'Date of birth cannot be in the future.';
      else if (age < 18) e.dob = 'You must be at least 18 to own a business.';
      else if (age > 120) e.dob = 'Enter a valid date of birth.';
    }
    if (!form.gender) e.gender = 'Select an option.';
    if (!form.idType) e.idType = 'Choose an ID type.';
    if (!form.idNumber.trim()) e.idNumber = 'Enter your ID number.';
    else if (!idRe.test(form.idNumber)) e.idNumber = 'ID number should be 5-20 letters/numbers.';
    return e;
  };

  const validateBusiness = () => {
    const e = {};
    const bn = form.businessName.trim();
    if (!bn) e.businessName = 'Enter your business name so customers can find you.';
    else if (bn.length < 2) e.businessName = 'That business name looks too short.';
    if (!form.category) e.category = 'Choose the category you rent out.';
    if (!form.country) e.country = 'Select a country.';
    if (!form.province) e.province = 'Select a province.';
    if (!form.city) e.city = 'Select a city or municipality.';
    if (!form.barangay.trim()) e.barangay = 'Enter or select your barangay.';
    if (!form.street.trim()) e.street = 'Enter your street / house no.';
    else if (form.street.trim().length < 3) e.street = 'That address looks too short.';
    if (!/^\d{4}$/.test(form.zip)) e.zip = 'ZIP code must be 4 digits.';
    if (form.description.length > 500) e.description = 'Keep the description under 500 characters.';
    return e;
  };

  const validatePayment = () => {
    const e = {};
    if (form.method === 'card') {
      if (!form.cardName.trim()) e.cardName = 'Enter the name on the card.';
      else if (!nameRe.test(form.cardName.trim())) e.cardName = 'Use letters only.';
      if (!luhnOk(form.cardNumber)) e.cardNumber = 'Enter a valid card number.';
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Use MM/YY format.';
      else {
        const [mm, yy] = form.expiry.split('/').map(Number);
        const now = new Date();
        const curYy = now.getFullYear() % 100;
        const curMm = now.getMonth() + 1;
        if (mm < 1 || mm > 12) e.expiry = 'Month must be 01-12.';
        else if (yy < curYy || (yy === curYy && mm < curMm)) e.expiry = 'That card has expired.';
      }
      if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = 'CVC is 3-4 digits.';
    }
    return e;
  };

  const guard = (validator, nextStep, onPass) => {
    setBanner(null);
    const e = validator();
    if (Object.keys(e).length) {
      setFieldErrors(e);
      return;
    }
    setFieldErrors({});
    if (onPass) onPass();
    else setStep(nextStep);
  };

  // -- Friendly error mapping --
  const toBanner = (err) => {
    if (err.status === 409) {
      return {
        title: 'That email is already registered',
        detail: 'An account with this email already exists.',
        hint: 'Try logging in instead, or sign up with a different email.',
        action: { to: '/login', label: 'Go to login' },
      };
    }
    if (err.status === 429) {
      return {
        title: 'Too many attempts',
        detail: 'You have tried several times in a short period.',
        hint: 'Please wait about a minute, then try again.',
      };
    }
    if (err.status === 400) {
      return {
        title: 'Please check your details',
        detail: err.message,
        hint: 'Fix the highlighted fields and try again.',
      };
    }
    return {
      title: 'Something went wrong',
      detail: err.message || 'We could not complete your sign up.',
      hint: 'Please try again in a moment. If it keeps happening, contact support.',
    };
  };

  // -- Submit --
  const submit = async () => {
    setLoading(true);
    setBanner(null);
    try {
      const user = await register({
        fullName: clean(form.fullName),
        email: form.email.trim(),
        password: form.password,
        role: role === 'owner' ? 'owner' : 'customer',
      });

      if (role === 'owner') {
        // Upgrade to the chosen paid plan (trial is the default from register).
        if (form.plan !== 'trial') {
          try {
            await api.subscription.choosePlan(form.plan);
          } catch {
            /* keep going; owner can manage plan later */
          }
        }
        // Compose the structured address into one line (API stores a string).
        const location = clean(
          `${form.street}, Brgy. ${form.barangay}, ${form.city}, ${form.province} ${form.zip}, Philippines`,
        ).slice(0, 160);
        // Create their first business.
        try {
          await api.businesses.create({
            name: clean(form.businessName),
            category: form.category,
            phone: fullPhone(form.ownerPhoneCountry, form.ownerPhone),
            location,
            description: clean(form.description) || undefined,
          });
        } catch {
          /* non-fatal; they can add it in the dashboard */
        }
      }
      navigate(homePathForRole(user.role));
    } catch (err) {
      const b = toBanner(err);
      setBanner(b);
      if (err.status === 409 || err.status === 400) setStep('account');
    } finally {
      setLoading(false);
    }
  };

  // -- Render --
  return (
    <AuthLayout>
      {step === 'role' ? (
        <RoleStep onPick={(k) => { setRole(k); setStep('account'); }} />
      ) : (
        <div>
          {role === 'owner' && <Stepper step={step} plan={form.plan} />}

          <Banner banner={banner} />

          {step === 'account' && (
            <AccountStep
              form={form}
              onChange={onChange}
              errors={fieldErrors}
              isOwner={role === 'owner'}
              loading={loading}
              onBack={() => { setStep('role'); setBanner(null); setFieldErrors({}); }}
              onNext={() =>
                guard(validateAccount, 'owner', role === 'owner' ? undefined : submit)
              }
            />
          )}

          {step === 'owner' && (
            <OwnerStep
              form={form}
              set={set}
              onChange={onChange}
              clearErrors={clearErrors}
              errors={fieldErrors}
              onBack={() => setStep('account')}
              onNext={() => guard(validateOwner, 'business')}
            />
          )}

          {step === 'business' && (
            <BusinessStep
              form={form}
              set={set}
              onChange={onChange}
              clearErrors={clearErrors}
              errors={fieldErrors}
              onBack={() => setStep('owner')}
              onNext={() => guard(validateBusiness, 'plan')}
            />
          )}

          {step === 'plan' && (
            <PlanStep
              form={form}
              set={set}
              onBack={() => setStep('business')}
              loading={loading}
              onNext={() => {
                setBanner(null);
                if (form.plan === 'trial') submit();
                else setStep('payment');
              }}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              form={form}
              onChange={onChange}
              set={set}
              errors={fieldErrors}
              loading={loading}
              onBack={() => setStep('plan')}
              onPay={() => guard(validatePayment, null, submit)}
            />
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

/* -- Sub-components -- */

function RoleStep({ onPick }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to RentFlow</h1>
      <p className="mt-2 text-slate-500">Which describes you best?</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {roles.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onPick(r.key)}
            className="group rounded-xl border border-slate-200 p-5 text-left transition-all hover:border-accent hover:shadow-md"
          >
            <div className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-brand/10 text-slate-800">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
              </svg>
            </div>
            <p className="mt-4 flex items-center gap-1 text-lg font-semibold text-slate-900">
              {r.title}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M21 12H3" />
              </svg>
            </p>
            <p className="text-sm text-slate-500">{r.subtitle}</p>
          </button>
        ))}
      </div>
      <p className="mt-10 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function Stepper({ step, plan }) {
  const steps = plan === 'trial' ? OWNER_STEPS.slice(0, 4) : OWNER_STEPS;
  const current = { account: 0, owner: 1, business: 2, plan: 3, payment: 4 }[step] ?? 0;
  return (
    <ol className="mb-6 flex items-center gap-2">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i <= current ? 'bg-accent text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {i + 1}
          </span>
          <span className={`text-xs font-medium ${i === current ? 'text-slate-900' : 'text-slate-400'}`}>
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}

function Banner({ banner }) {
  if (!banner) return null;
  return (
    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">{banner.title}</p>
      {banner.detail && <p className="mt-1 text-sm text-red-700">{banner.detail}</p>}
      {banner.hint && (
        <p className="mt-1 flex items-start gap-1.5 text-sm text-red-600">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" /> {banner.hint}
        </p>
      )}
      {banner.action && (
        <Link to={banner.action.to} className="mt-2 inline-block text-sm font-semibold text-red-800 underline">
          {banner.action.label}
        </Link>
      )}
    </div>
  );
}

function Instructions({ children }) {
  return (
    <div className="mb-5 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-slate-600">
      {children}
    </div>
  );
}

function Field({ label, name, value, onChange, error, hint, transform, ...props }) {
  const handle = (e) => {
    if (transform) e.target.value = transform(e.target.value);
    onChange(e);
  };
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={handle}
        aria-invalid={!!error}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-300 focus:border-accent focus:ring-accent/20'
        }`}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

function Select({ label, name, value, onChange, error, children, disabled, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-300 focus:border-accent focus:ring-accent/20'
        }`}
      >
        {children}
      </select>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

function AccountStep({ form, onChange, errors, isOwner, loading, onBack, onNext }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1 text-slate-500">
        {isOwner ? 'Step 1 - your login details.' : 'Enter your details to get started.'}
      </p>

      <Instructions>
        Use a real email - you will use it to log in. Your password must meet the
        requirements shown as you type.
      </Instructions>

      <div className="space-y-4">
        <Field label="Full name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} transform={onlyName} autoComplete="name" placeholder="Jane Dela Cruz" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} maxLength={180} autoComplete="email" placeholder="you@example.com" />
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <PasswordInput value={form.password} onChange={onChange} />
          {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password}</span>}
        </div>
      </div>

      <StepButtons
        onBack={onBack}
        backLabel="Back"
        onNext={onNext}
        nextLabel={isOwner ? 'Continue' : 'Create account'}
        loading={loading}
      />
    </div>
  );
}

function OwnerStep({ form, set, onChange, clearErrors, errors, onBack, onNext }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Owner information</h1>
      <p className="mt-1 text-slate-500">Step 2 - tell us a bit about you, the account owner.</p>

      <Instructions>
        We use this to verify you own the business. Your personal details are kept
        private and never shown on your public listing.
      </Instructions>

      <div className="space-y-4">
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Personal contact number</span>
          <PhoneInput
            name="ownerPhone"
            country={form.ownerPhoneCountry}
            value={form.ownerPhone}
            onCountryChange={(code) => { set({ ownerPhoneCountry: code }); clearErrors('ownerPhone'); }}
            onValueChange={(val) => { set({ ownerPhone: val }); clearErrors('ownerPhone'); }}
            error={errors.ownerPhone}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of birth" name="dob" type="date" value={form.dob} onChange={onChange} error={errors.dob} max={today} />
          <Select label="Gender" name="gender" value={form.gender} onChange={onChange} error={errors.gender}>
            <option value="" disabled>Select...</option>
            {GENDERS.map((g) => <option key={g}>{g}</option>)}
          </Select>
        </div>

        <Select label="Government-issued ID" name="idType" value={form.idType} onChange={onChange} error={errors.idType}>
          <option value="" disabled>Select an ID type...</option>
          {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
        <Field label="ID number" name="idNumber" value={form.idNumber} onChange={onChange} error={errors.idNumber} transform={onlyId} hint="5-20 letters or numbers" placeholder="e.g. A12345678" />
      </div>

      <StepButtons onBack={onBack} backLabel="Back" onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

function BusinessStep({ form, set, onChange, clearErrors, errors, onBack, onNext }) {
  const brgyList = barangays(form.province, form.city);

  const onProvince = (e) => {
    set({ province: e.target.value, city: '', barangay: '', zip: '' });
    clearErrors('province', 'city', 'barangay', 'zip');
  };
  const onCity = (e) => {
    const city = e.target.value;
    set({ city, barangay: '', zip: zipFor(form.province, city) });
    clearErrors('city', 'barangay', 'zip');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business details</h1>
      <p className="mt-1 text-slate-500">Step 3 - tell us about your rental business.</p>

      <Instructions>
        This information appears on your public listing so customers know how to
        reach you and where you are located. You can edit it anytime later.
      </Instructions>

      <div className="space-y-4">
        <Field label="Business name" name="businessName" value={form.businessName} onChange={onChange} error={errors.businessName} transform={onlyBusiness} placeholder="Manila Car Rentals" />

        <Select label="Business category" name="category" value={form.category} onChange={onChange} error={errors.category} hint="What do you rent out?">
          <option value="" disabled>Select a category...</option>
          {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
        </Select>

        {/* Location - cascading selects */}
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Location</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Country" name="country" value={form.country} onChange={onChange} error={errors.country}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
            <Select label="Province" name="province" value={form.province} onChange={onProvince} error={errors.province}>
              <option value="" disabled>Select province...</option>
              {provinces().map((p) => <option key={p}>{p}</option>)}
            </Select>
            <Select label="City / Municipality" name="city" value={form.city} onChange={onCity} error={errors.city} disabled={!form.province} hint={!form.province ? 'Choose a province first' : undefined}>
              <option value="" disabled>Select city / municipality...</option>
              {cities(form.province).map((c) => <option key={c}>{c}</option>)}
            </Select>
            {brgyList.length ? (
              <Select label="Barangay" name="barangay" value={form.barangay} onChange={onChange} error={errors.barangay} disabled={!form.city} hint={!form.city ? 'Choose a city first' : undefined}>
                <option value="" disabled>Select barangay...</option>
                {brgyList.map((b) => <option key={b}>{b}</option>)}
              </Select>
            ) : (
              <Field label="Barangay" name="barangay" value={form.barangay} onChange={onChange} error={errors.barangay} transform={onlyStreet} disabled={!form.city} placeholder="Enter your barangay" hint={!form.city ? 'Choose a city first' : undefined} />
            )}
            <Field label="Street / House no." name="street" value={form.street} onChange={onChange} error={errors.street} transform={onlyStreet} placeholder="123 Rizal Ave." />
            <Field label="ZIP code" name="zip" value={form.zip} onChange={onChange} error={errors.zip} transform={onlyZip} inputMode="numeric" placeholder="1000" />
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            maxLength={500}
            placeholder="Optional - what makes your rentals great?"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
              errors.description
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-300 focus:border-accent focus:ring-accent/20'
            }`}
          />
          {errors.description ? (
            <span className="mt-1 block text-xs text-red-600">{errors.description}</span>
          ) : (
            <span className="mt-1 block text-xs text-slate-400">{form.description.length}/500</span>
          )}
        </label>
      </div>

      <StepButtons onBack={onBack} backLabel="Back" onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

function PlanStep({ form, set, onBack, onNext, loading }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Choose a plan</h1>
      <p className="mt-1 text-slate-500">Step 4 - start free or pick a paid plan.</p>

      <Instructions>
        Start with a <strong>7-day free trial</strong> - no card needed. You can
        upgrade or change plans anytime from your dashboard.
      </Instructions>

      <div className="space-y-3">
        {PLANS.map((p) => {
          const active = form.plan === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => set({ plan: p.key })}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                active ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <p className="flex items-center gap-2 font-semibold text-slate-900">
                  {p.name}
                  {p.best && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent-dark">Best value</span>}
                </p>
                <p className="text-xs text-slate-500">{p.note} - {p.limit}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{p.price}</span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-accent bg-accent text-white' : 'border-slate-300'}`}>
                  {active && (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <StepButtons
        onBack={onBack}
        backLabel="Back"
        onNext={onNext}
        nextLabel={form.plan === 'trial' ? 'Start free trial' : 'Continue to payment'}
        loading={loading}
      />
    </div>
  );
}

function PaymentStep({ form, onChange, set, errors, loading, onBack, onPay }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment method</h1>
      <p className="mt-1 text-slate-500">Step 5 - how would you like to pay?</p>

      <Instructions>
        <span className="flex items-start gap-1.5">
          <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This is a secure demo checkout - <strong>no real charge is made and
            card details are never stored</strong>. In production this connects to
            a PCI-compliant processor.
          </span>
        </span>
      </Instructions>

      {/* Method */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => set({ method: m.key })}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
              form.method === m.key ? 'border-accent bg-accent/5 text-accent-dark' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {form.method === 'card' ? (
        <div className="space-y-4">
          <Field label="Name on card" name="cardName" value={form.cardName} onChange={onChange} error={errors.cardName} transform={onlyName} autoComplete="cc-name" placeholder="Jane Dela Cruz" />
          <Field label="Card number" name="cardNumber" value={form.cardNumber} onChange={onChange} error={errors.cardNumber} transform={onCardNumber} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry" name="expiry" value={form.expiry} onChange={onChange} error={errors.expiry} transform={onExpiry} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" />
            <Field label="CVC" name="cvc" value={form.cvc} onChange={onChange} error={errors.cvc} transform={onCvc} inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          You will be redirected to {form.method === 'gcash' ? 'GCash' : 'PayPal'} to
          complete payment after creating your account.
        </div>
      )}

      <StepButtons
        onBack={onBack}
        backLabel="Back"
        onNext={onPay}
        nextLabel={loading ? 'Processing...' : 'Pay & create account'}
        loading={loading}
      />
    </div>
  );
}

function StepButtons({ onBack, backLabel, onNext, nextLabel, loading }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="flex-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {nextLabel}
      </button>
    </div>
  );
}
