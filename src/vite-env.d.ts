/// <reference types="vite/client" />

interface Window {
  Cashfree?: (config: { mode: 'production' | 'sandbox' }) => {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget?: '_self' | '_blank' | '_modal';
    }) => Promise<any>;
  };
}
