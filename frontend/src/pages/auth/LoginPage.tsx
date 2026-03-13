import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../api/auth.api';
import { loginSchema } from '../../features/auth/login.schema';
import type { LoginFormValues } from '../../features/auth/login.schema';
import { ApiClientError } from '../../lib/errors';
import { decodeJwtPayload } from '../../lib/auth';
import { setAuth } from '../../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const result = await loginRequest(values);
      const payload = decodeJwtPayload(result.accessToken);

      if (!payload.sub || !payload.email || !payload.role) {
        throw new Error('Missing required token claims');
      }

      setAuth({
        accessToken: result.accessToken,
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      });

      navigate('/admin', { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError('Неуспешно влизане. Опитай отново.');
    }
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Вход</h1>
        <p className="mt-2 text-slate-600">Влез с администраторските си данни.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Имейл
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...register('email')}
            />
            {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Парола
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Влизане...' : 'Влез'}
          </button>
        </form>
      </div>
    </main>
  );
}
