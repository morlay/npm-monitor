import { queryToSearch } from './utils';

const badge = (service) =>
  (uri, query) =>
    `https://img.shields.io/${service}/${uri}.svg${queryToSearch(query)}`;

export const travis = badge('travis');

export const npmVersion = badge('npm/v');
export const npmDownloads = badge('npm/dm');
export const npmTotalDownloads = badge('npm/dt');

export const deps = badge('david');
export const devDeps = badge('david/dev');
export const optionalDeps = badge('david/optional');
export const peerDeps = badge('david/peer');

export const david = (uri, type, pathname) =>
  `https://david-dm.org/${uri}/${type ? `${type}-` : ''}status.svg${queryToSearch({
    path: pathname,
  })}`;
