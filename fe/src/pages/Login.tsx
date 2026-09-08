import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user) {
    const from = (location.state as { from?: Location })?.from
    return <Navigate to={from?.pathname ?? '/'} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      const from = (location.state as { from?: Location })?.from
      navigate(from?.pathname ?? '/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        setError('E-mail ou senha inválidos.')
      } else {
        setError('Não foi possível entrar agora. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-container-low px-md">
      <div className="w-full max-w-[24rem]">
        <div className="flex flex-col items-center gap-sm mb-lg">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
            <img
              alt="Logo da FB Plus Size"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAfrwACrQUcnDa1gSH2S-KHAoRLuoT_93qG6gRyF3d60WsWOUKrZPsBD0AY0LaeaihCxayeI9LXO0wX8rcOwZSRlk8wl2vrr6FPsXSRhcEg20IDZvv5cHQLVSSRTaKkQlTj96FukdLMZm5SPV9_BP6JB0OYx6qAG2slETW54Pe2-H6DuxfWghE08zVmP2SZX9NlqohkdGZaSZj3tN56fkAPIi8y2TXWMcdKyei5Gkyqp9vegwgoZ8"
            />
          </div>
          <div className="text-center">
            <h1 className="text-headline-lg font-headline-lg font-bold text-primary">FB Plus Size</h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl border border-outline-variant shadow-lg p-lg flex flex-col gap-md"
        >
          <div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface">Entrar</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-xs">
              Acesse com o e-mail e a senha cadastrados para você.
            </p>
          </div>

          <div>
            <label htmlFor="login-email" className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
              E-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
              Senha
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-9 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-xs bg-error-container/10 border border-error/40 rounded-lg px-sm py-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-label-md font-label-md text-error">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full h-touch-target rounded-lg bg-primary-container text-white font-label-lg text-label-lg font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">login</span>
            )}
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
