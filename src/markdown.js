import _ from 'lodash';

import {
  david,

  npmDownloads,
  npmTotalDownloads,
  npmVersion,

  travis,
} from './badges';

import * as links from './links';

const renderMarkdownTableRow = (fields, rowRender) =>
  `|${_.map(fields, rowRender).join('|')}|`;

export const toMarkdownTable = (values, fields) => [
  '',
  renderMarkdownTableRow(fields, (label) => label),
  renderMarkdownTableRow(fields, () => '-------'),
].concat(
  _.map(
    values,
    (valueObject) =>
      renderMarkdownTableRow(fields, (label, field) => valueObject[field])
  )
).join('\n');

export const image = (title, url) =>
  `![${title}](${url})`;

export const link = (content, url) =>
  `[${content}](${url})`;


const davidBadgeLink = (uri, type, pathname) =>
  link(
    image(`${type || ''} dependencies}`,
      david(uri, type, pathname)),
    links.david(uri, type, pathname)
  );

export const packageRow = (packageInfo, githubFullName, pathname) => {
  const packageName = packageInfo.name;

  const deps = {
    dependencies: [
      packageInfo.dependencies && davidBadgeLink(githubFullName, null, pathname),
      packageInfo.devDependencies && davidBadgeLink(githubFullName, 'dev', pathname),
      packageInfo.optionalDependencies && davidBadgeLink(githubFullName, 'optional', pathname),
      packageInfo.peerDependencies && davidBadgeLink(githubFullName, 'peer', pathname),
    ].join(' '),
  };

  if (packageInfo.private) {
    return deps;
  }

  return {
    name: `\`${packageName}\``,
    version: image('npm version', npmVersion(packageName)),
    downloads: [
      image('npm downloads', npmDownloads(packageName)),
      image('npm total downloads', npmTotalDownloads(packageName)),
    ].join(' '),
    ...deps,
  };
};

export const repoSection = (result, nodeProject) => {
  const githubFullName = `${nodeProject.user}/${nodeProject.repo}`;

  const repoInfo = {
    repoName: link(nodeProject.repo, links.github(githubFullName)),
    buildStatus: link(image('Build Status', travis(githubFullName)), links.travis(githubFullName)),
    lastUpdated: nodeProject.pushedAt,
    ...packageRow(nodeProject.package, githubFullName),
  };


  if (!_.isEmpty(nodeProject.packages)) {
    const packageList = _.map(
      nodeProject.packages,
      (packageInfo, name) => packageRow(packageInfo, githubFullName, `packages/${name}`)
    );

    return result
      .concat(repoInfo)
      .concat(packageList);
  }

  return result
    .concat(repoInfo);
};

export const renderRepoTable = (nodeProjects) => {
  const result = _.reduce(nodeProjects, repoSection, []);

  return toMarkdownTable(result, {
    repoName: 'Repo Name',
    buildStatus: 'Build Status',
    lastUpdated: 'Last Updated',
    name: 'Package Name',
    version: 'Version',
    downloads: 'Downloads',
    dependencies: 'Deps',
  });
};
