import fs from 'fs'
const DB = './database/activos.json'

function load(){
  try { return JSON.parse(fs.readFileSync(DB)) }
  catch { return { welcomeOff: [], byeOff: [] } }
}
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)) }

// PRENDIDO POR DEFECTO
export function isActivo(tipo, id){
  const db = load()
  // Compatibilidad con DB vieja
  if(tipo==='welcome'){
    if(db.welcomeOff) return !db.welcomeOff.includes(id)
    if(db.welcome) return true // si antes lo tenias en lista, ahora todos prendidos
    return true
  }
  if(tipo==='bye'){
    if(db.byeOff) return !db.byeOff.includes(id)
    if(db.bye) return true
    return true
  }
  return true
}

export function setActivo(tipo, id, estado){
  const db = load()
  if(tipo==='welcome'){
    if(!db.welcomeOff) db.welcomeOff=[]
    if(estado) db.welcomeOff = db.welcomeOff.filter(x=>x!==id)
    else if(!db.welcomeOff.includes(id)) db.welcomeOff.push(id)
    // limpia formato viejo
    delete db.welcome
  }
  if(tipo==='bye'){
    if(!db.byeOff) db.byeOff=[]
    if(estado) db.byeOff = db.byeOff.filter(x=>x!==id)
    else if(!db.byeOff.includes(id)) db.byeOff.push(id)
    delete db.bye
  }
  save(db)
}

export function getActivos(){ return load() }
export function getAllActivos(){ return load() }
