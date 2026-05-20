//BASE DE DATOS SIMPLE

const DB_KEYS = {
  clientes: 'sr_clientes',
  pagos: 'sr_pagos',
  planes: 'sr_planes',
  antenas: 'sr_antenas',
};

// ---- DATOS SEMILLA ----
const SEED_PLANES = [
  { id:'P01', nombre:'Básico',    velocidad:30,  precio:50.00, estado:'Activo' },
  { id:'P02', nombre:'Estándar',  velocidad:50,  precio:70.00, estado:'Activo' },
  { id:'P03', nombre:'Avanzado',  velocidad:80,  precio:90.00, estado:'Activo' },
  { id:'P04', nombre:'Premium',   velocidad:100, precio:110.00, estado:'Activo' },
];

const SEED_ANTENAS = [
  { id:'A1', nombre:'A1 - Cerro Norte',    ubicacion:'Sector 1 - Cerro Norte',    sector:'Sector 1' },
  { id:'A2', nombre:'A2 - Poste Central',  ubicacion:'Sector 3 - Poste Central',  sector:'Sector 3' },
  { id:'A3', nombre:'A3 - Torre Sur',      ubicacion:'Sector 5 - Torre Sur',      sector:'Sector 5' },
];

const SEED_CLIENTES = [
  { id:'001', nombre:'Juan Perez',       dni:'12345678', tel:'987654321', direccion:'Alto Trujillo - Sector 3 - Mz A Lote 5', sector:'Sector 3', planId:'P02', antenaId:'A1', fechaInstalacion:'2024-03-15', estado:'Con deuda' },
  { id:'002', nombre:'Maria Lopez',      dni:'23456789', tel:'912345678', direccion:'Sector 1 - Mz B Lote 12', sector:'Sector 1', planId:'P03', antenaId:'A2', fechaInstalacion:'2024-01-20', estado:'Al día' },
  { id:'003', nombre:'Carlos Rodriguez', dni:'34567890', tel:'965432100', direccion:'Sector 5 - Mz C Lote 3',  sector:'Sector 5', planId:'P03', antenaId:'A3', fechaInstalacion:'2023-11-10', estado:'Con deuda' },
  { id:'004', nombre:'Ana Ramirez',      dni:'45678901', tel:'978901234', direccion:'Sector 2 - Mz A Lote 8',  sector:'Sector 2', planId:'P02', antenaId:'A1', fechaInstalacion:'2024-02-05', estado:'Al día' },
  { id:'005', nombre:'Luis Sanchez',     dni:'56789012', tel:'945678901', direccion:'Sector 3 - Mz D Lote 1',  sector:'Sector 3', planId:'P03', antenaId:'A2', fechaInstalacion:'2023-09-12', estado:'Al día' },
  { id:'006', nombre:'Rosa Flores',      dni:'67890123', tel:'923456789', direccion:'Sector 4 - Mz E Lote 7',  sector:'Sector 4', planId:'P01', antenaId:'A3', fechaInstalacion:'2024-04-01', estado:'Con deuda' },
  { id:'007', nombre:'Pedro Gutierrez',  dni:'78901234', tel:'956789012', direccion:'Sector 1 - Mz F Lote 2',  sector:'Sector 1', planId:'P04', antenaId:'A1', fechaInstalacion:'2023-07-22', estado:'Al día' },
  { id:'008', nombre:'Carmen Torres',    dni:'89012345', tel:'934567890', direccion:'Sector 2 - Mz G Lote 9',  sector:'Sector 2', planId:'P02', antenaId:'A2', fechaInstalacion:'2024-05-10', estado:'Al día' },
  { id:'009', nombre:'Jorge Mendoza',    dni:'90123456', tel:'967890123', direccion:'Sector 4 - Mz H Lote 4',  sector:'Sector 4', planId:'P01', antenaId:'A3', fechaInstalacion:'2023-12-01', estado:'Con deuda' },
  { id:'010', nombre:'Elena Castro',     dni:'01234567', tel:'912678901', direccion:'Sector 5 - Mz I Lote 6',  sector:'Sector 5', planId:'P04', antenaId:'A1', fechaInstalacion:'2024-03-20', estado:'Al día' },
  { id:'011', nombre:'Roberto Vega',     dni:'11234567', tel:'945601234', direccion:'Sector 3 - Mz J Lote 11', sector:'Sector 3', planId:'P02', antenaId:'A2', fechaInstalacion:'2024-01-08', estado:'Al día' },
  { id:'012', nombre:'Lucia Peña',       dni:'22345678', tel:'978123456', direccion:'Sector 1 - Mz K Lote 3',  sector:'Sector 1', planId:'P03', antenaId:'A3', fechaInstalacion:'2023-10-15', estado:'Con deuda' },
];

const SEED_PAGOS = [
  // Juan Perez - tiene deuda mayo
  { id:'PAG001', clienteId:'001', mes:'Febrero 2026', monto:70.00, fecha:'2026-02-01', estado:'Pagado', metodo:'Efectivo', obs:'' },
  { id:'PAG002', clienteId:'001', mes:'Marzo 2026',   monto:70.00, fecha:'2026-03-02', estado:'Pagado', metodo:'Yape',     obs:'' },
  { id:'PAG003', clienteId:'001', mes:'Abril 2026',   monto:70.00, fecha:'2026-04-01', estado:'Pagado', metodo:'Efectivo', obs:'' },
  { id:'PAG004', clienteId:'001', mes:'Mayo 2026',    monto:70.00, fecha:'2026-05-01', estado:'Pendiente', metodo:'',    obs:'No pagó' },
  // Maria Lopez - al día
  { id:'PAG005', clienteId:'002', mes:'Marzo 2026',   monto:90.00, fecha:'2026-03-01', estado:'Pagado', metodo:'Plin',     obs:'' },
  { id:'PAG006', clienteId:'002', mes:'Abril 2026',   monto:90.00, fecha:'2026-04-03', estado:'Pagado', metodo:'Plin',     obs:'' },
  { id:'PAG007', clienteId:'002', mes:'Mayo 2026',    monto:90.00, fecha:'2026-05-05', estado:'Pagado', metodo:'Yape',     obs:'' },
  // Carlos - deuda
  { id:'PAG008', clienteId:'003', mes:'Abril 2026',   monto:90.00, fecha:'2026-04-01', estado:'Pagado', metodo:'Efectivo', obs:'' },
  { id:'PAG009', clienteId:'003', mes:'Mayo 2026',    monto:90.00, fecha:'',           estado:'Pendiente', metodo:'',    obs:'' },
  // Ana - al día
  { id:'PAG010', clienteId:'004', mes:'Mayo 2026',    monto:70.00, fecha:'2026-05-02', estado:'Pagado', metodo:'Transferencia', obs:'' },
  // Luis - al día
  { id:'PAG011', clienteId:'005', mes:'Mayo 2026',    monto:90.00, fecha:'2026-05-04', estado:'Pagado', metodo:'Yape',     obs:'' },
  // Rosa - deuda
  { id:'PAG012', clienteId:'006', mes:'Abril 2026',   monto:50.00, fecha:'2026-04-05', estado:'Pagado', metodo:'Efectivo', obs:'' },
  { id:'PAG013', clienteId:'006', mes:'Mayo 2026',    monto:50.00, fecha:'',           estado:'Pendiente', metodo:'',    obs:'' },
  // Pedro - al día
  { id:'PAG014', clienteId:'007', mes:'Mayo 2026',    monto:110.00, fecha:'2026-05-01', estado:'Pagado', metodo:'Plin',   obs:'' },
  // Carmen - al día
  { id:'PAG015', clienteId:'008', mes:'Mayo 2026',    monto:70.00, fecha:'2026-05-10', estado:'Pagado', metodo:'Yape',    obs:'' },
  // Jorge - deuda
  { id:'PAG016', clienteId:'009', mes:'Mayo 2026',    monto:50.00, fecha:'',           estado:'Pendiente', metodo:'',    obs:'' },
  // Elena - al día
  { id:'PAG017', clienteId:'010', mes:'Mayo 2026',    monto:110.00, fecha:'2026-05-12', estado:'Pagado', metodo:'Transferencia', obs:'' },
  // Roberto - al día
  { id:'PAG018', clienteId:'011', mes:'Mayo 2026',    monto:70.00, fecha:'2026-05-06', estado:'Pagado', metodo:'Efectivo', obs:'' },
  // Lucia - deuda
  { id:'PAG019', clienteId:'012', mes:'Mayo 2026',    monto:90.00, fecha:'',           estado:'Pendiente', metodo:'',    obs:'' },
];

// ---- INIT DB ----
function initDB() {
  if (!localStorage.getItem(DB_KEYS.planes))   localStorage.setItem(DB_KEYS.planes,   JSON.stringify(SEED_PLANES));
  if (!localStorage.getItem(DB_KEYS.antenas))  localStorage.setItem(DB_KEYS.antenas,  JSON.stringify(SEED_ANTENAS));
  if (!localStorage.getItem(DB_KEYS.clientes)) localStorage.setItem(DB_KEYS.clientes, JSON.stringify(SEED_CLIENTES));
  if (!localStorage.getItem(DB_KEYS.pagos))    localStorage.setItem(DB_KEYS.pagos,    JSON.stringify(SEED_PAGOS));
}

// ---- CRUD helpers ----
function getPlanes()   { return JSON.parse(localStorage.getItem(DB_KEYS.planes)   || '[]'); }
function getAntenas()  { return JSON.parse(localStorage.getItem(DB_KEYS.antenas)  || '[]'); }
function getClientes() { return JSON.parse(localStorage.getItem(DB_KEYS.clientes) || '[]'); }
function getPagos()    { return JSON.parse(localStorage.getItem(DB_KEYS.pagos)    || '[]'); }

function setPlanes(d)   { localStorage.setItem(DB_KEYS.planes,   JSON.stringify(d)); }
function setAntenas(d)  { localStorage.setItem(DB_KEYS.antenas,  JSON.stringify(d)); }
function setClientes(d) { localStorage.setItem(DB_KEYS.clientes, JSON.stringify(d)); }
function setPagos(d)    { localStorage.setItem(DB_KEYS.pagos,    JSON.stringify(d)); }

function getPlan(id)   { return getPlanes().find(p=>p.id===id); }
function getAntena(id) { return getAntenas().find(a=>a.id===id); }
function getCliente(id){ return getClientes().find(c=>c.id===id); }

function nextId(arr, prefix) {
  if (!arr.length) return prefix + '001';
  const nums = arr.map(x => parseInt(x.id.replace(prefix,''))||0);
  return prefix + String(Math.max(...nums)+1).padStart(3,'0');
}
