import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import * as db from '../db';

import {
  RepoList,
  NodeProject,
} from '../github';

import {
  renderRepoTable,
} from '../markdown';

describe(__filename, () => {
  context('fetch repos', () => {
    it('should get root tree of repo', () => {
      const repoList = new RepoList();

      const fetchTrees = (targetRepo) =>
        targetRepo.branch.fetchBranch()
          .then(() => targetRepo.getTree().fetchSubTree());

      return repoList.fetchRepos({
        user: 'morlay',
        per_page: 100,
      }).then((repos) =>
        Promise.all(_.map(repos, fetchTrees))
          .then(() => db.set('repos', repos))
      );
    });

    it('should get packageJSON of repo', () => {
      const repos = new RepoList(db.get('repos')).getRepos();

      const nodeRepos = _.filter(repos, (repo) => repo.getTree().blobExist('package.json'));

      const fetchPackageJSONs = _.map(nodeRepos, (nodeProject) =>
        nodeProject.getTree().getBlob('package.json').fetchContent()
      );

      const monoRepos = _.filter(repos, NodeProject.isMonoRepo);

      const fetchMonos = _.map(monoRepos, (nodeProject) =>
        nodeProject.getTree()
          .getSubTree('packages')
          .fetchSubTree()
          .then((tree) => Promise.all(_.map(
            tree.listSubTree(),
            (subTree) => subTree.fetchSubTree()
              .then(() => subTree.getBlob('package.json').fetchContent())
          )))
      );

      return Promise.all([].concat(fetchPackageJSONs).concat(fetchMonos))
        .then(() => db.set('nodeRepos', nodeRepos));
    });
  });

  context('transform to node projects', () => {
    it('should set nodeProjects', () => {
      const repos = new RepoList(db.get('nodeRepos')).getRepos();
      const nodeProjects = _.map(repos, (nodeRepo) => NodeProject.fromRepo(nodeRepo));

      db.set('nodeProjects', nodeProjects);
    });

    it('should write to README.md', () => {
      const nodeProjects = _.map(
        db.get('nodeProjects'),
        (nodeProject) => new NodeProject(nodeProject)
      );

      const result = renderRepoTable(nodeProjects);

      fs.writeFileSync(
        path.resolve(process.cwd(), 'README.md'),
        new Buffer(result));
    });
  });
});
