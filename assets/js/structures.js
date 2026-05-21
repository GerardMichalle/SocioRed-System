
// STRUCTURES.JS — Estructuras de Datos SocioRed
// Árbol BST, Cola (Queue) y Pila (Stack)



// ÁRBOL BINARIO DE BÚSQUEDA (BST)
// Usado para: búsqueda eficiente de clientes por ID numérico
// Complejidad: O(log n) búsqueda/inserción (árbol balanceado)

class BSTNode {
  constructor(key, data) {
    this.key  = parseInt(key);  // ID numérico
    this.data = data;           // Objeto cliente
    this.izquierda = null;
    this.derecha = null;
  }
}

class BST {
  constructor() {
    this.root = null;
    this.size = 0;
  }

  insert(key, data) {
    const node = new BSTNode(key, data);
    if (!this.root) { this.root = node; this.size++; return; }
    let curr = this.root;
    while (true) {
      if (node.key < curr.key) {
        if (!curr.izquierda) { curr.izquierda = node; this.size++; return; }
        curr = curr.izquierda;
      } else if (node.key > curr.key) {
        if (!curr.derecha) { curr.derecha = node; this.size++; return; }
        curr = curr.derecha;
      } else {
        curr.data = data; // update
        return;
      }
    }
  }

  search(key) {
    let curr = this.root;
    const k = parseInt(key);
    while (curr) {
      if (k === curr.key) return curr.data;
      curr = k < curr.key ? curr.izquierda : curr.derecha;
    }
    return null;
  }

  delete(key) {
    this.root = this._deleteNode(this.root, parseInt(key));
  }
  _deleteNode(node, key) {
    if (!node) return null;
    if (key < node.key) { node.izquierda = this._deleteNode(node.izquierda, key); }
    else if (key > node.key) { node.derecha = this._deleteNode(node.derecha, key); }
    else {
      this.size--;
      if (!node.izquierda) return node.derecha;
      if (!node.derecha) return node.izquierda;
      let min = node.derecha;
      while (min.izquierda) min = min.izquierda;
      node.key  = min.key;
      node.data = min.data;
      node.derecha = this._deleteNode(node.derecha, min.key);
      this.size++;
    }
    return node;
  }

  inOrder() {
    const result = [];
    const traverse = (node) => {
      if (!node) return;
      traverse(node.izquierda);
      result.push(node.data);
      traverse(node.derecha);
    };
    traverse(this.root);
    return result;
  }

  height() {
    const h = (node) => {
      if (!node) return 0;
      return 1 + Math.max(h(node.izquierda), h(node.derecha));
    };
    return h(this.root);
  }

  // Retorna representación ASCII del árbol (hasta profundidad 4)
  toAscii() {
    if (!this.root) return '(árbol vacío)';
    const lines = [];
    const fill = (node, prefix, isizquierda) => {
      if (!node) return;
      if (node.derecha) fill(node.derecha, prefix + (isizquierda ? '│   ' : '    '), false);
      lines.push(prefix + (isizquierda ? '└── ' : '┌── ') + String(node.key).padStart(3,'0') + ' ' + (node.data.nombre||''));
      if (node.izquierda)  fill(node.izquierda,  prefix + (isizquierda ? '    ' : '│   '), true);
    };
    if (this.root.derecha) fill(this.root.derecha, '', false);
    lines.push('● ' + String(this.root.key).padStart(3,'0') + ' ' + (this.root.data.nombre||''));
    if (this.root.izquierda)  fill(this.root.izquierda,  '', true);
    return lines.join('\n');
  }
}


// COLA (QUEUE) — FIFO
// Usado para: gestión de pagos pendientes
// El primero en entrar es el primero en ser cobrado

class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) { this.items.push(item); }
  dequeue()     { return this.items.shift(); }
  peek()        { return this.items[0]; }
  isEmpty()     { return this.items.length === 0; }
  get size()    { return this.items.length; }
  toArray()     { return [...this.items]; }
  clear()       { this.items = []; }
  // Eliminar por clienteId
  remove(clienteId) {
    this.items = this.items.filter(i => i.clienteId !== clienteId);
  }
}

 
// PILA (STACK) — LIFO
// Usado para: historial de pagos por cliente (último al tope)

class Stack {
  constructor() {
    this.items = [];
    this.totalOps = 0;
  }
  push(item)   { this.items.push(item); this.totalOps++; }
  pop()        { return this.items.pop(); }
  peek()       { return this.items[this.items.length-1]; }
  isEmpty()    { return this.items.length === 0; }
  get size()   { return this.items.length; }
  toArray()    { return [...this.items].reverse(); } // más reciente primero
  clear()      { this.items = []; }
}


// INSTANCIAS GLOBALES

const clientesBST = new BST();
const pagosQueue  = new Queue();   // pagos pendientes
const pagosStack  = {};            // { clienteId: Stack } — historial por cliente


// CARGA DE ESTRUCTURAS DESDE STORAGE

function loadStructures() {
  const clientes = getClientes();
  const pagos    = getPagos();

  // Reconstruir BST con todos los clientes
  clientesBST.root = null;
  clientesBST.size = 0;
  clientes.forEach(c => clientesBST.insert(c.id, c));

  // Reconstruir Cola con pagos pendientes (ordenados por fecha o por ID)
  pagosQueue.clear();
  const pendientes = pagos
    .filter(p => p.estado === 'Pendiente')
    .sort((a,b) => a.clienteId.localeCompare(b.clienteId));
  pendientes.forEach(p => {
    // Solo un elemento por cliente en la cola
    if (!pagosQueue.items.find(q => q.clienteId === p.clienteId)) {
      const cliente = getCliente(p.clienteId);
      pagosQueue.enqueue({ clienteId: p.clienteId, nombre: cliente?.nombre||'?', pagoId: p.id, mes: p.mes, monto: p.monto });
    }
  });

  // Reconstruir Pilas de historial por cliente
  Object.keys(pagosStack).forEach(k => delete pagosStack[k]);
  clientes.forEach(c => {
    pagosStack[c.id] = new Stack();
  });
  // Insertar pagos ordenados (más antiguo primero → más nuevo al tope)
  const pagosSorted = [...pagos].sort((a,b) => (a.fecha||'').localeCompare(b.fecha||''));
  pagosSorted.forEach(p => {
    if (pagosStack[p.clienteId]) pagosStack[p.clienteId].push(p);
    else { pagosStack[p.clienteId] = new Stack(); pagosStack[p.clienteId].push(p); }
  });
}

// Obtener historial de pagos de un cliente desde su pila
function getHistorialCliente(clienteId) {
  const stack = pagosStack[clienteId];
  return stack ? stack.toArray() : [];
}

// Registrar pago: push a pila, quitar de cola si pagó
function registrarPagoEnEstructura(pago) {
  if (!pagosStack[pago.clienteId]) pagosStack[pago.clienteId] = new Stack();
  pagosStack[pago.clienteId].push(pago);
  if (pago.estado === 'Pagado') {
    pagosQueue.remove(pago.clienteId);
  }
}

// Agregar cliente al BST
function insertarClienteBST(cliente) {
  clientesBST.insert(cliente.id, cliente);
}

// Eliminar cliente del BST
function eliminarClienteBST(clienteId) {
  clientesBST.delete(clienteId);
}
