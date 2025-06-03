const API_URL = 'http://localhost:3000/api/productos';

// Cargar y mostrar productos aplicando filtros
async function cargarProductos() {
  const res = await fetch(API_URL);
  const productos = await res.json();

  const filtroNombre = document.getElementById('buscador').value.toLowerCase();
  const filtroCategoria = document.getElementById('buscador-categoria').value.toLowerCase();
  const soloStockBajo = document.getElementById('filtro-stock-bajo').checked;

  const tabla = document.getElementById('tabla-productos');
  tabla.innerHTML = '';

  productos
    .filter(p => {
      const stock = Number(p.stock);
      const stockMinimo = Number(p.stock_minimo);
      const nombre = p.nombre.toLowerCase();
      const categoria = p.categoria.toLowerCase();

      return (
        nombre.includes(filtroNombre) &&
        categoria.includes(filtroCategoria) &&
        (!soloStockBajo || stock < stockMinimo)
      );
    })
    .forEach(p => {
      const row = document.createElement('tr');

      const stock = Number(p.stock);
      const stockMinimo = Number(p.stock_minimo);

      let estado = '';
      if (stock < stockMinimo) {
        row.classList.add('stock-bajo');
        estado = '🛑 ¡REPOSICIÓN!';
      } else {
        estado = '✅ OK';
      }

      row.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>${p.stock}</td>
        <td>${p.precio} €</td>
        <td>${estado}</td>
        <td>
          <button onclick="editarProducto(${p.id}, ${p.stock}, ${p.precio})">Editar</button>
          <button onclick="eliminarProducto(${p.id})">Eliminar</button>
        </td>
      `;

      tabla.appendChild(row);
    });
}

// Añadir nuevo producto
document.getElementById('form-producto').addEventListener('submit', async e => {
  e.preventDefault();
  const producto = {
    nombre: nombre.value,
    categoria: categoria.value,
    stock: parseInt(stock.value),
    stock_minimo: parseInt(stock_minimo.value),
    precio: parseFloat(precio.value)
  };
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });
  e.target.reset();
  cargarProductos();
});

// Eliminar producto
async function eliminarProducto(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  cargarProductos();
}

// Mostrar el modal de edición
function editarProducto(id, stock, precio) {
  document.getElementById('editar-id').value = id;
  document.getElementById('editar-stock').value = stock;
  document.getElementById('editar-precio').value = precio;
  document.getElementById('modal-editar').style.display = 'block';
}

// Ocultar el modal
function cerrarModal() {
  document.getElementById('modal-editar').style.display = 'none';
}

// Guardar cambios al producto
document.getElementById('form-editar').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('editar-id').value;
  const stock = document.getElementById('editar-stock').value;
  const precio = document.getElementById('editar-precio').value;

  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock, precio })
  });

  cerrarModal();
  cargarProductos();
});

// Filtros activos en tiempo real
document.getElementById('buscador').addEventListener('input', cargarProductos);
document.getElementById('buscador-categoria').addEventListener('input', cargarProductos);
document.getElementById('filtro-stock-bajo').addEventListener('change', cargarProductos);

// Cargar tabla al inicio
cargarProductos();