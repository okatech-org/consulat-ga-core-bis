import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/superadmin/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("superadmin.settings.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("superadmin.settings.description")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t("superadmin.settings.tabs.general")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("superadmin.settings.tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="security">{t("superadmin.settings.tabs.security")}</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("superadmin.settings.general.title")}</CardTitle>
              <CardDescription>
                {t("superadmin.settings.general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="Consulat.ga" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" defaultValue="admin@consulat.ga" />
              </div>
              <Button>{t("superadmin.common.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("superadmin.settings.notifications.title")}</CardTitle>
              <CardDescription>
                {t("superadmin.settings.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("superadmin.common.comingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t("superadmin.settings.security.title")}</CardTitle>
              <CardDescription>
                {t("superadmin.settings.security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("superadmin.common.comingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
