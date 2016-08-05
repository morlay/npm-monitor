import { expect } from '@morlay/tests';

import {
  toMarkdownTable,
} from '../markdown';

describe(__filename, () => {
  context('toMarkdownTable', () => {
    it('should get github link', () => {
      const values = [{
        id: '1',
        key: '2',
      }, {
        id: '2',
        key: '2',
      }];

      expect(toMarkdownTable(values, {
        id: 'ID',
        key: 'KEY',
      })).to.eql([
        '',
        '|ID|KEY|',
        '|-------|-------|',
        '|1|2|',
        '|2|2|',
      ].join('\n'));
    });
  });
});
