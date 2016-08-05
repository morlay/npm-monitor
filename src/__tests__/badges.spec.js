import { expect } from '@morlay/tests';

import {
  travis,

  npmVersion,
  npmDownloads,
  npmTotalDownloads,

  deps,
  devDeps,
  optionalDeps,
  peerDeps,
} from '../badges';

describe(__filename, () => {
  context('travis', () => {
    it('should get badge image uri', () => {
      expect(travis('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/travis/morlay/npm-monitor.svg');
    });
  });

  context('npm', () => {
    it('should get badge image uri', () => {
      expect(npmVersion('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/npm/v/morlay/npm-monitor.svg');

      expect(npmDownloads('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/npm/dm/morlay/npm-monitor.svg');

      expect(npmTotalDownloads('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/npm/dt/morlay/npm-monitor.svg');
    });
  });

  context('deps', () => {
    it('should get badge image uri', () => {
      expect(deps('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/david/morlay/npm-monitor.svg');

      expect(deps('morlay/npm-monitor', { path: 'packages/npm-monitor' }))
        .to.equal('https://img.shields.io/david/morlay/npm-monitor.svg?path=packages%2Fnpm-monitor');

      expect(devDeps('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/david/dev/morlay/npm-monitor.svg');

      expect(optionalDeps('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/david/optional/morlay/npm-monitor.svg');

      expect(peerDeps('morlay/npm-monitor'))
        .to.equal('https://img.shields.io/david/peer/morlay/npm-monitor.svg');
    });
  });
});
