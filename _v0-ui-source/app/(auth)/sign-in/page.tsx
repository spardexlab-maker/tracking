'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Redirect to dashboard
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-sidebar-foreground">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sidebar-primary">
              <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">مسار</span>
              <p className="text-sm text-sidebar-foreground/60">نظام إدارة المشاريع</p>
            </div>
          </div>

          {/* Middle Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              نظام متكامل لإدارة
              <br />
              المشاريع والمهام
            </h1>
            <p className="text-lg text-sidebar-foreground/70 max-w-md">
              تتبع مشاريعك، نظم مهامك، وتعاون مع فريقك بكفاءة عالية من خلال منصة واحدة متكاملة.
            </p>
            
            {/* Features List */}
            <ul className="space-y-3 text-sidebar-foreground/70">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                إدارة المشاريع والمهام بسهولة
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                تتبع التقدم والإنجازات
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                تقارير وإحصائيات تفصيلية
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-sm text-sidebar-foreground/50">
            <p>شركة العزة للمقاولات العامة</p>
            <p className="mt-1">جميع الحقوق محفوظة {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">مسار</span>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">مرحباً بعودتك</h2>
            <p className="text-muted-foreground mt-2">
              سجل دخولك للوصول إلى حسابك
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-12"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  تذكرني
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            ليس لديك حساب؟{' '}
            <Link
              href="/contact"
              className="text-primary hover:text-primary/80 font-medium"
            >
              تواصل مع الدعم
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
