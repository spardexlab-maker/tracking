'use client'

import { useState } from 'react'
import {
  Building2,
  User,
  Users,
  Mail,
  Shield,
  Bell,
  Palette,
  Save,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Sample data
const workspaceMembers = [
  { id: 1, name: 'مدير التجربة', email: 'admin@example.com', role: 'مدير', status: 'active' },
  { id: 2, name: 'أحمد محمد', email: 'ahmed@example.com', role: 'عضو', status: 'active' },
  { id: 3, name: 'سارة علي', email: 'sara@example.com', role: 'عضو', status: 'active' },
  { id: 4, name: 'محمد كريم', email: 'mohammed@example.com', role: 'عضو', status: 'pending' },
]

const settingsSections = [
  { id: 'workspace', label: 'إعدادات مساحة العمل', icon: Building2 },
  { id: 'profile', label: 'الملف الشخصي', icon: User },
  { id: 'members', label: 'الأعضاء', icon: Users },
  { id: 'invitations', label: 'الدعوات', icon: Mail },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('workspace')
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const copyInviteLink = () => {
    navigator.clipboard.writeText('https://masar.app/invite/abc123')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">إدارة إعدادات مساحة العمل والحساب</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64 shrink-0">
          <nav className="bg-card rounded-xl border border-border p-2 shadow-sm">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-right',
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <section.icon className="w-5 h-5 shrink-0" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {/* Workspace Settings */}
          {activeSection === 'workspace' && (
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  إعدادات مساحة العمل
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  تعديل معلومات مساحة العمل الأساسية
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">اسم مساحة العمل</Label>
                    <Input
                      id="workspace-name"
                      defaultValue="شركة العزة للمقاولات العامة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-slug">الرابط المختصر</Label>
                    <Input id="workspace-slug" defaultValue="al-izza-company" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-description">الوصف</Label>
                  <Textarea
                    id="workspace-description"
                    rows={3}
                    placeholder="وصف مختصر عن مساحة العمل"
                    defaultValue="شركة متخصصة في المقاولات العامة والإنشاءات"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  الملف الشخصي
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  تعديل معلومات حسابك الشخصي
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    م
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      تغيير الصورة
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG أو GIF. الحد الأقصى 2MB.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">الاسم الكامل</Label>
                    <Input id="profile-name" defaultValue="مدير التجربة" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">البريد الإلكتروني</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      defaultValue="admin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">رقم الهاتف</Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      placeholder="+964 XXX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-department">القسم</Label>
                    <Input id="profile-department" defaultValue="المكتب الفني" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Members */}
          {activeSection === 'members' && (
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    أعضاء مساحة العمل
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    إدارة أعضاء الفريق وصلاحياتهم
                  </p>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      دعوة عضو
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>دعوة عضو جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">البريد الإلكتروني</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="example@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">الصلاحية</Label>
                        <Select defaultValue="member">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="member">عضو</SelectItem>
                            <SelectItem value="viewer">مشاهد</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          أو شارك رابط الدعوة
                        </p>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value="https://masar.app/invite/abc123"
                            className="bg-muted"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyInviteLink}
                          >
                            {copied ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button onClick={() => setIsInviteDialogOpen(false)}>
                        إرسال الدعوة
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-border">
                {workspaceMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        variant={member.status === 'active' ? 'success' : 'warning'}
                      >
                        {member.status === 'active' ? 'نشط' : 'في انتظار القبول'}
                      </StatusBadge>
                      <Select defaultValue={member.role === 'مدير' ? 'admin' : 'member'}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="member">عضو</SelectItem>
                          <SelectItem value="viewer">مشاهد</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitations */}
          {activeSection === 'invitations' && (
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  دعوة مستخدم مباشر
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  إنشاء حساب جديد مباشرة بدون إرسال دعوة
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-name">الاسم الكامل</Label>
                    <Input id="new-user-name" placeholder="أدخل الاسم" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">البريد الإلكتروني</Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-password">كلمة المرور</Label>
                    <Input
                      id="new-user-password"
                      type="password"
                      placeholder="كلمة المرور المؤقتة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-role">الصلاحية</Label>
                    <Select defaultValue="member">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="member">عضو</SelectItem>
                        <SelectItem value="viewer">مشاهد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    إنشاء المستخدم
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  إعدادات الإشعارات
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  تخصيص الإشعارات التي تريد استلامها
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'task-assigned', label: 'عند إسناد مهمة لي', defaultChecked: true },
                    { id: 'task-completed', label: 'عند اكتمال مهمة', defaultChecked: true },
                    { id: 'comment-added', label: 'عند إضافة تعليق', defaultChecked: true },
                    { id: 'project-update', label: 'تحديثات المشاريع', defaultChecked: false },
                    { id: 'weekly-summary', label: 'الملخص الأسبوعي', defaultChecked: true },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2"
                    >
                      <Label htmlFor={item.id} className="cursor-pointer">
                        {item.label}
                      </Label>
                      <Switch id={item.id} defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
