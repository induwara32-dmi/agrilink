import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import YAML from 'yaml';

const workflowDirectory = resolve('.github/workflows');
const expected = {
  'ci.yml': ['prisma', 'lint', 'backend', 'frontend', 'test'],
  'deploy.yml': ['verify', 'vercel', 'railway', 'render'],
  'release.yml': ['release'],
};

const workflows = new Map();

for (const [file, requiredJobs] of Object.entries(expected)) {
  const source = await readFile(resolve(workflowDirectory, file), 'utf8');
  const document = YAML.parseDocument(source, { prettyErrors: true, uniqueKeys: true });

  if (document.errors.length) {
    throw new Error(`${file}: ${document.errors.map((error) => error.message).join('; ')}`);
  }

  const workflow = document.toJS();
  if (!workflow || typeof workflow !== 'object' || typeof workflow.name !== 'string') {
    throw new Error(`${file}: workflow name is required.`);
  }
  if (!workflow.on || typeof workflow.on !== 'object') {
    throw new Error(`${file}: at least one trigger is required.`);
  }
  if (!workflow.permissions || workflow.permissions.contents === undefined) {
    throw new Error(`${file}: explicit contents permission is required.`);
  }
  if (!workflow.jobs || typeof workflow.jobs !== 'object') {
    throw new Error(`${file}: jobs mapping is required.`);
  }

  for (const job of requiredJobs) {
    if (!workflow.jobs[job]) throw new Error(`${file}: missing ${job} job.`);
  }

  if (/\b(?:password|token|secret|api[_-]?key)\s*:\s*["']?(?!\$\{\{|ci-|release-|deploy-|placeholder|agrilink_test|<)[^\s"']{12,}/i.test(source)) {
    throw new Error(`${file}: possible literal credential detected.`);
  }

  workflows.set(file, { source, workflow });
}

const ci = workflows.get('ci.yml');
if (!Object.hasOwn(ci.workflow.on, 'push') || !Object.hasOwn(ci.workflow.on, 'pull_request')) throw new Error('ci.yml: push and pull_request triggers are required.');
if (!ci.source.includes('npm run test:coverage') || !ci.source.includes('actions/upload-artifact@v4')) throw new Error('ci.yml: coverage execution and artifact upload are required.');
if (!ci.source.includes('services:\n      postgres:')) throw new Error('ci.yml: PostgreSQL test service is required.');

const deployment = workflows.get('deploy.yml');
if (!deployment.workflow.on.workflow_dispatch) throw new Error('deploy.yml: workflow_dispatch trigger is required.');
if (!deployment.source.includes('environment: ${{ inputs.environment }}')) throw new Error('deploy.yml: protected environments are required.');

const release = workflows.get('release.yml');
const tags = release.workflow.on.push?.tags;
if (!Array.isArray(tags) || !tags.includes('v*')) throw new Error('release.yml: v* tag trigger is required.');
if (!release.source.includes('SHA256SUMS.txt') || !release.source.includes('gh release')) throw new Error('release.yml: checksums and GitHub release publishing are required.');

console.log(`Validated ${workflows.size} GitHub Actions workflows.`);
