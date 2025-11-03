const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch repo root so linked packages rebuild
config.watchFolders = [workspaceRoot];

// Tell Metro where to resolve node modules (app AND root)
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];

// Keep it from walking up for configs (but it can still read root node_modules via the paths above)
config.resolver.disableHierarchicalLookup = true;

config.resolver.unstable_enableSymlinks = true;
config.transformer.unstable_allowRequireContext = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
