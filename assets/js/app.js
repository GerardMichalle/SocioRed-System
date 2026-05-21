let currentPage = "dashboard";
let currentClienteId = null;
let clientesPaginaActual = 1;
const ITEMS_POR_PAGINA = 8;
let stackOpsCount = 0;
//
const titleOrigina = document.title;
const TitulosAleatorios = [
  "🧑‍💻 Volviendo a programar...",
  "📡 Revisando las antenas...",
  "💰 ¡Alguien no ha pagado!",
  "👀 Te estamos vigilando...",
  "☕ Ve por un café y regresa",
];

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    const indexAleatorio = Math.floor(Math.random() * TitulosAleatorios.length);
    document.title = TitulosAleatorios[indexAleatorio];
  } else {
    document.title = titleOrigina;
  }
});

function animarInput(selector, textos) {
    const input = document.querySelector(selector);

    let i = 0;
    let j = 0;
    let escribiendo = true;

    function efecto() {
      const texto = textos[i];

      if (escribiendo) {
        input.setAttribute("placeholder", texto.substring(0, j + 1));
        j++;

        if (j === texto.length) {
          escribiendo = false;
          setTimeout(efecto, 1500);
          return;
        }

      } else {
        input.setAttribute("placeholder", texto.substring(0, j - 1));
        j--;

        if (j === 0) {
          escribiendo = true;
          i = (i + 1) % textos.length;
        }
      }

      setTimeout(efecto, escribiendo ? 80 : 40);
    }

    // detener cuando el usuario escribe
    input.addEventListener("focus", () => {
      input.setAttribute("placeholder", "");
    });

    efecto();
  }

animarInput(".adminInput", ["Ingresa tu usuario", "admin"]);

animarInput(".passInput", ["Ingresa tu contraseña", "••••••••"]);

document.addEventListener("DOMContentLoaded", () => {
  initDB();
  loadStructures();
  updateTopbarDate();
  setInterval(updateTopbarDate, 60000);
  // Verificar sesión
  if (localStorage.getItem("sr_session") === "true") {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    initApp();
  }
});

function initApp() {
  showPage("dashboard");
  updateDashboard();
  populateFiltroSector();
}

function updateTopbarDate() {
  const now = new Date();
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("topbarDate").textContent = now.toLocaleDateString(
    "es-PE",
    opts,
  );
}

function doLogin() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value;
  if (u === "admin" && p === "admin123") {
    localStorage.setItem("sr_session", "true");
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    initApp();
  } else {
    document.getElementById("loginError").classList.remove("hidden");
    setTimeout(
      () => document.getElementById("loginError").classList.add("hidden"),
      3000,
    );
  }
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    !document.getElementById("loginPage").classList.contains("hidden")
  )
    doLogin();
});

function doLogout() {
  localStorage.removeItem("sr_session");
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function showPage(name) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  const pg = document.getElementById("page-" + name);
  if (pg) pg.classList.add("active");
  const navItem = document.querySelector(`[data-page="${name}"]`);
  if (navItem) navItem.classList.add("active");
  const titles = {
    dashboard: "Dashboard",
    clientes: "Gestión de Clientes",
    pagos: "Registro de Pagos",
    planes: "Planes de Internet",
    antenas: "Antenas - Alto Trujillo",
    reportes: "Reportes",
    configuracion: "Configuración",
    detalle: "Detalle del Cliente",
  };
  document.getElementById("pageTitle").textContent = titles[name] || name;
  currentPage = name;
  // Render pages
  if (name === "dashboard") updateDashboard();
  if (name === "clientes") {
    clientesPaginaActual = 1;
    renderClientes();
  }
  if (name === "pagos") renderPagos();
  if (name === "planes") renderPlanes();
  if (name === "antenas") renderAntenas();
  if (name === "reportes") renderReportes();
  if (name === "configuracion") renderConfiguracion();
  // Salir sidebar
  document.getElementById("sidebar").classList.remove("open");
}

function updateDashboard() {
  const clientes = getClientes();
  const pagos = getPagos();
  const antenas = getAntenas();

  const activos = clientes.filter((c) => c.estado === "Al día").length;
  const deudores = clientes.filter((c) => c.estado === "Con deuda").length;
  const mesPagos = pagos.filter(
    (p) => p.estado === "Pagado" && p.mes === "Mayo 2026",
  );
  const ingresos = mesPagos.reduce((s, p) => s + p.monto, 0);

  document.getElementById("stat-activos").textContent = clientes.length;
  document.getElementById("stat-deuda").textContent = deudores;
  document.getElementById("stat-ingresos").textContent =
    "S/ " +
    ingresos.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  document.getElementById("stat-antenas").textContent = antenas.length;

  // Donut
  const total = clientes.length || 1;
  const circ = 2 * Math.PI * 45; // ~283
  const greenArc = (activos / total) * circ;
  const redArc = (deudores / total) * circ;
  const greenOffset = 0;
  const redOffset = greenArc;

  const gEl = document.getElementById("donutGreen");
  const rEl = document.getElementById("donutRed");
  gEl.setAttribute("stroke-dasharray", `${greenArc} ${circ - greenArc}`);
  gEl.setAttribute("stroke-dashoffset", `-${greenOffset}`);
  rEl.setAttribute("stroke-dasharray", `${redArc} ${circ - redArc}`);
  rEl.setAttribute("stroke-dashoffset", `-${redOffset}`);

  document.getElementById("leg-aldia").textContent =
    `${activos} (${Math.round((activos / total) * 100)}%)`;
  document.getElementById("leg-deuda").textContent =
    `${deudores} (${Math.round((deudores / total) * 100)}%)`;

  // Bar chart sectores
  const sectores = ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5"];
  const barWrap = document.getElementById("barChart");
  const maxCount = Math.max(
    ...sectores.map((s) => clientes.filter((c) => c.sector === s).length),
    1,
  );
  barWrap.innerHTML = sectores
    .map((s) => {
      const count = clientes.filter((c) => c.sector === s).length;
      const pct = (count / maxCount) * 100;
      return `<div class="bar-item">
      <div class="bar-fill" style="height:${pct}%">
        <span class="bar-num">${count}</span>
      </div>
      <div class="bar-label">${s.replace("Sector ", "S")}</div>
    </div>`;
    })
    .join("");

  // Cola pagos pendientes principal
  renderColaQueue();
}

function renderColaQueue() {
  const colaList = document.getElementById("colaList");
  const badge = document.getElementById("cola-badge");
  const queue = pagosQueue.toArray();
  badge.textContent = queue.length;
  if (!queue.length) {
    colaList.innerHTML = '<div class="empty-msg">✅ Sin pagos pendientes</div>';
    return;
  }
  colaList.innerHTML = queue
    .map(
      (item, i) => `
    <div class="queue-item">
      <div>
        <div class="q-name">${i === 0 ? "🔔 " : ""} ${item.nombre}</div>
        <div class="q-info">ID: ${item.clienteId} · ${item.mes} · S/ ${item.monto?.toFixed(2) || "--"}</div>
      </div>
      <button class="q-action" onclick="abrirRegistrarPago('${item.clienteId}')">💳 Cobrar</button>
    </div>
  `,
    )
    .join("");
}

function populateFiltroSector() {
  const sel = document.getElementById("filtroSector");
  sel.innerHTML = '<option value="">Todos los sectores</option>';
  ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5"].forEach((s) => {
    sel.innerHTML += `<option>${s}</option>`;
  });
}

function buscarCliente() {
  clientesPaginaActual = 1;
  renderClientes();
}

function renderClientes() {
  const query = (
    document.getElementById("searchCliente")?.value || ""
  ).toLowerCase();
  const estado = document.getElementById("filtroEstado")?.value || "";
  const sector = document.getElementById("filtroSector")?.value || "";
  let clientes = getClientes();

  // Búsqueda usando BST si el query es un número (ID)
  if (/^\d+$/.test(query) && query) {
    const found = clientesBST.search(query);
    clientes = found ? [found] : [];
  } else {
    if (query)
      clientes = clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(query) ||
          (c.dni || "").includes(query) ||
          (c.tel || "").includes(query),
      );
  }
  if (estado) clientes = clientes.filter((c) => c.estado === estado);
  if (sector) clientes = clientes.filter((c) => c.sector === sector);

  // Paginación
  const total = clientes.length;
  const totalPgs = Math.ceil(total / ITEMS_POR_PAGINA);
  const start = (clientesPaginaActual - 1) * ITEMS_POR_PAGINA;
  const paged = clientes.slice(start, start + ITEMS_POR_PAGINA);

  const tbody = document.getElementById("tbodyClientes");
  if (!paged.length) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-msg">No se encontraron clientes</td></tr>';
  } else {
    tbody.innerHTML = paged
      .map((c) => {
        const plan = getPlan(c.planId);
        const antena = getAntena(c.antenaId);
        const badge =
          c.estado === "Al día"
            ? '<span class="badge green">Al día</span>'
            : '<span class="badge red">Con deuda</span>';
        return `<tr>
        <td><span style="font-family:var(--font-mono);color:var(--text3)">${c.id}</span></td>
        <td><b>${c.nombre}</b></td>
        <td>${c.sector}</td>
        <td>${plan ? plan.velocidad + "Mbps · S/" + plan.precio : c.planId}</td>
        <td>${badge}</td>
        <td>${antena ? antena.nombre : c.antenaId}</td>
        <td><div class="action-btns">
          <button class="ab ab-view" onclick="verCliente('${c.id}')" title="Ver">👁</button>
          <button class="ab ab-pay"  onclick="abrirRegistrarPago('${c.id}')" title="Registrar pago">💳</button>
          <button class="ab ab-edit" onclick="editarCliente('${c.id}')" title="Editar">✏</button>
          <button class="ab ab-del"  onclick="eliminarCliente('${c.id}')" title="Eliminar">🗑</button>
        </div></td>
      </tr>`;
      })
      .join("");
  }

  document.getElementById("totalClientes").textContent =
    `Total: ${total} clientes`;
  renderPaginacion(totalPgs);
}

function renderPaginacion(total) {
  const pg = document.getElementById("paginacionClientes");
  pg.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "pg-btn" + (i === clientesPaginaActual ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => {
      clientesPaginaActual = i;
      renderClientes();
    };
    pg.appendChild(btn);
  }
}

function verCliente(id) {
  currentClienteId = id;
  const c = getCliente(id);
  if (!c) return;
  const plan = getPlan(c.planId);
  const antena = getAntena(c.antenaId);

  document.getElementById("det-nombre").textContent = c.nombre;
  document.getElementById("det-id").textContent = "ID: " + c.id;
  document.getElementById("det-tel").textContent = "📞 " + (c.tel || "—");
  const badge = document.getElementById("det-estado-badge");
  badge.textContent = c.estado;
  badge.className = "badge " + (c.estado === "Al día" ? "green" : "red");
  document.getElementById("det-dir").textContent = c.direccion || "—";
  document.getElementById("det-plan").textContent = plan
    ? plan.nombre + " · " + plan.velocidad + "Mbps · S/" + plan.precio
    : c.planId;
  document.getElementById("det-fecha").textContent = c.fechaInstalacion || "—";
  document.getElementById("det-antena").textContent = antena
    ? antena.nombre
    : c.antenaId;
  document.getElementById("det-dni").textContent = c.dni || "—";
  document.getElementById("det-sector").textContent = c.sector || "—";

  // Historial desde la pila
  const historial = getHistorialCliente(id);
  const stack = pagosStack[id];
  document.getElementById("det-pila-size").textContent =
    `Pila: ${stack?.size || 0} pagos`;
  const tbody = document.getElementById("det-pagos");
  if (!historial.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-msg">Sin historial de pagos</td></tr>';
  } else {
    tbody.innerHTML = historial
      .map((p) => {
        const est =
          p.estado === "Pagado"
            ? '<span class="badge green">Pagado</span>'
            : '<span class="badge red">Pendiente</span>';
        return `<tr>
        <td>${p.fecha || "—"}</td>
        <td>${p.mes}</td>
        <td>S/ ${p.monto?.toFixed(2) || "—"}</td>
        <td>${est}</td>
        <td>${p.metodo || "—"}</td>
      </tr>`;
      })
      .join("");
  }

  showPage("detalle");
}

function abrirModalCliente(id = null) {
  document.getElementById("modalClienteTitulo").textContent = id
    ? "Editar Cliente"
    : "Nuevo Cliente";
  document.getElementById("mc-id").value = id || "";
  if (id) {
    const c = getCliente(id);
    document.getElementById("mc-nombre").value = c.nombre;
    document.getElementById("mc-dni").value = c.dni || "";
    document.getElementById("mc-tel").value = c.tel || "";
    document.getElementById("mc-dir").value = c.direccion || "";
    document.getElementById("mc-sector").value = c.sector;
    document.getElementById("mc-fecha").value = c.fechaInstalacion || "";
    // Plan y antena se cargan abajo
  } else {
    document.getElementById("mc-nombre").value = "";
    document.getElementById("mc-dni").value = "";
    document.getElementById("mc-tel").value = "";
    document.getElementById("mc-dir").value = "";
    document.getElementById("mc-fecha").value = new Date()
      .toISOString()
      .split("T")[0];
  }
  // Poblar selects plan y antena
  const planSel = document.getElementById("mc-plan");
  planSel.innerHTML = getPlanes()
    .filter((p) => p.estado === "Activo")
    .map(
      (p) =>
        `<option value="${p.id}">${p.nombre} · ${p.velocidad}Mbps · S/${p.precio}</option>`,
    )
    .join("");
  const antSel = document.getElementById("mc-antena");
  antSel.innerHTML = getAntenas()
    .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
    .join("");
  if (id) {
    const c = getCliente(id);
    planSel.value = c.planId;
    antSel.value = c.antenaId;
  }
  document.getElementById("modalCliente").classList.remove("hidden");
}

function editarCliente(id) {
  abrirModalCliente(id);
}

function guardarCliente() {
  const id = document.getElementById("mc-id").value;
  const nombre = document.getElementById("mc-nombre").value.trim();
  const dni = document.getElementById("mc-dni").value.trim();
  if (!nombre) {
    showToast("El nombre es obligatorio", "error");
    return;
  }
  if (dni && !/^\d{8}$/.test(dni)) {
    showToast("DNI debe tener 8 dígitos", "error");
    return;
  }

  const clientes = getClientes();
  if (id) {
    // Editar
    const idx = clientes.findIndex((c) => c.id === id);
    if (idx < 0) return;
    clientes[idx].nombre = nombre;
    clientes[idx].dni = dni;
    clientes[idx].tel = document.getElementById("mc-tel").value.trim();
    clientes[idx].direccion = document.getElementById("mc-dir").value.trim();
    clientes[idx].sector = document.getElementById("mc-sector").value;
    clientes[idx].planId = document.getElementById("mc-plan").value;
    clientes[idx].antenaId = document.getElementById("mc-antena").value;
    clientes[idx].fechaInstalacion = document.getElementById("mc-fecha").value;
    clientesBST.insert(id, clientes[idx]);
    setClientes(clientes);
    showToast("Cliente actualizado ✓", "Con exito!!");
  } else {
    // Nuevo
    const newId = nextId(clientes, "");
    const nuevo = {
      id: newId,
      nombre,
      dni,
      tel: document.getElementById("mc-tel").value.trim(),
      direccion: document.getElementById("mc-dir").value.trim(),
      sector: document.getElementById("mc-sector").value,
      planId: document.getElementById("mc-plan").value,
      antenaId: document.getElementById("mc-antena").value,
      fechaInstalacion: document.getElementById("mc-fecha").value,
      estado: "Al día",
    };
    clientes.push(nuevo);
    setClientes(clientes);
    insertarClienteBST(nuevo);
    pagosStack[nuevo.id] = new Stack();
    showToast("Cliente creado ✓", "Con exito!!");
  }
  cerrarModal("modalCliente");
  loadStructures();
  renderClientes();
  updateDashboard();
}

function eliminarCliente(id) {
  if (!confirm(`¿Eliminar cliente ${id}? Se borrarán también sus pagos.`))
    return;
  let clientes = getClientes().filter((c) => c.id !== id);
  let pagos = getPagos().filter((p) => p.clienteId !== id);
  setClientes(clientes);
  setPagos(pagos);
  eliminarClienteBST(id);
  pagosQueue.remove(id);
  delete pagosStack[id];
  showToast("Cliente eliminado", "info");
  if (currentPage === "detalle") showPage("clientes");
  else renderClientes();
  updateDashboard();
}

function renderPagos() {
  const query = (
    document.getElementById("searchPago")?.value || ""
  ).toLowerCase();
  const estado = document.getElementById("filtroPagoEstado")?.value || "";
  let pagos = getPagos();
  const clientes = getClientes();
  if (query)
    pagos = pagos.filter((p) => {
      const c = clientes.find((x) => x.id === p.clienteId);
      return (
        (c?.nombre || "").toLowerCase().includes(query) ||
        p.mes.toLowerCase().includes(query)
      );
    });
  if (estado) pagos = pagos.filter((p) => p.estado === estado);
  // Más recientes primero
  pagos = [...pagos].sort((a, b) =>
    (b.fecha || "").localeCompare(a.fecha || ""),
  );

  const tbody = document.getElementById("tbodyPagos");
  tbody.innerHTML = pagos
    .map((p) => {
      const c = clientes.find((x) => x.id === p.clienteId);
      const plan = getPlan(c?.planId);
      const est =
        p.estado === "Pagado"
          ? '<span class="badge green">Pagado</span>'
          : '<span class="badge red">Pendiente</span>';
      return `<tr>
      <td><span style="font-family:var(--font-mono);color:var(--text3)">${p.id}</span></td>
      <td><b>${c?.nombre || p.clienteId}</b></td>
      <td>${plan?.nombre || "—"}</td>
      <td>${p.mes}</td>
      <td>S/ ${p.monto?.toFixed(2) || "—"}</td>
      <td>${p.fecha || "—"}</td>
      <td>${est}</td>
      <td>${p.metodo || "—"}</td>
    </tr>`;
    })
    .join("");
  document.getElementById("totalPagos").textContent =
    `Total: ${pagos.length} registros`;
}

function abrirRegistrarPago(clienteId = null) {
  // Poblar select de clientes
  const clientes = getClientes();
  const mpSel = document.getElementById("mp-cliente");
  mpSel.innerHTML = clientes
    .map((c) => `<option value="${c.id}">${c.nombre} (ID: ${c.id})</option>`)
    .join("");
  if (clienteId) mpSel.value = clienteId;
  onClientePagoChange();
  document.getElementById("mp-fecha").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("mp-obs").value = "";
  document.getElementById("modalPago").classList.remove("hidden");
}

function onClientePagoChange() {
  const cId = document.getElementById("mp-cliente").value;
  const c = getCliente(cId);
  const plan = getPlan(c?.planId);
  document.getElementById("mp-plan").value = plan
    ? `${plan.nombre} · S/${plan.precio}`
    : "—";
  document.getElementById("mp-monto").value = plan?.precio || "";
}

function guardarPago() {
  const cId = document.getElementById("mp-cliente").value;
  const monto = parseFloat(document.getElementById("mp-monto").value);
  const mes = document.getElementById("mp-mes").value;
  const fecha = document.getElementById("mp-fecha").value;
  if (!cId || !monto || monto <= 0) {
    showToast("Completa los campos requeridos", "error");
    return;
  }

  const pagos = getPagos();
  const clientes = getClientes();

  const nuevoPago = {
    id: nextId(pagos, "PAG"),
    clienteId: cId,
    mes,
    monto,
    fecha,
    estado: "Pagado",
    metodo: document.getElementById("mp-metodo").value,
    obs: document.getElementById("mp-obs").value,
  };
  pagos.push(nuevoPago);

  // Marcar pagos pendientes de ese cliente+mes como Pagado
  pagos.forEach((p) => {
    if (p.clienteId === cId && p.mes === mes && p.estado === "Pendiente") {
      p.estado = "Pagado";
      p.fecha = fecha;
      p.metodo = nuevoPago.metodo;
    }
  });

  setPagos(pagos);

  // Actualizar estado del cliente
  const idx = clientes.findIndex((c) => c.id === cId);
  if (idx >= 0) {
    const aun = pagos.filter(
      (p) => p.clienteId === cId && p.estado === "Pendiente",
    );
    clientes[idx].estado = aun.length ? "Con deuda" : "Al día";
    setClientes(clientes);
    clientesBST.insert(cId, clientes[idx]);
  }

  // Recargar estructuras desde cero (reconstruye la cola limpia)
  loadStructures();

  showToast("Pago registrado ✓", "Con exito!!");
  cerrarModal("modalPago");

  // Refrescar todo
  updateDashboard();
  if (currentPage === "pagos") renderPagos();
  if (currentPage === "detalle") verCliente(cId);
  if (currentPage === "clientes") renderClientes();
}

function renderPlanes() {
  const planes = getPlanes();
  const clientes = getClientes();
  document.getElementById("tbodyPlanes").innerHTML = planes
    .map((p) => {
      const count = clientes.filter((c) => c.planId === p.id).length;
      const est =
        p.estado === "Activo"
          ? '<span class="badge green">Activo</span>'
          : '<span class="badge red">Inactivo</span>';
      return `<tr>
      <td><span style="font-family:var(--font-mono);color:var(--text3)">${p.id}</span></td>
      <td><b>${p.nombre}</b></td>
      <td>${p.velocidad} Mbps</td>
      <td>S/ ${p.precio.toFixed(2)}</td>
      <td>${count} clientes</td>
      <td>${est}</td>
      <td><div class="action-btns">
        <button class="ab ab-edit" onclick="editarPlan('${p.id}')" title="Editar">✏</button>
        <button class="ab ab-del"  onclick="eliminarPlan('${p.id}')" title="Eliminar">🗑</button>
      </div></td>
    </tr>`;
    })
    .join("");
}

function abrirModalPlan(id = null) {
  document.getElementById("modalPlanTitulo").textContent = id
    ? "Editar Plan"
    : "Nuevo Plan";
  document.getElementById("mpl-id").value = id || "";
  if (id) {
    const p = getPlan(id);
    document.getElementById("mpl-nombre").value = p.nombre;
    document.getElementById("mpl-vel").value = p.velocidad;
    document.getElementById("mpl-precio").value = p.precio;
    document.getElementById("mpl-estado").value = p.estado;
  } else {
    document.getElementById("mpl-nombre").value = "";
    document.getElementById("mpl-vel").value = "";
    document.getElementById("mpl-precio").value = "";
    document.getElementById("mpl-estado").value = "Activo";
  }
  document.getElementById("modalPlan").classList.remove("hidden");
}
function editarPlan(id) {
  abrirModalPlan(id);
}

function guardarPlan() {
  const id = document.getElementById("mpl-id").value;
  const nombre = document.getElementById("mpl-nombre").value.trim();
  const vel = parseInt(document.getElementById("mpl-vel").value);
  const precio = parseFloat(document.getElementById("mpl-precio").value);
  if (!nombre || !vel || !precio) {
    showToast("Completa todos los campos", "error");
    return;
  }

  const planes = getPlanes();
  if (id) {
    const idx = planes.findIndex((p) => p.id === id);
    planes[idx].nombre = nombre;
    planes[idx].velocidad = vel;
    planes[idx].precio = precio;
    planes[idx].estado = document.getElementById("mpl-estado").value;
  } else {
    planes.push({
      id: nextId(planes, "P"),
      nombre,
      velocidad: vel,
      precio,
      estado: "Activo",
    });
  }
  setPlanes(planes);
  showToast("Plan guardado ✓", "success");
  cerrarModal("modalPlan");
  renderPlanes();
}

function eliminarPlan(id) {
  const clientes = getClientes().filter((c) => c.planId === id);
  if (clientes.length) {
    showToast(
      `No puedes eliminar: ${clientes.length} clientes usan este plan`,
      "error",
    );
    return;
  }
  if (!confirm("¿Eliminar este plan?")) return;
  setPlanes(getPlanes().filter((p) => p.id !== id));
  showToast("Plan eliminado", "info");
  renderPlanes();
}

function renderAntenas() {
  const antenas = getAntenas();
  const clientes = getClientes();
  document.getElementById("antenasGrid").innerHTML = antenas
    .map((a) => {
      const count = clientes.filter((c) => c.antenaId === a.id).length;
      return `<div class="antena-card">
      <div class="antena-icon">📡</div>
      <div class="antena-id">${a.id}</div>
      <div class="antena-nombre">${a.nombre}</div>
      <div class="antena-ubicacion">📍 ${a.ubicacion}</div>
      <div class="antena-clients">👥 ${count} clientes conectados</div>
      <div class="antena-actions">
        <button class="btn-secondary" onclick="editarAntena('${a.id}')">✏ Editar</button>
        <button class="btn-danger" onclick="eliminarAntena('${a.id}')">🗑</button>
      </div>
    </div>`;
    })
    .join("");
}

function abrirModalAntena(id = null) {
  document.getElementById("modalAntenaTitulo").textContent = id
    ? "Editar Antena"
    : "Nueva Antena";
  document.getElementById("ma-id").value = id || "";
  if (id) {
    const a = getAntena(id);
    document.getElementById("ma-nombre").value = a.nombre;
    document.getElementById("ma-ubicacion").value = a.ubicacion;
    document.getElementById("ma-sector").value = a.sector;
  } else {
    document.getElementById("ma-nombre").value = "";
    document.getElementById("ma-ubicacion").value = "";
  }
  document.getElementById("modalAntena").classList.remove("hidden");
}
function editarAntena(id) {
  abrirModalAntena(id);
}

function guardarAntena() {
  const id = document.getElementById("ma-id").value;
  const nombre = document.getElementById("ma-nombre").value.trim();
  const ubic = document.getElementById("ma-ubicacion").value.trim();
  const sector = document.getElementById("ma-sector").value;
  if (!nombre) {
    showToast("El nombre es obligatorio", "error");
    return;
  }

  const antenas = getAntenas();
  if (id) {
    const idx = antenas.findIndex((a) => a.id === id);
    antenas[idx].nombre = nombre;
    antenas[idx].ubicacion = ubic;
    antenas[idx].sector = sector;
  } else {
    const newId = "A" + (antenas.length + 1);
    antenas.push({ id: newId, nombre, ubicacion: ubic, sector });
  }
  setAntenas(antenas);
  showToast("Antena guardada ✓", "success");
  cerrarModal("modalAntena");
  renderAntenas();
}

function eliminarAntena(id) {
  const clientes = getClientes().filter((c) => c.antenaId === id);
  if (clientes.length) {
    showToast(
      `No puedes eliminar: ${clientes.length} clientes usan esta antena`,
      "error",
    );
    return;
  }
  if (!confirm("¿Eliminar esta antena?")) return;
  setAntenas(getAntenas().filter((a) => a.id !== id));
  showToast("Antena eliminada", "info");
  renderAntenas();
}

function renderReportes() {
  const pagos = getPagos();
  const clientes = getClientes();

  const mesPagados = pagos.filter(
    (p) => p.mes === "Mayo 2026" && p.estado === "Pagado",
  );
  const mesPendientes = pagos.filter(
    (p) => p.mes === "Mayo 2026" && p.estado === "Pendiente",
  );
  const totalMes = mesPagados.reduce((s, p) => s + p.monto, 0);
  const efectividad = clientes.length
    ? Math.round(
        (clientes.filter((c) => c.estado === "Al día").length /
          clientes.length) *
          100,
      )
    : 0;

  document.getElementById("rep-totalMes").textContent =
    `S/ ${totalMes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
  document.getElementById("rep-pagados").textContent = mesPagados.length;
  document.getElementById("rep-pendientes").textContent = mesPendientes.length;
  document.getElementById("rep-efectividad").textContent = efectividad + "%";

  // BST stats
  document.getElementById("bst-stats").innerHTML = `
    Nodos: ${clientesBST.size}<br>
    Altura del árbol: ${clientesBST.height()}<br>
    Búsqueda: O(log ${clientesBST.size || 1}) ≈ ${Math.ceil(Math.log2(clientesBST.size || 1))} comparaciones máx.
  `;

  // Chart planes
  const planes = getPlanes();
  const maxC = Math.max(
    ...planes.map((p) => clientes.filter((c) => c.planId === p.id).length),
    1,
  );
  document.getElementById("planChart").innerHTML = planes
    .map((p) => {
      const cnt = clientes.filter((c) => c.planId === p.id).length;
      return `<div class="plan-row">
      <span class="plan-row-name">${p.nombre}</span>
      <div class="plan-bar-wrap"><div class="plan-bar-fill" style="width:${(cnt / maxC) * 100}%"></div></div>
      <span class="plan-row-num">${cnt}</span>
    </div>`;
    })
    .join("");

  // Hist últimos 6 meses
  const meses = [
    "Diciembre 2025",
    "Enero 2026",
    "Febrero 2026",
    "Marzo 2026",
    "Abril 2026",
    "Mayo 2026",
  ];
  const maxM = Math.max(
    ...meses.map((m) =>
      pagos
        .filter((p) => p.mes === m && p.estado === "Pagado")
        .reduce((s, p) => s + p.monto, 0),
    ),
    1,
  );
  document.getElementById("histChart").innerHTML = meses
    .map((m) => {
      const total = pagos
        .filter((p) => p.mes === m && p.estado === "Pagado")
        .reduce((s, p) => s + p.monto, 0);
      const pct = (total / maxM) * 100;
      return `<div class="hist-item">
      <div class="hist-fill" style="height:${pct}%">
        <span class="hist-num">S/${(total / 1000).toFixed(1)}k</span>
      </div>
      <div class="hist-label">${m.split(" ")[0].substring(0, 3)}</div>
    </div>`;
    })
    .join("");
}

function renderBSTVisual() {
  const contenedorGuardado = document.getElementById("bst-visual");
  contenedorGuardado.textContent = clientesBST.toAscii();
  contenedorGuardado.removeAttribute("hidden");
}

function renderBSTVisualUnhide() {
  document.getElementById("bst-visual").setAttribute("hidden", "true");
}

function renderConfiguracion() {
  document.getElementById("bst-node-count").textContent =
    `Nodos: ${clientesBST.size}`;
  document.getElementById("queue-size").textContent =
    `Elementos: ${pagosQueue.size}`;
  // Contar ops totales de stacks
  let total = 0;
  Object.values(pagosStack).forEach((s) => {
    if (s) total += s.size;
  });
  document.getElementById("stack-ops").textContent = `Operaciones: ${total}`;
}

function guardarConfig() {
  showToast("Configuración guardada ✓", "success");
}

function cerrarModal(id) {
  document.getElementById(id).classList.add("hidden");
}
// Cerrar al hacer clic fuera
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden");
  }
});

function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), 3000);
}
