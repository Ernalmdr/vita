'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from '@/app/actions/auth'
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// Wrap submit button to use pending state 
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-congress-red hover:bg-congress-dark text-white font-semibold py-3 flex items-center justify-center px-4 rounded-lg transition-colors shadow-md hover:shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2" size={18} />
          <span>Signing In...</span>
        </>
      ) : (
        <>
          <span>Sign In</span>
          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  )
}

const initialState: { error: string | null } = {
  error: null,
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-congress-cream flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Optional decorative background elements linking back to the brand */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-congress-gold/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-congress-red/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative z-10">
        
        {/* Header section with brand colors and logo */}
        <div className="bg-congress-cream p-6 text-center border-b border-gray-100 flex flex-col items-center justify-center relative">
          <div className="relative w-32 h-32 mb-4">
            <Image 
              src="/logo.jpg" 
              alt="Vita Cordis Logo" 
              fill
              className="object-contain drop-shadow-sm rounded-full"
              priority
            />
          </div>
          <p className="text-sm text-congress-cream/80 uppercase tracking-widest mt-2 relative z-10">
            Secure Admin Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-congress-dark">Welcome Back</h2>
            <p className="text-gray-500 mt-1 text-sm">Please sign in to access incoming registrations.</p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@vitacordis.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-congress-gold focus:border-congress-gold transition-colors text-gray-900 bg-gray-50 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-congress-gold focus:border-congress-gold transition-colors text-gray-900 bg-gray-50 focus:bg-white outline-none"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
