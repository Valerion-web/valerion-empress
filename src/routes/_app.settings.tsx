import { createFileRoute } from "@tanstack/react-router";
import { Shield, Bell, Mail, Palette, Globe, Users, Key, Building } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

const sections = [
  { icon: Shield, title: "Security & 2FA", desc: "Enforce multi-factor authentication, session policies" },
  { icon: Users, title: "Roles & permissions", desc: "Define role matrix and granular access" },
  { icon: Key, title: "SSO & SAML", desc: "Okta, Azure AD, Google Workspace" },
  { icon: Bell, title: "Notifications", desc: "System, email, SMS and push preferences" },
  { icon: Mail, title: "Email templates", desc: "Offer, welcome, reminders, anniversaries" },
  { icon: Palette, title: "Brand", desc: "Logo, palette, typography, favicon" },
  { icon: Globe, title: "Locales & regions", desc: "Languages, currencies, tax rules" },
  { icon: Building, title: "Legal entities", desc: "Companies, tax IDs, cost centres" },
];

function Settings() {
  const { theme, toggleTheme } = useApp();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="System settings"
        subtitle="The controls that keep the Valerion HR platform private, secure and on-brand."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Appearance" />
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-[11px] text-muted-foreground">Currently: {theme}</div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <div className="text-sm font-medium">Reduced motion</div>
                <div className="text-[11px] text-muted-foreground">Softens animations</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <div className="text-sm font-medium">Compact density</div>
                <div className="text-[11px] text-muted-foreground">Fit more on screen</div>
              </div>
              <Switch />
            </div>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Security" />
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <div className="text-sm font-medium">2FA enforcement</div>
                <div className="text-[11px] text-muted-foreground">All users required</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <div className="text-sm font-medium">Single Sign-On</div>
                <div className="text-[11px] text-muted-foreground">Okta · SAML 2.0</div>
              </div>
              <Chip tone="success">Active</Chip>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <div className="text-sm font-medium">Session timeout</div>
                <div className="text-[11px] text-muted-foreground">30 minutes idle</div>
              </div>
              <Chip>30m</Chip>
            </div>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Notifications" />
          <div className="space-y-3">
            {[
              { l: "Email digests", d: "Daily 08:00" },
              { l: "SMS · critical only", d: "System alerts" },
              { l: "Push notifications", d: "Mobile app" },
              { l: "In-app alerts", d: "Real-time" },
            ].map((n) => (
              <div key={n.l} className="flex items-center justify-between p-3 rounded-xl border">
                <div>
                  <div className="text-sm font-medium">{n.l}</div>
                  <div className="text-[11px] text-muted-foreground">{n.d}</div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Platform configuration" description="Deeper controls — restricted to Super Admin" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {sections.map((s) => (
            <div key={s.title} className="p-4 rounded-2xl border card-lift">
              <div className="size-10 rounded-xl gradient-gold grid place-items-center text-gold-foreground"><s.icon className="size-5" /></div>
              <div className="mt-3 font-semibold text-sm">{s.title}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.desc}</div>
              <button className="mt-3 text-xs text-gold font-medium hover:underline">Configure →</button>
            </div>
          ))}
        </div>
      </LuxeCard>
    </div>
  );
}
