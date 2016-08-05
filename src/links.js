import { queryToSearch } from './utils';

export const github = (uri) =>
  `https://github.com/${uri}`;

export const david = (uri, type, pathname) =>
  `https://david-dm.org/${uri}${queryToSearch({
    type,
    path: pathname,
  })}`;

export const travis = (uri) =>
  `https://travis-ci.org/${uri}`;

export const npm = (uri) =>
  `https://npmjs.org/packages/${uri}`;
