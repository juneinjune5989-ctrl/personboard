import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, Key } from 'lucide-react'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [method, setMethod] = useState<'password' | 'magic'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const signIn = useAuthStore((s) => s.signIn)
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword)
  const signUp = useAuthStore((s) => s.signUp)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    const result = mode === 'login'
      ? await signInWithPassword(email.trim(), password)
      : await signUp(email.trim(), password)
    setLoading(false)
    if (result.error) {
      // 翻译常见错误
      if (result.error.includes('Invalid login')) {
        setError('邮箱或密码错误')
      } else if (result.error.includes('already registered')) {
        setError('该邮箱已注册，请直接登录')
      } else if (result.error.includes('rate limit')) {
        setError('操作太频繁，请稍后再试')
      } else {
        setError(result.error)
      }
    }
  }

  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const result = await signIn(email.trim())
    setLoading(false)
    if (result.error) {
      if (result.error.includes('rate limit')) {
        setError('邮件发送太频繁，请稍后重试或使用密码登录')
      } else {
        setError(result.error)
      }
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl">
            🐙
          </div>
          <CardTitle className="text-xl">工作台</CardTitle>
          <CardDescription>手机电脑同步 · 待办 · 备忘 · 笔记</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-3">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                登录链接已发送到 <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                请查收邮件并点击链接完成登录
              </p>
              <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                换个邮箱
              </Button>
            </div>
          ) : (
            <>
              {/* 登录/注册 切换 */}
              <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
                <button
                  className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'login' ? 'bg-background shadow font-medium' : 'text-muted-foreground'
                  }`}
                  onClick={() => setMode('login')}
                >
                  登录
                </button>
                <button
                  className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'register' ? 'bg-background shadow font-medium' : 'text-muted-foreground'
                  }`}
                  onClick={() => setMode('register')}
                >
                  注册
                </button>
              </div>

              {/* 密码模式 */}
              {method === 'password' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <Input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Key className="h-4 w-4 mr-1" />
                    {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-xs text-center text-muted-foreground hover:underline"
                    onClick={() => setMethod('magic')}
                  >
                    或使用免密登录
                  </button>
                </form>
              ) : (
                /* 免密模式 */
                <form onSubmit={handleMagicSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Mail className="h-4 w-4 mr-1" />
                    {loading ? '发送中...' : '发送登录链接'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-xs text-center text-muted-foreground hover:underline"
                    onClick={() => setMethod('password')}
                  >
                    或使用密码登录
                  </button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
