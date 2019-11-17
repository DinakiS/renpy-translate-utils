const groupBy = require('lodash.groupby');
const Mustache = require('mustache');

const templates = require('./templates');

const generateDefaults = {
  language: 'english',
  templates
};

module.exports = {
  /**
   * Generate Ren'Py translation file
   * 
   * @param {array} data Array of blocks from parser
   * @param {object} [options] Options
   * @param {string} [options.language] New language
   * @return {string}
   */
  generateFile (data, options = {}) {
    const realOptions = {
      ...generateDefaults,
      ...options
    };
    const { language } = realOptions;

    const grouppedData = groupBy(data, 'type');

    const renderData = {
      ...grouppedData,
      date: new Date(),
      language
    };

    const text = Mustache.render(realOptions.templates.main, renderData, realOptions.templates.partials);

    return text;
  }
}