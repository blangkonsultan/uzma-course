import { cn } from "@/lib/utils";
import React, { type ComponentProps } from "react";

interface FormFieldBaseProps {
  id: string;
  name?: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export interface InputFieldProps
  extends FormFieldBaseProps,
    Omit<ComponentProps<"input">, "id" | "name"> {
  type?: "text" | "email" | "password" | "date" | "tel" | "number";
}

export function InputField({
  id,
  name,
  label,
  required,
  error,
  hint,
  type = "text",
  className,
  ...props
}: InputFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          "w-full px-3.5 py-2.5 sm:py-2 rounded-xl border bg-white text-slate-900 text-base sm:text-sm shadow-xs transition-colors",
          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 hover:border-slate-300"
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextareaFieldProps
  extends FormFieldBaseProps,
    Omit<ComponentProps<"textarea">, "id" | "name"> {}

export function TextareaField({
  id,
  name,
  label,
  required,
  error,
  hint,
  rows = 3,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={name ?? id}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          "w-full px-3.5 py-2.5 sm:py-2 rounded-xl border bg-white text-slate-900 text-base sm:text-sm shadow-xs transition-colors",
          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 hover:border-slate-300"
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends FormFieldBaseProps,
    Omit<ComponentProps<"select">, "id" | "name"> {
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  id,
  name,
  label,
  required,
  error,
  hint,
  options,
  placeholder = "Pilih salah satu...",
  className,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={name ?? id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          "w-full px-3.5 py-2.5 sm:py-2 rounded-xl border bg-white text-slate-900 text-base sm:text-sm shadow-xs transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 hover:border-slate-300"
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
}

export interface CheckboxGroupFieldProps {
  id: string;
  name: string;
  label: string;
  options: CheckboxGroupOption[];
  values?: string[];
  defaultValues?: string[];
  onChange?: (values: string[]) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export function CheckboxGroupField({
  id,
  name,
  label,
  options,
  values,
  defaultValues = [],
  onChange,
  required,
  error,
  hint,
  className,
}: CheckboxGroupFieldProps) {
  const isControlled = values !== undefined;
  const selectedValues = isControlled ? values : defaultValues;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <span className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </span>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const optId = `${id}-${opt.value}`;
          const isChecked = selectedValues.includes(opt.value);
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer bg-white",
                isChecked
                  ? "border-primary-400 bg-primary-50/20 ring-1 ring-primary-500/20"
                  : error
                  ? "border-rose-200 hover:border-rose-300"
                  : "border-slate-200 hover:border-primary-300 hover:bg-primary-50/10"
              )}
            >
              <input
                type="checkbox"
                id={optId}
                name={name}
                value={opt.value}
                checked={isControlled ? isChecked : undefined}
                defaultChecked={!isControlled ? isChecked : undefined}
                onChange={(e) => {
                  if (onChange) {
                    const next = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter((v) => v !== opt.value);
                    onChange(next);
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="text-sm">
                <span className="font-medium text-slate-800">{opt.label}</span>
                {opt.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export interface CheckboxFieldProps
  extends Omit<ComponentProps<"input">, "id" | "type"> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  className?: string;
}

export function CheckboxField({
  id,
  name,
  label,
  description,
  error,
  checked,
  defaultChecked,
  onChange,
  className,
  ...props
}: CheckboxFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        htmlFor={id}
        className="flex items-start gap-3 cursor-pointer select-none"
      >
        <input
          id={id}
          name={name ?? id}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-colors"
          {...props}
        />
        <div className="space-y-0.5">
          <span className="block text-sm font-medium text-slate-800">
            {label}
          </span>
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </label>
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}
