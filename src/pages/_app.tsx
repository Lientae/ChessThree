import React from 'react';
import type { AppProps } from 'next/app';


// Wrapper principal de l'application
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <Component {...pageProps} />
    </React.StrictMode>
  );
}
