const latestSemver = require('latest-semver');
const loadJsonFile = require('load-json-file');

const {
  getAppTemplateConfig,
  fetchLibraryVersions,
  getTemplatePath,
} = require('../utils');

module.exports = async function getConfiguration({
  options = {},
  answers = {},
} = {}) {
  const config = options.config
    ? await loadJsonFile(options.config) // From configuration file given as an argument
    : { ...options, ...answers }; // From the arguments and the prompt

  if (!config.template) {
    throw new Error('The template is required in the config.');
  }

  const templatePath = getTemplatePath(config.template);
  const templateConfig = getAppTemplateConfig(templatePath);
  let { libraryVersion } = config;

  if (templateConfig.libraryName && !libraryVersion) {
    libraryVersion = await fetchLibraryVersions(
      templateConfig.libraryName
    ).then(
      versions =>
        // Return the lastest available version when
        // the stable version is not available
        latestSemver(versions) || versions[0]
    );
  }

  return {
    ...config,
    libraryVersion,
    template: templatePath,
  };
};
