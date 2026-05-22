# SocioRed

Sistema web de gestion para un servicio de internet local en Alto Trujillo. Permite administrar clientes, pagos, planes, antenas y reportes desde una interfaz tipo dashboard.

## Caracteristicas

- Inicio de sesion de administrador.
- Dashboard con resumen de clientes, deudas, ingresos y antenas.
- Gestion de clientes con busqueda, filtros, paginacion, detalle, edicion y eliminacion.
- Registro y listado de pagos.
- Cola de pagos pendientes con prioridad alta, media y baja.
- Gestion de planes de internet.
- Gestion de antenas y sectores.
- Reportes con estadisticas, graficos e informacion del arbol BST.
- Configuracion con resumen de estructuras de datos usadas.

## Credenciales de prueba

```txt
Usuario: admin
Clave: admin123
```

## Tecnologias usadas

- HTML
- CSS
- JavaScript
- LocalStorage como almacenamiento principal en el navegador
- Ionicons para iconos
- Archivo CSV y PHP incluidos como recursos complementarios

## Estructuras de datos implementadas

El proyecto incluye estructuras de datos hechas manualmente en `assets/js/structures.js`:

### Stack

Usado para el historial de pagos de cada cliente. Funciona con logica LIFO: el ultimo pago registrado queda primero en el historial.

### Queue

Usada como cola base para pagos pendientes. Funciona con logica FIFO: el primer cliente pendiente entra primero en la cola.

### PriorityQueue

Usada en el Dashboard para mostrar la cola de pagos pendientes por urgencia. Esta implementada con un heap y clasifica pagos en:

- Prioridad alta: rojo
- Prioridad media: naranja
- Prioridad baja: amarillo

### BST

Arbol binario de busqueda usado para buscar clientes por ID de manera mas eficiente.

## Estructura del proyecto

```txt
SocioRed-System/
  index.html
  assets/
    css/
      style.css
    js/
      app.js
      data.js
      structures.js
    icons/
      icon-page-window.png
    img/
      icon-window.png
  conexion/
    conect.php
  database/
    basedata.csv
```

## Como ejecutar

1. Clonar o descargar el repositorio.
2. Abrir el archivo `SocioRed-System/index.html` en el navegador.
3. Iniciar sesion con las credenciales de prueba.

No se necesita instalar dependencias para usar la version actual, porque los datos se guardan en `localStorage`.

## Pantallas principales

- Dashboard
- Clientes
- Detalle de cliente
- Pagos
- Planes
- Antenas
- Reportes
- Configuracion

## Funcionamiento de la cola de prioridad

La cola de pagos pendientes del Dashboard no solo lista deudores, sino que los ordena por urgencia. La prioridad se calcula usando el atraso del mes y el monto del pago.

Esto permite identificar rapidamente que clientes deben atenderse primero.

## Notas

- Los datos iniciales se cargan desde `assets/js/data.js`.
- La informacion se guarda en el navegador mediante `localStorage`.
- Para reiniciar la informacion, se puede limpiar el almacenamiento local del navegador.
