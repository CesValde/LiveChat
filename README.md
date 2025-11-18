# 📡 Chat en Vivo con Express, WebSockets y Handlebars

Este proyecto es un chat en tiempo real desarrollado con:

- Node.js + Express
- Socket.io
- Express-Handlebars
- SweetAlert2
- Frontend vanilla JS

Permite que múltiples usuarios se conecten, elijan un nombre y chateen en tiempo real, mostrando además qué usuarios están conectados o desconectados.

---

### 🚀 Características principales

✅ Chat en vivo usando **WebSockets**

✅ Manejo de usuarios conectados/desconectados

✅ Solicitud de nombre con **SweetAlert2**

✅ Lista de usuarios en línea actualizada en tiempo real

✅ Renderizado de vistas con **Handlebars**

✅ Servidor Express + carpeta `public` para contenido estático

✅ Cada pestaña/navegador cuenta como un nuevo usuario conectado

---

### 🛠️ Tecnologías utilizadas

- Node.js
- Express
- Socket.io
- Express-Handlebars
- SweetAlert2
- HTML / CSS / JS

---

### 📁 Estructura del proyecto
```pgsql
src/
  ├─ public/
  │   ├─ js/
  │   │   └─ index.js
  │   ├─ css/
  │   │   └─ chat.css
  │   └─ images/     (si se usa subir archivos)
  ├─ views/
  │   └─ chat.handlebars
  ├─ routes/
  │   └─ view.route.js
  └─ server.js (o app.js)
```
---

### ⚙️ Configuración del servidor

El servidor Express:

- Configura Handlebars como motor de plantillas.
- Expone la carpeta /public como estática.
- Maneja las vistas mediante view.route.js.
- Inicia el servidor HTTP y monta Socket.io encima.

Fragmento principal:

```js
app.engine('handlebars', handlebars.engine())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/chat', ViewRoutes)

const serverHttp = app.listen(8080)
const serverSocket = new Server(serverHttp)
```

---

### 🔌 Lógica WebSocket
📥 **Al conectar un usuario**

- El cliente envía registrar_usuario.
- El servidor guarda al usuario usando su socket.id.
- Se envía la lista completa de mensajes y el estado de usuarios.

```js
socket.on('registrar_usuario', (user) => {
   usuarios[socket.id] = { nombre: user, conectado: true }
   socket.emit('lista_de_mensaje_actualizada', listaMensajes)
   socket.emit('estado_del_usuario', usuarios)
})
```

✉️ **Mensaje enviado**

Cada mensaje contiene `{ user, mensaje }`:
```js
socket.on('mensaje', (payload) => {
   listaMensajes.push(payload)
   serverSocket.emit('lista_de_mensaje_actualizada', listaMensajes)
})
```

❌ **Desconexión**

Cuando un usuario se desconecta:
```js
socket.on('disconnect', () => {
   usuarios[socket.id].conectado = false
   serverSocket.emit('usuario_desconectado', socket.id)
})
```

---

### 🖥️ Lógica del Cliente (public/js/index.js)
**Pedir nick al usuario**

Se usa SweetAlert:
```js
Swal.fire({
    title: 'Quien sos?',
    input: 'text',
    allowOutsideClick: false
}).then(nick => {
    user = nick.value
    socket.emit('registrar_usuario', user)
})
```

**Enviar mensaje**
```js
box.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' && box.value !== ''){
        socket.emit('mensaje', { user, mensaje: box.value })
        box.value = ''
    }
})
```

**Actualizar chat en vivo**
```js
socket.on('lista_de_mensaje_actualizada', (data) => {
    app.innerHTML = ''
    data.forEach(chat => {
        const p = document.createElement('p')
        p.innerText = `${chat.user}: ${chat.mensaje}`
        app.appendChild(p)
    })
})
```

**Estado de usuarios conectados**
```js
socket.on('estado_del_usuario', (usuarios) => {
    listaUsuarios.innerHTML = '<h1> Usuarios En Linea! </h1>'
    for(const id in usuarios) {
        const u = usuarios[id]
        const p = document.createElement('p')
        p.dataset.id = id
        p.innerText = u.nombre
        p.style.color = u.conectado ? 'green' : 'red'
        listaUsuarios.appendChild(p)
    }
})
```

---

### ▶️ Cómo ejecutar el proyecto

**1. Instalar dependencias:**

```bash
npm install 
```

**2. Ejecutar el servidor:**

Con Nodemon
```bash
npx run dev
```

Solo Node.js
```bash
node server.js
```

**3. Abrir en navegador:**
```bash
http://localhost:8080/chat/socket
```

**4. Abrir varias pestañas para probar usuarios simultáneos.**