import { useEffect, useMemo, useState } from "react";
import type { ZodTypeAny } from "zod";

type Errors = Record<string, string>;

export function useZodLiveForm<T extends Record<string, any>>(
  schema: ZodTypeAny,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Errors>({});

  const validate = useMemo(
    () => (next?: T) => {
      const target = next ?? data;
      const result = schema.safeParse(target);
      if (!result.success) {
        const fieldErrors: Errors = {};
        result.error.errors.forEach((err) => {
          const key = String((err.path && err.path.join(".")) || "general");
          fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);
        return { ok: false, errors: fieldErrors };
      }
      setErrors({});
      return { ok: true, value: result.data };
    },
    [schema, data]
  );

  useEffect(() => {
    validate();
  }, [data, validate]);

  const setField = (field: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const getError = (field: string) => errors[field];

  const ariaProps = (field: string, helpId?: string) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": helpId,
  });

  const reset = (next?: T) => {
    setData(next ?? initialData);
    setErrors({});
  };

  return {
    data,
    setData,
    errors,
    setField,
    getError,
    ariaProps,
    validate,
    reset,
  };
}
