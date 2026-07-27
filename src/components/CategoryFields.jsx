import { fieldOptions, visibleFields } from '../lib/bookingFields';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20';

// Renders a category's booking questions from its field spec, so each category
// asks only what it needs without a bespoke form per category.
export default function CategoryFields({ spec, values, onChange }) {
  const fields = visibleFields(spec, values);
  if (fields.length === 0) return null;

  const set = (name, value) => onChange({ ...values, [name]: value });

  return (
    <div className="border-t border-slate-100 pt-3">
      <p className="mb-2 text-sm font-semibold text-slate-900">{spec.title}</p>
      <div className="space-y-3">
        {fields.map((f) => {
          if (f.type === 'toggle') {
            return (
              <label key={f.name} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!values[f.name]}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#56aea1]"
                />
                <span>
                  {f.label}
                  {f.hint && <span className="block text-xs text-slate-400">{f.hint}</span>}
                </span>
              </label>
            );
          }

          return (
            <label key={f.name} className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                {f.label}
                {!f.required && <span className="text-slate-400"> (optional)</span>}
              </span>

              {f.type === 'select' ? (
                <select
                  value={values[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                  className={inputCls}
                >
                  <option value="">Choose…</option>
                  {fieldOptions(f).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  rows={2}
                  value={values[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className={inputCls}
                />
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : f.type === 'time' ? 'time' : 'text'}
                  value={values[f.name] ?? ''}
                  min={f.min}
                  max={f.max}
                  onChange={(e) =>
                    set(
                      f.name,
                      // Numbers go to the API as numbers, not strings.
                      f.type === 'number'
                        ? e.target.value === '' ? '' : Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  placeholder={f.placeholder}
                  className={inputCls}
                />
              )}
              {f.hint && <span className="mt-0.5 block text-xs text-slate-400">{f.hint}</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
