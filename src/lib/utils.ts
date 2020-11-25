import { WebpackConfiguration } from 'etc/types';


/**
 * Utility that generates a base Webpack configuration scaffold with certain
 * common keys/paths pre-defined (and typed as such), reducing the amount of
 * boilerplate the user has to write.
 *
 * For example, when adding a loader, the user need not initialize 'module' and
 * 'rules', they can simply write config.module.rules.push(<loader config>).
 */
export function generateWebpackConfigurationScaffold() {
  const config: any = {};
  config.module = {rules: []};
  config.plugins = [];
  return config as WebpackConfiguration;
}
