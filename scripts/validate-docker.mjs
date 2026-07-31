import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const composeFiles = ['docker-compose.yml', 'docker-compose.prod.yml'];
for (const file of composeFiles) {
  const document = parse(await readFile(file, 'utf8'));
  if (!document || typeof document !== 'object' || !document.services || typeof document.services !== 'object') throw new Error(`${file} must define services.`);
  for (const [name, service] of Object.entries(document.services)) if (!service || typeof service !== 'object' || (!service.image && !service.build)) throw new Error(`${file}: service ${name} needs image or build.`);
  console.log(`${file}: valid YAML (${Object.keys(document.services).length} services)`);
}

const frontend = await readFile('Dockerfile', 'utf8');
const backend = await readFile('Dockerfile.backend', 'utf8');
for (const [file, content, stages] of [['Dockerfile', frontend, ['development', 'builder', 'runner']], ['Dockerfile.backend', backend, ['development', 'builder', 'runner']]]) for (const stage of stages) if (!new RegExp(`\\sAS\\s+${stage}(?:\\s|$)`, 'i').test(content)) throw new Error(`${file} is missing ${stage} stage.`);
console.log('Dockerfiles: required build stages present');
