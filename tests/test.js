const path = require('path');

const { parser, generator } = require('../index');

(async () => {
  const file = path.join(__dirname, 'simple.rpy');
  const blocks = await parser.parseFile(file);

  console.log(blocks);

  const newFile = generator.generateFile(blocks, { language: 'spanish' });

  console.log(newFile);
})()