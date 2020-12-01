export interface GenericObject {
  [key: string]: any;
}

export interface NPSConfiguration {
  scripts?: GenericObject;
  options?: {
    silent?: boolean;
    logLevel?: 'error' | 'warn' | 'info';
  };
}

export interface NPSConfigurationFactoryOptions {
  npsUtils: any;
}

export type NPSConfigurationFactory = (opts: NPSConfigurationFactoryOptions) => NPSConfiguration;
