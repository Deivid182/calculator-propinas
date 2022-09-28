let cliente = {
  mesa: '',
  hora: '',
  pedido: []
}

let categorias = {
  1: 'Comida',
  2: 'Bebidas',
  3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente')
btnGuardarCliente.addEventListener('click', guardarCliente)

function guardarCliente() {
  const mesa = document.querySelector('#mesa').value
  const hora = document.querySelector('#hora').value

  const camposVacios = [mesa, hora].some( campo => campo === '' )

  //validar form
  if(camposVacios) {

    let existe = document.querySelector('.invalid-feedback')
    if(!existe) {
      const alerta = document.createElement('div')
      alerta.classList.add('invalid-feedback', 'd-block', 'text-center')
      alerta.textContent = 'Todos los campos son obligatorios'
      document.querySelector('.modal-body form').appendChild(alerta)

      setTimeout(() => {
        alerta.remove()
      }, 2000);
    }
    return
  } 
  //asignar datos del formulario al cliente
  cliente = {...cliente, mesa, hora}
  // console.log(cliente);

  //closing modal
  const modalForm = document.querySelector('#formulario')
  const modalBootstrap = bootstrap.Modal.getInstance(modalForm)
  modalBootstrap.hide()
  
  mostrarSecciones()
  obtenerPlatillos()
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll('.d-none')
  seccionesOcultas.forEach( seccion => {
    seccion.classList.remove('d-none')
  } )
}

function obtenerPlatillos() {

  const url = 'https://my-json-server.typicode.com/Deivid182/api-platillos/platillos'

  fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultado => mostrarPlatilos(resultado))
      .catch(error => console.log(error))
}

function mostrarPlatilos(platillos) {
  // console.log(platillos);

  const contenido = document.querySelector('#platillos .contenido')
  platillos.forEach( platillo => {
    const row = document.createElement('div')
    row.classList.add('row', 'py-3', 'border-top')

    const nombre = document.createElement('div')
    nombre.classList.add('col-md-4')
    nombre.textContent = platillo.nombre

    const precio = document.createElement('div')
    precio.classList.add('col-md-3', 'fw-bold')
    precio.textContent = `$${platillo.precio}`

    const categoria = document.createElement('div')
    categoria.classList.add('col-md-3')
    categoria.textContent = categorias[platillo.categoria]

    const inputCantidad = document.createElement('input')
    inputCantidad.type = 'number'
    inputCantidad.min = 0
    inputCantidad.value = 0
    inputCantidad.id = `producto-${platillo.id}`
    inputCantidad.classList.add('form-control')

    inputCantidad.onchange = function() {
      const cantidad = parseInt(inputCantidad.value)
      //une los parametros en un solo objeto
      agregarPlatillo({...platillo, cantidad})
    }

    const agregar = document.createElement('div')
    agregar.classList.add('col-md-2')
    agregar.appendChild(inputCantidad)

    // console.log(inputCantidad);

    row.appendChild(nombre)
    row.appendChild(precio)
    row.appendChild(categoria)
    row.appendChild(agregar)

    contenido.appendChild(row)
  })
}

function agregarPlatillo(producto) {
  let {pedido} = cliente

  if (producto.cantidad > 0) {
    if(pedido.some( articulo => articulo.id === producto.id )) {
      //si encuentra un pedido con id repetido, regresamos un nuevo arreglo
      const pedidoActualizado = pedido.map( articulo => {
        if(articulo.id === producto.id) {
          //reescribir la cantidad
          articulo.cantidad = producto.cantidad
        }
        return articulo
      })
      //modificar el pedido
      cliente.pedido = [...pedidoActualizado]

    } else {
      cliente.pedido = [...pedido, producto]
    }
  } else {
    const resultado = pedido.filter( articulo => articulo.id !== producto.id )
    console.log(resultado);
    cliente.pedido = [...resultado]
  }

  //limpiar html previo

  limpiarHTML()

  if(cliente.pedido.length) {
    actualizarResumen()
  } else {
    mensajePedidoVacio()
  }

}

function actualizarResumen() {
  const contenido = document.querySelector('#resumen .contenido')

  const resumen = document.createElement('div')
  resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow')
  //info mesa
  const mesa = document.createElement('p')
  mesa.textContent = 'Mesa: '
  mesa.classList.add('fw-bold')

  const mesaSpan = document.createElement('span')
  mesaSpan.textContent = cliente.mesa
  mesaSpan.classList.add('fw-normal')

  //info hora

  const hora = document.createElement('p')
  hora.textContent = 'Hora: '
  hora.classList.add('fw-bold')

  const horaSpan = document.createElement('span')
  horaSpan.textContent = cliente.hora
  horaSpan.classList.add('fw-normal')

  mesa.appendChild(mesaSpan)
  hora.appendChild(horaSpan)

  //titulo de la seccion

  const heading = document.createElement('h3')
  heading.textContent = 'Platillos consumidos'
  heading.classList.add('my-4', 'text-center')
  //iterando sobre el array

  const grupo = document.createElement('ul')
  grupo.classList.add('list-group')

  const {pedido} = cliente
  pedido.forEach(articulo => {
    const { nombre, cantidad, precio, id } = articulo

    const lista = document.createElement('li')
    lista.classList.add('list-group-item')

    const nombreEl = document.createElement('h4')
    nombreEl.classList.add('my-4')
    nombreEl.textContent = nombre

    //cantidad de articulo
    const cantidadEl = document.createElement('p')
    cantidadEl.classList.add('fw-bold')
    cantidadEl.textContent = 'Cantidad: '

    const cantidadValor = document.createElement('span')
    cantidadValor.classList.add('fw-normal')
    cantidadValor.textContent = cantidad

    //precio del articulo
    const precioEl = document.createElement('p')
    precioEl.classList.add('fw-bold')
    precioEl.textContent = 'Precio: '

    const precioValor = document.createElement('span')
    precioValor.classList.add('fw-normal')
    precioValor.textContent = `$ ${precio}`


    //subtotal del articulo
    const subtotalEl = document.createElement('p')
    subtotalEl.classList.add('fw-bold')
    subtotalEl.textContent = 'SUbtotal: '

    const subtotalValor = document.createElement('span')
    subtotalValor.classList.add('fw-normal')
    subtotalValor.textContent = calcularSubtotal(precio, cantidad)

    //boton para eliminar
    const btnEliminar = document.createElement('button')
    btnEliminar.classList.add('btn', 'btn-danger')
    btnEliminar.textContent = 'Eliminar del pedido'
    btnEliminar.onclick = function() {
      eliminarProducto(id)
    }
    //agregar valores a sus contenedores
    cantidadEl.appendChild(cantidadValor)
    precioEl.appendChild(precioValor)
    subtotalEl.appendChild(subtotalValor)
    //agregando al li
    lista.appendChild(nombreEl)
    lista.appendChild(cantidadEl)
    lista.appendChild(precioEl)
    lista.appendChild(subtotalEl)
    lista.appendChild(btnEliminar)
    //agregando lista al grupo principal
    grupo.appendChild(lista)
  })

  resumen.appendChild(heading)
  resumen.appendChild(mesa)
  resumen.appendChild(hora)
  resumen.appendChild(grupo)

  contenido.appendChild(resumen)

  formularioPropinas()
  
}

function limpiarHTML() {
  const contenido = document.querySelector('#resumen .contenido')

  while(contenido.firstChild) {
    contenido.removeChild(contenido.firstChild)
  }
}

function calcularSubtotal(precio, cantidad) {
  return `$ ${precio * cantidad}`
}

function eliminarProducto(id) {

  const { pedido } = cliente

  const resultado = pedido.filter( articulo => articulo.id !== id )
  cliente.pedido = [...resultado]

    // console.log(cliente.pedido);

    limpiarHTML()

    
    const productoEliminado = `#producto-${id}`
    const inputELiminado = document.querySelector(productoEliminado)
    inputELiminado.value = 0

    if(cliente.pedido.length) {
      actualizarResumen()
    }  else {
      mensajePedidoVacio()
    }
  }
  
function mensajePedidoVacio() {
  const contenido = document.querySelector('#resumen .contenido')
  
  const texto = document.createElement('p')
  texto.classList.add('text-center')
  texto.textContent = 'Añade los elementos del pedido'

  contenido.appendChild(texto)
}

function formularioPropinas() {
  const contenido =  document.querySelector('#resumen .contenido')
  const formulario = document.createElement('div') 

  formulario.classList.add('col-md-6', 'formulario')
 
  const divFormulario = document.createElement('div')
  divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')
  
  const heading = document.createElement('h3')
  heading.classList.add('my-4', 'text-center')
  heading.textContent = 'Propina'

  //Radio button
  const radio10 = document.createElement('input')
  radio10.type = 'radio'
  radio10.name = 'propina'
  radio10.value = '10'
  radio10.classList.add('form-check-input')
  radio10.onclick = calcularPropina

  const radio10Label = document.createElement('label')
  radio10Label.textContent = '10%'
  radio10Label.classList.add('form-check-label')

  const radio10Div = document.createElement('div')
  radio10Div.classList.add('form-check')

  radio10Div.appendChild(radio10)
  radio10Div.appendChild(radio10Label)

  //Radio button 25%
  const radio25 = document.createElement('input')
  radio25.type = 'radio'
  radio25.name = 'propina'
  radio25.value = '25'
  radio25.classList.add('form-check-input')
  radio25.onclick = calcularPropina

  const radio25Label = document.createElement('label')
  radio25Label.textContent = '25%'
  radio25Label.classList.add('form-check-label')

  const radio25Div = document.createElement('div')
  radio25Div.classList.add('form-check')

  radio25Div.appendChild(radio25)
  radio25Div.appendChild(radio25Label)

  //Radio button 25%
  const radio50 = document.createElement('input')
  radio50.type = 'radio'
  radio50.name = 'propina'
  radio50.value = '50'
  radio50.classList.add('form-check-input')
  radio50.onclick = calcularPropina

  const radio50Label = document.createElement('label')
  radio50Label.textContent = '50%'
  radio50Label.classList.add('form-check-label')

  const radio50Div = document.createElement('div')
  radio50Div.classList.add('form-check')

  radio50Div.appendChild(radio50)
  radio50Div.appendChild(radio50Label)

  divFormulario.appendChild(heading)
  divFormulario.appendChild(radio10Div)
  divFormulario.appendChild(radio25Div)
  divFormulario.appendChild(radio50Div)

  formulario.appendChild(divFormulario)

  contenido.appendChild(formulario)
}

function calcularPropina() {
  const { pedido } = cliente
  let subtotal = 0
  console.log(pedido);
  //calcular subtotal a pagar
  pedido.forEach( articulo => {
    subtotal += articulo.cantidad * articulo.precio
  } )

  //Seleccionar el radio que fue presionado
  const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value

  //calcular propina
  const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100)
  console.log(propina);

  //calcular total a pagar
  const total = subtotal + propina
  console.log(total);

  mostraTotalHTML( subtotal, total, propina )
}

function mostraTotalHTML(subtotal, total, propina) {

  const divTotales = document.createElement('div')
  divTotales.classList.add('total-pagar', 'my-5')

  //subtotal 
  const subtotalParrafo = document.createElement('p')
  subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2')
  subtotalParrafo.textContent = 'Subtotal consumo: '

  const subtotalSpan = document.createElement('span')
  subtotalSpan.classList.add('fw-normal')
  subtotalSpan.textContent = `$${subtotal}`

  subtotalParrafo.appendChild(subtotalSpan)

  //Propina 
  const propinaParrafo = document.createElement('p')
  propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-2')
  propinaParrafo.textContent = 'Propina: '

  const propinaSpan = document.createElement('span')
  propinaSpan.classList.add('fw-normal')
  propinaSpan.textContent = `$${propina}`

  propinaParrafo.appendChild(propinaSpan)


  //Total
  const totalParrafo = document.createElement('p')
  totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2')
  totalParrafo.textContent = 'Total a pagar: '

  const totalSpan = document.createElement('span')
  totalSpan.classList.add('fw-normal')
  totalSpan.textContent = `$${total}`

  totalParrafo.appendChild(totalSpan)

  //eliminar el ultimo resultado
  const totalPagarDiv = document.querySelector('.total-pagar')
  if(totalPagarDiv) {
    totalPagarDiv.remove()
  }

  divTotales.appendChild(subtotalParrafo)
  divTotales.appendChild(propinaParrafo)
  divTotales.appendChild(totalParrafo)

  const formulario = document.querySelector('.formulario > div')
  formulario.appendChild(divTotales)
}
