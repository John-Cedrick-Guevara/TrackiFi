import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import OfflineIndicator from "@/components/OfflineIndicator";
import InstallBanner from "@/components/InstallBanner";

export const Route = createRootRoute({
  component: () => (
    <>
      <InstallBanner />
      <Outlet />
      <OfflineIndicator />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
});
