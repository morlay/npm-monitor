import _ from 'lodash';
import atob from 'atob';
import githubApis from './githubApis';

const { gitdata, repos } = githubApis;

export class GitBlob {
  constructor(blob, context) {
    this.type = 'blob';
    this.path = blob.path;
    this.mode = blob.mode;
    this.sha = blob.sha;
    this.content = blob.content;
    this.context = context;
  }

  getContent() {
    return this.content;
  }

  fetchContent = () => gitdata.getBlob({
    ...this.context,
    sha: this.sha,
  }).then((result) => {
    this.content = atob(result.content);
    return this;
  });
}

export class GitTree {
  constructor(tree, context) {
    this.type = 'tree';
    this.path = tree.path;
    this.mode = tree.mode;
    this.sha = tree.sha;
    this.context = context;
    this.tree = this.mergeTree(this.tree, tree.tree);
  }

  getBlob = (pathname) => {
    const item = this.tree[pathname];
    if (item && item.type === 'blob') {
      return this.tree[pathname];
    }
    return null;
  };

  getSubTree = (pathname) => {
    const item = this.tree[pathname];
    if (item && item.type === 'tree') {
      return item;
    }
    return null;
  };

  blobExist = (pathname) => !!this.getBlob(pathname);

  treeExist = (pathname) => !!this.getSubTree(pathname);

  mergeTree = (trees, treeListOrMap) => _.reduce(treeListOrMap, (result, item) => {
    const structuredItem = new (({
      tree: GitTree,
      blob: GitBlob,
    })[item.type] || Object)(item, this.context);

    return {
      ...result,
      [item.path]: structuredItem,
    };
  }, trees || {});

  listSubTree = () => _.pickBy(this.tree, (item) => item.type === 'tree');

  fetchSubTree = (deepFetch) => gitdata.getTree({
    ...this.context,
    sha: this.sha,
  }).then((result) => {
    this.tree = this.mergeTree(this.tree, result.tree);
    if (deepFetch && !_.isEmpty(this.listSubTree())) {
      return Promise.all(
        _.map(this.listSubTree(), (subTree) => subTree.fetchSubTree(deepFetch))
      );
    }
    return this;
  });
}

export class Branch {
  constructor(branch, context) {
    this.name = branch.name;
    this.context = context;
    this.tree = new GitTree(branch.tree || {}, this.context);
  }

  fetchBranch = () =>
    repos.getBranch({
      ...this.context,
      branch: this.name,
    }).then((result) => {
      this.tree = new GitTree(result.commit.commit.tree, this.context);
      return this;
    });
}

export class Repo {
  static fromGithub(result) {
    return new Repo({
      user: result.owner.login,
      repo: result.name,
      pushedAt: result.pushed_at,
      private: result.private,
      branch: {
        name: result.default_branch,
      },
    });
  }

  getTree() {
    return this.branch.tree;
  }

  constructor(repo) {
    this.user = repo.user;
    this.repo = repo.repo;
    this.pushedAt = repo.pushedAt;
    this.private = repo.private;
    this.branch = new Branch(repo.branch, this);
  }
}

export class RepoList {
  constructor(repoList) {
    this.list = _.map(repoList, (repo) => new Repo(repo));
  }

  getRepos() {
    return this.list;
  }

  fetchRepos = ({ user, ...others }) =>
    repos.getForUser({ user, ...others })
      .then((repoList) => _.filter(repoList, (repo) => repo.size))
      .then((repoList) => _.filter(repoList, (repo) => !repo.fork))
      .then((repoList) => {
        this.list = _.map(repoList, (repo) => Repo.fromGithub(repo));
        return this.list;
      })
}

export class NodeProject {
  static isMonoRepo = (repo) => repo.getTree().blobExist('lerna.json')
  && repo.getTree().treeExist('packages');

  static getMonoPackages = (repo) => _.mapValues(
    repo.getTree().getSubTree('packages').listSubTree(),
    (subTree) => NodeProject.tryParseJSON(subTree.getBlob('package.json').getContent())
  );

  static tryParseJSON = (json) => {
    try {
      return JSON.parse(json);
    } catch (e) {
      return {};
    }
  };

  static fromRepo = (repo) =>
    new NodeProject({
      user: repo.user,
      repo: repo.repo,
      pushedAt: repo.pushedAt,
      package: NodeProject.tryParseJSON(repo.getTree().getBlob('package.json').getContent()),
      packages: NodeProject.isMonoRepo(repo) ? NodeProject.getMonoPackages(repo) : {},
    });

  constructor(nodeProject) {
    this.user = nodeProject.user;
    this.repo = nodeProject.repo;
    this.pushedAt = nodeProject.pushedAt;
    this.package = nodeProject.package;
    this.packages = nodeProject.packages;
  }
}
