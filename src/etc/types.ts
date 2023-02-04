import type { Package } from 'normalize-package-data';


export interface PackageInfoResult {
  /**
   * Root directory of the host package.
   */
  rootDir: string;

  /**
   * Parsed package.json of the host package.
   */
  packageJson: Package | undefined;

  /**
   * Parsed tsconfig.json of the host package.
   */
  tsConfig: any;

  /**
   * Path to the host package's tsconfig.json.
   */
  tsConfigPath: string | undefined;

  /**
   * Inferred source directory of the host package.
   */
  srcDir: string | undefined;

  /**
   * Inferred output directory of the host package.
   */
  outDir: string | undefined;

  /**
   * Whether the host package has "type": "module" set in their package.json.
   */
  isEsModule: boolean;
}
