// ----- NPS Configuration Spec ------------------------------------------------

export type TerseNpsScriptDefinition = string;

export type VerboseNpsScriptDefinition = {
  description?: string;
  script: string;
} & NpsScriptsDefinition;

export type VerboseNpsScriptDefinitionWithDefault = {
  default: {
    description?: string;
    script: string;
  };
} & NpsScriptsDefinition;

export interface NpsScriptsDefinition {
  [key: string]: VerboseNpsScriptDefinition | VerboseNpsScriptDefinitionWithDefault | string; // | TerseNpsScriptDefinition;
}

export interface NPSConfiguration {
  scripts?: NpsScriptsDefinition;
  options?: {
    silent?: boolean;
    logLevel?: 'error' | 'warn' | 'info';
  };
}


// ----- Custom NPS Configurator Types -----------------------------------------

/**
 * Object passed to NPS configuration functions.
 */
export interface NPSConfigurationFactoryOptions {
  npsUtils: {
    /**
     * Generates a command that uses concurrently to run scripts concurrently.
     * Adds a few flags to make it behave as you probably want (like
     * --kill-others-on-fail). In addition, it adds color and labels where the
     * color can be specified or is defaulted and the label is based on the key
     * for the script.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-concurrent
     */
    concurrent: (scripts: { [key: string]: any }) => void;

    /**
     * Accepts any number of scripts, filters out any falsy ones and joins them
     * with ' && '.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-series
     */
    series: (scripts: Array<string>) => void;

    /**
     * Gets a script that uses the rimraf binary. rimraf is a dependency of
     * nps-utils, so you don't need to install it yourself.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-rimraf
     */
    rimraf: (args: string) => string;

    /**
     * Takes two scripts and returns the first if the current environment is
     * Windows, and the second if the current environment is not Windows.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-ifWindows
     */
    ifWindows: (script: string, altScript: string) => string;

    /**
     * Takes two scripts and returns the first if the current environment is not
     * Windows, and the second if the current environment is Windows.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-ifNotWindows
     */
    ifNotWindows: (script: string, altScript: string) => string;

    /**
     * Gets a script that uses the cpy-cli binary. cpy-cli is a dependency of
     * nps-utils, so you don't need to install it yourself.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-copy
     */
    copy: (args: string) => string;

    /**
     * Gets a script that uses the mkdirp binary. mkdirp is a dependency of
     * nps-utils, so you don't need to install it yourself.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-mkdirp
     */
    mkdirp: (args: string) => string;

    /**
     * Gets a script that uses the opn-cli binary. opn-cli is a dependency of
     * nps-utils, so you don't need to install it yourself.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-open
     */
    open: (args: string) => string;

    /**
     * Gets a script that uses the cross-env binary. cross-env is a dependency
     * of nps-utils, so you don't need to install it yourself.
     *
     * See: https://doc.esdoc.org/github.com/kentcdodds/nps-utils/function/index.html#static-function-crossEnv
     */
    crossEnv: (args: string) => string;
  };

  /**
   * Boolean that will be `true` if the current environment is a Continuous
   * Integration server, or `false` otherwise.
   *
   * See: https://github.com/watson/is-ci
   */
  IS_CI: boolean;
}

/**
 * Signature of functions passed to the NPS configurator.
 */
export type NPSConfigurationFactory = (opts: NPSConfigurationFactoryOptions) => NPSConfiguration;


// ----- Miscellaneous ---------------------------------------------------------

/**
 * Parsed value of the "npm_config_argv" environment variable present when a
 * process is run as part of an NPM lifecycle.
 */
export interface NpmConfigArgv {
  original: Array<string>;
  cooked: Array<string>;
  remain: Array<string>;
}


/**
 * Data exchanged between parent process and the script that issues warnings
 * when an NPS script is skipped using skipIfCiNpmLifecycle.
 */
export interface SkipWarningPayload {
  npmCommand: string;
  npmScriptName: string;
  npmScriptValue: string;
  rootNpsScriptName: string;
  localNpsScriptName: string;
}
