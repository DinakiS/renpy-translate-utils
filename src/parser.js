const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const REGEX_SOURCE = /^# ((?:\w+[\/|\\])+\w+\.\w+):+(\d+)/;
const REGEX_META = /^translate (\w+) (.+):/;
const REGEX_SAY = /^(?:#\s)?(\w+)?\s?"(.*)"$/;

const parseSayLine = (line) => {
  const reg = line.match(REGEX_SAY);
  let who = null;
  let what = '';

  if (!reg) return null;

  if (reg.length === 2) {
    what = reg[1];
  } else if (reg.length === 3) {
    who = reg[1]
    what = reg[2];
  }

  return {
    who,
    what
  };
};

const parseSource = (line) => {
  const reg = line.match(REGEX_SOURCE);

  if (!reg) return null;

  const [, file, lineNum] = reg;

  return {
    file,
    line: lineNum
  }
}

module.exports = {
  async parseFile (filePath) {
    if (!filePath) throw new Error('File path is missing.');

    const fileContent = await readFile(filePath, 'utf8');

    return this.parseFileContent(fileContent);
  },
  
  parseFileContent (file) {
    const lines = file.split('\r\n');
    const blocks = [];

    let currentLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line.startsWith('translate ')) {
        if (line.match(/strings:/)) {
          // This catch language for strings
          const [, lang] = line.match(REGEX_META);

          currentLanguage = lang;
          continue;
        }

        const [, lang, id] = line.match(REGEX_META);
        let source = null;
        let original = null;
        let translated = null;

        if (i > 0) {
          const prevLine = lines[i - 1].trim();

          if (prevLine.startsWith('# ')) {
            source = parseSource(prevLine);
          }
        }

        line = lines[++i].trim();
        if (line === '') line = lines[++i].trim();

        if (line.startsWith('# ')) {
          original = parseSayLine(line);
        }

        line = lines[++i].trim();
        if (line !== 'pass' && line.match(REGEX_SAY)) {
          translated = parseSayLine(line);
        }

        blocks.push({
          type: 'say',
          meta: {
            lang,
            id,
            source
          },
          original,
          translated
        });
      } else if (line.startsWith('old')) {
        let source = null;

        if (i > 0) {
          const prevLine = lines[i - 1].trim();

          if (prevLine.startsWith('# ')) {
            source = parseSource(prevLine);
          }
        }

        const original = parseSayLine(line);
        delete original.who;

        line = lines[++i].trim();

        const translated = parseSayLine(line);
        delete translated.who;

        blocks.push({
          type: 'string',
          meta: {
            source,
            lang: currentLanguage
          },
          original,
          translated
        })
      }
    }

    return blocks;
  },

  async parseLanguageFolder(folderPath) {
    const data = {
      path: folderPath,
      type: 'folder'
    }

    const children = await readDir(folderPath);
    data.children = children;

    data.files = [];

    await Promise.all(children.map(async file => {
      let fileObj = {
        path: path.join(folderPath, file)
      };

      const stats = await stat(fileObj.path);

      if (stats.isDirectory()) {
        fileObj = await this.parseLanguageFolder(fileObj.path);
      } else if (fileObj.path.endsWith('.rpy')) {
        fileObj.type = 'file';

        fileObj.data = await this.parseFile(fileObj.path);
      }

      data.files.push(fileObj);
    }));

    return data;
  }
}