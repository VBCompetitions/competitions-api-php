import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import standaloneCode from 'ajv/dist/standalone/index.js'

async function compileSchema() {
  const clubCreate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'clubCreate.json'), import.meta.url), { encoding: 'utf8' }))
  const clubUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'clubUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const contactCreate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'contactCreate.json'), import.meta.url), { encoding: 'utf8' }))
  const contactUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'contactUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const groupAppend = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'groupAppend.json'), import.meta.url), { encoding: 'utf8' }))
  const groupUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'groupUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const matchResultUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'matchResultUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const matchUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'matchUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const playerCreate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'playerCreate.json'), import.meta.url), { encoding: 'utf8' }))
  const playerTransfer = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'playerTransfer.json'), import.meta.url), { encoding: 'utf8' }))
  const playerUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'playerUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const stageAppend = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'stageAppend.json'), import.meta.url), { encoding: 'utf8' }))
  const stageUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'stageUpdate.json'), import.meta.url), { encoding: 'utf8' }))
  const teamCreate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'teamCreate.json'), import.meta.url), { encoding: 'utf8' }))
  const teamUpdate = JSON.parse(await readFile(new URL(path.join('..', '..', 'src', 'API', 'schema', 'teamUpdate.json'), import.meta.url), { encoding: 'utf8' }))

  const ajv = new Ajv({
    schemas: [
      clubCreate,
      clubUpdate,
      contactCreate,
      contactUpdate,
      groupAppend,
      groupUpdate,
      matchResultUpdate,
      matchUpdate,
      playerCreate,
      playerTransfer,
      playerUpdate,
      stageAppend,
      stageUpdate,
      teamCreate,
      teamUpdate
    ],
    code: {
      source: true,
      esm: true
    }
  })

  addFormats(ajv)

  let moduleCode = standaloneCode(ajv, {
    'validateClubCreate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/clubCreate',
    'validateClubUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/clubUpdate',
    'validateContactCreate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/contactCreate',
    'validateContactUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/contactUpdate',
    'validateGroupAppend': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/groupAppend',
    'validateGroupUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/groupUpdate',
    'validateMatchResultUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/matchResultUpdate',
    'validateMatchUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/matchUpdate',
    'validatePlayerCreate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/playerCreate',
    'validatePlayerTransfer': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/playerTransfer',
    'validatePlayerUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/playerUpdate',
    'validateStageAppend': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/stageAppend',
    'validateStageUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/stageUpdate',
    'validateTeamCreate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/teamCreate',
    'validateTeamUpdate': 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/teamUpdate'
  })

  await writeFile(new URL(path.join('..', 'src', 'apis', 'competitionSchema.js'), import.meta.url), moduleCode, { encoding: 'utf8' })
}

compileSchema()
  .then(
    () => {
      console.log('Schema compiled')
    },
    err => {
      console.error(`Error compiling schema:\n${err}`)
    }
  )
