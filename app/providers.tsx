"use client";

// import { PermissionProvider } from "@/providers/PermissionProvider";
import { SWRConfig } from "swr";

//@ts-expect-error im lazy lol
const onErrorRetryHandler = (error, key, config, revalidate, { retryCount }) => {
  // Never retry on 404.
  if (error.status === 404) return

  // Only retry up to 10 times.
  if (retryCount >= 10) return

  // Retry after 5 seconds.
  setTimeout(() => revalidate({ retryCount }), 5000)
}

const configs = {
  //revalidateOnFocus: false,
  dedupingInterval: 500,
  refreshInterval: 0,
  onErrorRetry: onErrorRetryHandler
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <SWRConfig value={configs}>
        {/* <PermissionProvider>{children}</PermissionProvider> */}
        {children}
      </SWRConfig>
  );
}
