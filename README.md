# renpy-translate-utils package

* Parse Ren'Py file with translation
* Edit translation
* Save to a new file

Only simple one line translation is supported at this moment.

## Usage
```javascript
const path = require('path');
const { parser, generator } = require('renpy-translate-utils');

(async () => {
  const file = path.join(__dirname, 'simple.rpy');
  const blocks = await parser.parseFile(file);

  console.log(blocks);
  /**
   * [
   * { 
   *   type: 'say',
   *   meta: { lang: 'english', id: 'start_360a07ac', source: { file: 'game/simple', line: '61' } },
   *   original: { who: undefined, what: 'Где я?' },
   *   translated: { who: undefined, what: 'Where am I?' }
   * }, { 
   *   type: 'say',
   *   meta: { lang: 'english', id: 'start_0a380365', source: { file: 'game/simple', line: '62' } },
   *   original: { who: 'lola', what: 'Привет. Как тебя зовут?' },
   *   translated: { who: 'lola', what: 'Hello. What is your name?' }
   * },
   *   ....
   * ]
  **/

  const newFile = generator.generateFile(blocks, { language: 'spanish' });

  console.log(newFile);
  /**
   * # game/simple.rpy:60
   * translate spanish start_360a07ac:
   * 
   *     # "Где я?"
   *     "Where am I?"
   * 
   * # game/simple.rpy:63
   * translate spanish start_0a380365:
   * 
   *     # lola "Привет. Как тебя зовут?"
   *     lola "Hello. What is your name?"
  **/
})()
```