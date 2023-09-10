import { Router, Group } from '@stricjs/router';


class Result<T>{
  data?: T;
  code: number;
  msg: string;

  constructor(data: T, code: number, msg: string) {
    this.data = data
    this.code = code
    this.msg = msg
  }
}

function ok<T>(data?: T): Result<T> {
  return { data: data, code: 0, msg: "" }
}

function err<T>(code: number, msg: string): Result<T> {
  return { code: code, msg: msg }
}

class Fighter {
  id: string;
  name: string;
  skill: string[];
  created_at: Date;
  updated_at?: Date;

  constructor(
    { id = crypto.randomUUID(), name, skill, created_at = new Date(), updated_at }:
      { id?: string, name: string, skill: string[], created_at?: Date, updated_at?: Date }
  ) {
    this.id = id
    this.name = name
    this.skill = skill
    this.created_at = created_at
    this.updated_at = updated_at
  }
}

type FighterCreate = {
  name: string;
  skill: string[];
}

type FighterEdit = {
  name: string;
  skill: string[];
}

function toFighter(a: FighterCreate): Fighter {
  return new Fighter({ name: a.name, skill: a.skill })
}

var fighters = [
  new Fighter({ name: "隆", skill: ["波动拳"] }),
  new Fighter({ name: "肯", skill: ["升龙拳"] }),
]


type StartupInfo = {
  pid: number;
  port: number;
  bun_version: string;
}

const startup_info: StartupInfo = { pid: process.pid, port: 3000, bun_version: Bun.version }
console.log(`Startup info: ${JSON.stringify(startup_info)}`)

const fighter_router = new Group('/fighter')
  .get("", () => Response.json(ok(fighters)))
  .get('/:name', req => {
    const name = decodeURI(req.params.name)
    const found = fighters.find(x => x.name === name)
    return Response.json(ok(found))
  })
  .post("", async (req) => {
    const fighter_create: FighterCreate = await req.json()

    if (fighter_create?.name === "" || fighter_create?.name === undefined) {
      throw new Error("VALIDATION")
    }

    const new_fighter = toFighter(fighter_create)
    fighters.push(new_fighter)
    return Response.json(ok(new_fighter))
  })
  .put("", async (req) => {
    const fighter_edit: FighterEdit = await req.json()

    if (fighter_edit?.name === "" || fighter_edit?.name === undefined) {
      throw new Error("VALIDATION")
    }

    const found = fighters.find(x => x.name === fighter_edit.name)
    if (found === null || found === undefined) {
      throw new Error("NOT_FOUND")
    }

    found.skill = fighter_edit.skill
    found.updated_at = new Date()

    return Response.json(ok(found))
  })
  .delete("/:name", (req) => {
    const name = decodeURI(req.params.name)
    const found = fighters.find(x => x.name === name)
    fighters = fighters.filter(x => x.name !== name)
    return Response.json(ok(found))
  })


export default new Router({
  base: `http://localhost:${startup_info.port}`
})
  .plug(fighter_router)


