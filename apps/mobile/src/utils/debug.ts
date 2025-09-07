const isDev = __DEV__;

export const debug = {
  app: (message: string, ...args: any[]) => isDev && console.log('🔧 [APP]', message, ...args),
  scanner: (message: string, ...args: any[]) => isDev && console.log('📱 [SCAN]', message, ...args),
  flight: (message: string, ...args: any[]) => isDev && console.log('✈️ [FLIGHT]', message, ...args),
  db: (message: string, ...args: any[]) => isDev && console.log('💾 [DB]', message, ...args),
  error: (message: string, error?: any) => console.error('❌ [ERROR]', message, error),
  warn: (message: string, ...args: any[]) => console.warn('⚠️ [WARN]', message, ...args),
  
  // Production-safe performance logging
  perf: (label: string, fn: () => any) => {
    if (!isDev) return fn();
    const start = Date.now();
    const result = fn();
    console.log(`⏱️ [PERF] ${label}: ${Date.now() - start}ms`);
    return result;
  }
}; 