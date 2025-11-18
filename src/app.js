import express from 'express'
import ViewRoutes from './routes/view.route.js'
import path from 'path'
import { fileURLToPath } from 'url'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'handlebars')

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// se renderiza desde view.routes -> renderiza el chat
app.use('/chat', ViewRoutes)

const serverHttp = app.listen(8080, () => {
   console.log("Chat listo para usar!")
})

const serverSocket = new Server(serverHttp)
const listaMensajes = [];
const usuarios = {}

// cada socket es un nueva pestaña que ingresa al endpoint
serverSocket.on('connection', (socket) => {
   // recibimos el nombre del usuario al conectarse
   socket.on('registrar_usuario', (user) => {
      usuarios[socket.id] = { nombre: user, conectado: true }
      console.log(`${user} se conectó con id ${socket.id}`)

      // emitimos la lista de mensajes actualizada al socket que ingresa
      socket.emit('lista_de_mensaje_actualizada',listaMensajes)

      // actualiza en todas las ventanas
      socket.emit('estado_del_usuario', usuarios)
   })

   socket.on('mensaje', (payload) => {    // payload -> {user, mensaje}
      listaMensajes.push(payload)
      serverSocket.emit('lista_de_mensaje_actualizada', listaMensajes)

      // lista de usuarios
      serverSocket.emit('estado_del_usuario', usuarios)
   })

   // detecta cuando el socket se desconecta, reason lo maneja io por si solo (no le doy valor)
   socket.on('disconnect', (reason) => {
      console.log(`${socket.id} se desconecto ${reason}`)
      
      usuarios[socket.id].conectado = false
      // emitimos que id que se desconecto
      serverSocket.emit('usuario_desconectado', socket.id)
   })
})