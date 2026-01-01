//TODO: change and use
export interface Environment {
  name: string;
  internalApiBase: string;
  companySignalrHub: string;
  baseUrl: string;
  cmsApiBaseUrl: string;
  paymentProviderId: string;
  creditProviderId: string;
  productId: string;
  analytics?: {
    url: string;
    siteId: string;
  };
  sentry?: {
    dns: string;
    tracesSampleRate: number;
    tracePropagationTargets: Array<string | RegExp>;
  };
  logToConsole: boolean;
  externalUrl: {
    Documentation: string;
    Support: string;
  };
  cloudflareTurnstile: {
    siteKey: string;
    theme: 'light' | 'dark' | 'auto';
  };
  version: string;
}
