import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, HeadContent, Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppProvider } from "@/lib/app-context";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "House of Valerion — Enterprise HR" },
      { name: "description", content: "The private HR portal of House of Valerion — a luxury enterprise platform for people, performance, and culture." },
      { property: "og:title", content: "House of Valerion — Enterprise HR" },
      { property: "og:description", content: "The private HR portal of House of Valerion — a luxury enterprise platform for people, performance, and culture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "House of Valerion — Enterprise HR" },
      { name: "twitter:description", content: "The private HR portal of House of Valerion — a luxury enterprise platform for people, performance, and culture." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/57cf26bb-fdce-488c-a8f4-436953087137/id-preview-e58ea30a--2bb58528-70bf-4cf9-8673-546127dda201.lovable.app-1783525336291.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/57cf26bb-fdce-488c-a8f4-436953087137/id-preview-e58ea30a--2bb58528-70bf-4cf9-8673-546127dda201.lovable.app-1783525336291.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
        <Toaster position="top-right" />
      </AppProvider>
    </QueryClientProvider>
  );
}
