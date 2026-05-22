class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.siguiente = null;
  }
}

// Se usa para nuestro historial de pagos del cliente

class Stack {
 constructor()
 {
  this.cabeza = null;
  this.size = 0;
 }

 push(valor)
 {
  var nuevo = new Nodo(valor);
  nuevo.siguiente = this.cabeza;
  this.cabeza=nuevo;
  this.size++;
 }
 pop()
 {
  if(!this.cabeza) return null;
  var temp = this.cabeza;
  this.cabeza = this.cabeza.siguiente;
  this.size--;

  return temp.valor;

 }
 peek()
 {
  if(!this.cabeza) return null;
  return this.cabeza.valor;
 }

 toList()
 {
  var lista = [];
  let actual = this.cabeza;
  while(actual)
    {
      lista.push(actual.valor);
      actual = actual.siguiente;
    }
  return lista;
 }
 limpiar()
 {
  this.cabeza=null;
  this.size= 0;  
 }
 
}




// Se usa para ver los clientes que deben pagar
class Queue {
 constructor()
 {
  this.frente= null;
  this.final = null;
  this.size=0;
 }

  enqueue(valor) {
    var nuevo = new Nodo(valor);
    if (!this.frente) {
      this.frente = nuevo;
      this.final = nuevo;
    } else {
      this.final.siguiente = nuevo;
      this.final = nuevo;
    }
    this.size++;
  }

  dequeue() {
    if (!this.frente) return null;
    var temp = this.frente;
    this.frente = this.frente.siguiente;
    this.size--;
    if (!this.frente) this.final = null;
    return temp.valor;
  }

  peek() {
    if (!this.frente) return null;
    return this.frente.valor;
  }

  remove(clienteId) {
    if (!this.frente) return;

    if (this.frente.valor.clienteId === clienteId) {
      this.dequeue();
      return;
    }

    var actual = this.frente;

    while (actual.siguiente) {
      if (actual.siguiente.valor.clienteId === clienteId) {
        if (actual.siguiente === this.final) this.final = actual;
        actual.siguiente = actual.siguiente.siguiente;
        this.size--;
        return;
      }
      actual = actual.siguiente;
    }
  }

  contiene(clienteId) {
    var actual = this.frente;
    while (actual) {
      if (actual.valor.clienteId === clienteId) return true;
      actual = actual.siguiente;
    }
    return false;
  }

  toList() {
    var lista = [];
    var actual = this.frente;
    while (actual) {
      lista.push(actual.valor);
      actual = actual.siguiente;
    }
    return lista;
  }

  limpiar() {
    this.frente = null;
    this.final = null;
    this.size = 0;
  }
}







// Se usa para ordenar los pagos pendientes por urgencia
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  insert(valor) {
    this.heap.push(valor);
    this._subir(this.heap.length - 1);
  }

  extractMax() {
    if (!this.heap.length) return null;
    if (this.heap.length === 1) return this.heap.pop();

    var max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bajar(0);
    return max;
  }

  toList() {
    var copia = new PriorityQueue();
    copia.heap = this.heap.slice();
    var lista = [];
    while (copia.size) lista.push(copia.extractMax());
    return lista;
  }

  limpiar() {
    this.heap = [];
  }

  _mayor(a, b) {
    if (a.prioridad !== b.prioridad) return a.prioridad > b.prioridad;
    if (a.monto !== b.monto) return a.monto > b.monto;
    return String(a.clienteId).localeCompare(String(b.clienteId)) < 0;
  }

  _subir(index) {
    while (index > 0) {
      var padre = Math.floor((index - 1) / 2);
      if (!this._mayor(this.heap[index], this.heap[padre])) break;
      var temp = this.heap[index];
      this.heap[index] = this.heap[padre];
      this.heap[padre] = temp;
      index = padre;
    }
  }

  _bajar(index) {
    while (true) {
      var izq = index * 2 + 1;
      var der = index * 2 + 2;
      var mayor = index;

      if (izq < this.heap.length && this._mayor(this.heap[izq], this.heap[mayor])) mayor = izq;
      if (der < this.heap.length && this._mayor(this.heap[der], this.heap[mayor])) mayor = der;
      if (mayor === index) break;

      var temp = this.heap[index];
      this.heap[index] = this.heap[mayor];
      this.heap[mayor] = temp;
      index = mayor;
    }
  }
}

function obtenerOrdenMes(mesTexto) {
  var partes = String(mesTexto || "").split(" ");
  var meses = {
    Enero: 1,
    Febrero: 2,
    Marzo: 3,
    Abril: 4,
    Mayo: 5,
    Junio: 6,
    Julio: 7,
    Agosto: 8,
    Septiembre: 9,
    Octubre: 10,
    Noviembre: 11,
    Diciembre: 12,
  };
  var mes = meses[partes[0]] || 12;
  var anio = parseInt(partes[1]) || 9999;
  return anio * 12 + mes;
}

function obtenerMesActual() {
  var meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  var fecha = new Date();
  return meses[fecha.getMonth()] + " " + fecha.getFullYear();
}

function calcularPrioridadPago(pago) {
  var ordenMes = obtenerOrdenMes(pago.mes);
  var mesActual = obtenerOrdenMes(obtenerMesActual());
  var mesesAtraso = mesActual - ordenMes;
  var monto = pago.monto || 0;
  var nivel = "baja";
  var texto = "Prioridad baja";

  if (mesesAtraso >= 2 || monto >= 90) {
    nivel = "alta";
    texto = "Prioridad alta";
  } else if (mesesAtraso >= 1 || monto >= 70) {
    nivel = "media";
    texto = "Prioridad media";
  }

  return {
    nivel: nivel,
    texto: texto,
    score: mesesAtraso * 1000 + monto,
  };
}

//ARBOL BINARIO :))))

// Se usa para, buscar clientes por ID rapido

class NodoBST {
  constructor(id, cliente) {
    this.id = parseInt(id); // numero del cliente
    this.cliente = cliente; // datos del cliente
    this.izq = null; // hijos menores
    this.der = null; // hijos mayores
  }
}

class BST {
  constructor() {
    this.raiz = null;
    this.size = 0;
  }

  // Insertar cliente en el arbol
  insert(id, cliente) {
    var nuevo = new NodoBST(id, cliente);

    if (!this.raiz) {
      this.raiz = nuevo;
      this.size++;
      return;
    }

    var actual = this.raiz;
    while (true) {
      if (nuevo.id < actual.id) {
        // Va a la izquierda
        if (!actual.izq) {
          actual.izq = nuevo;
          this.size++;
          return;
        }
        actual = actual.izq;
      } else if (nuevo.id > actual.id) {
        // Va a la derecha
        if (!actual.der) {
          actual.der = nuevo;
          this.size++;
          return;
        }
        actual = actual.der;
      } else {
        actual.cliente = cliente; // actualizar si ya existe
        return;
      }
    }
  }

  // Buscar cliente por ID
  search(id) {
    var actual = this.raiz;
    var k = parseInt(id);
    while (actual) {
      if (k === actual.id) return actual.cliente;
      if (k < actual.id) actual = actual.izq;
      else actual = actual.der;
    }
    return null;
  }

  // Eliminar cliente
  delete(id) {
    this.raiz = this._eliminar(this.raiz, parseInt(id));
  }

  _eliminar(nodo, id) {
    if (!nodo) return null;
    if (id < nodo.id) {
      nodo.izq = this._eliminar(nodo.izq, id);
    } else if (id > nodo.id) {
      nodo.der = this._eliminar(nodo.der, id);
    } else {
      this.size--;
      if (!nodo.izq && !nodo.der) return null; // sin hijos
      if (!nodo.izq) return nodo.der; // solo hijo derecho
      if (!nodo.der) return nodo.izq; // solo hijo izquierdo
      // dos hijos: buscar el minimo del lado derecho
      var min = nodo.der;
      while (min.izq) min = min.izq;
      nodo.id = min.id;
      nodo.cliente = min.cliente;
      nodo.der = this._eliminar(nodo.der, min.id);
      this.size++;
    }
    return nodo;
  }

  // Altura del arbol
  height() {
    return this._altura(this.raiz);
  }
  _altura(nodo) {
    if (!nodo) return 0;
    var izq = this._altura(nodo.izq);
    var der = this._altura(nodo.der);
    return 1 + (izq > der ? izq : der);
  }

  // Mostrar arbol en texto
  toAscii() {
    if (!this.raiz) return "(arbol vacio)";
    var lineas = [];
    this._dibujar(this.raiz, "", false, lineas);
    return lineas.join("\n");
  }
  _dibujar(nodo, prefix, esIzq, lineas) {
    if (!nodo) return;
    if (nodo.der)
      this._dibujar(
        nodo.der,
        prefix + (esIzq ? "│   " : "    "),
        false,
        lineas,
      );
    lineas.push(
      prefix +
        (esIzq ? "└── " : "┌── ") +
        String(nodo.id).padStart(3, "0") +
        " " +
        nodo.cliente.nombre,
    );
    if (nodo.izq)
      this._dibujar(nodo.izq, prefix + (esIzq ? "    " : "│   "), true, lineas);
  }
}

const clientesBST = new BST();
const pagosQueue = new Queue();
const pagosPriorityQueue = new PriorityQueue();
const pagosStack = {};

function loadStructures() {
  var clientes = getClientes();
  var pagos = getPagos();

  clientesBST.raiz = null;
  clientesBST.size = 0;
  clientes.forEach((c) => clientesBST.insert(c.id, c));

  var hubocambio = false;
  clientes.forEach(function (c) {
    if (c.estado === "Con deuda") {
      var tienePendiente = false;
      for (var i = 0; i < pagos.length; i++) {
        if (pagos[i].clienteId === c.id && pagos[i].estado === "Pendiente") {
          tienePendiente = true;
          break;
        }
      }
      if (!tienePendiente) {
        var plan = getPlan(c.planId);
        pagos.push({
          id: nextId(pagos, "PAG"),
          clienteId: c.id,
          mes: obtenerMesActual(),
          monto: plan ? plan.precio : 0,
          fecha: "",
          estado: "Pendiente",
          metodo: "",
          obs: "Generado automaticamente",
        });
        hubocambio = true;
      }
    }
  });
  if (hubocambio) setPagos(pagos);

  pagosQueue.limpiar();
  pagosPriorityQueue.limpiar();
  pagos.forEach(function (p) {
    if (p.estado === "Pendiente" && !pagosQueue.contiene(p.clienteId)) {
      var c = getCliente(p.clienteId);
      pagosQueue.enqueue({
        clienteId: p.clienteId,
        nombre: c ? c.nombre : "?",
        mes: p.mes,
        monto: p.monto,
      });
    }
    if (p.estado === "Pendiente") {
      var cliente = getCliente(p.clienteId);
      var prioridad = calcularPrioridadPago(p);
      pagosPriorityQueue.insert({
        pagoId: p.id,
        clienteId: p.clienteId,
        nombre: cliente ? cliente.nombre : "?",
        mes: p.mes,
        monto: p.monto || 0,
        prioridad: prioridad.score,
        prioridadNivel: prioridad.nivel,
        prioridadTexto: prioridad.texto,
      });
    }
  });

  Object.keys(pagosStack).forEach((k) => delete pagosStack[k]);
  clientes.forEach((c) => {
    pagosStack[c.id] = new Stack();
  });

  var pagosOrdenados = pagos.slice().sort(function (a, b) {
    return (a.fecha || "").localeCompare(b.fecha || "");
  });
  pagosOrdenados.forEach(function (p) {
    if (!pagosStack[p.clienteId]) pagosStack[p.clienteId] = new Stack();
    pagosStack[p.clienteId].push(p);
  });
}

function getHistorialCliente(clienteId) {
  var pila = pagosStack[clienteId];
  return pila ? pila.toList() : [];
}

function registrarPagoEnEstructura(pago) {
  if (!pagosStack[pago.clienteId]) pagosStack[pago.clienteId] = new Stack();
  pagosStack[pago.clienteId].push(pago);
  if (pago.estado === "Pagado") {
    pagosQueue.remove(pago.clienteId);
  }
}

function insertarClienteBST(cliente) {
  clientesBST.insert(cliente.id, cliente);
}

function eliminarClienteBST(clienteId) {
  clientesBST.delete(clienteId);
}
