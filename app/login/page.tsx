'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { LoginForm } from '@/components/auth'
import { LoadingSpinner } from '@/components/ui'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl shadow-indigo-100/50 p-10 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-8 p-4 bg-white rounded-3xl shadow-xl shadow-indigo-100/20 border border-slate-50 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="/icons/omnigrow_clean.png"
                                alt="OmniGrow Logo"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent">
                            OmniGrow
                        </h1>
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] opacity-70">
                            Professional Grow Control
                        </p>
                    </div>

                    {/* Login Form */}
                    <LoginForm />

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                            © 2026 OmniGrow Systems Ltd.<br />
                            High Precision Agriculture
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
