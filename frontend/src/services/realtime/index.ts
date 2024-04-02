import { RealTimeProxyService } from "./RealTimeProxyService";

export function useRealTimeService(resourceId: string, start: boolean) {
  console.log({ resourceId, start });
  return new RealTimeProxyService(resourceId, start);
}
