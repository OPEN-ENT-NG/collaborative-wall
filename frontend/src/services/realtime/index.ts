import { RealTimeProxyService } from "./RealTimeProxyService";
export { RealTimeProxyService };
export function useRealTimeService(resourceId: string, start: boolean) {
  return new RealTimeProxyService(resourceId, start);
}
