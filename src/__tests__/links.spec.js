import { expect } from '@morlay/tests';

import {
  github,
  david,
} from '../links';

describe(__filename, () => {
  context('github', () => {
    it('should get github link', () => {
      expect(github('morlay/npm-monitor'))
        .to.equal('https://github.com/morlay/npm-monitor');
    });
  });

  context('david', () => {
    it('should get david-dm link', () => {
      expect(david('morlay/npm-monitor'))
        .to.equal('https://david-dm.org/morlay/npm-monitor');

      expect(david('morlay/npm-monitor', undefined, 'packages/src'))
        .to.equal('https://david-dm.org/morlay/npm-monitor?path=packages%2Fsrc');

      expect(david('morlay/npm-monitor', 'dev'))
        .to.equal('https://david-dm.org/morlay/npm-monitor?type=dev');
    });
  });
});
