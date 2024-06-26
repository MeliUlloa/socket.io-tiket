// Importamos el módulo express
const express = require('express');

// Creamos una instancia de express
const app = express();

// Creamos un servidor HTTP usando la instancia de express
const server = require('http').Server(app);

// Importamos y configuramos socket.io para usar el servidor HTTP
const io = require('socket.io')(server);

// Usamos middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));
// Contador de tiempo d espera
function iniciarContador() {
    let minutos = 0;
    let segundos = 0;

    const intervalo = setInterval(() => {
        segundos++; // Incrementamos los segundos
        if (segundos === 60) {
            // Si llegamos a 60 segundos, reiniciamos los segundos y aumentamos los minutos
            segundos = 0;
            minutos++;
        }

        console.log(`Tiempo transcurrido: ${minutos} minutos ${segundos} segundos`);

        // Enviamos el tiempo a los objetos del arreglo 'messages'
        messages.forEach((mensaje) => {
            mensaje.tiempo = `Tiempo de espera: ${minutos}m : ${segundos}s`;
        });
    }, 1000); // Intervalo de 1 segundo (1000 milisegundos)

    setTimeout(() => {
        clearInterval(intervalo);
        console.log("Contador detenido después de 10 minutos.");
    }, 10 * 60000);
}
// Ejecutamos la función para iniciar el contador
iniciarContador();

// Arreglo de mensajes iniciales con datos ficticios
let messages = [
    { nombre: "Lucas", apellido: "Azoca", turno: "", tiempo: "" },
    { nombre: "Maia", apellido: "Aedo", turno: "", tiempo: "" },
    { nombre: "Angie", apellido: "Diaz", turno: "", tiempo: "" }
];

// Función para generar un turno aleatorio
function generarTurnoAleatorio() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    const letraAleatoria = letras[Math.floor(Math.random() * letras.length)];
    const numeroAleatorio = numeros[Math.floor(Math.random() * numeros.length)];
    return letraAleatoria + numeroAleatorio;
}

// Variable para seguir el índice del turno actual
let turnoSelect = messages[0];

// Iniciar el servidor de WebSocket
io.on('connection', function (socket) {
    console.log('¡Un cliente se ha conectado con éxito!');

    // Enviar los mensajes actuales al cliente que se conecta
    socket.emit('messages', messages);

    // Enviar el turno actual al cliente que se conecta
    socket.emit('turno_actual', turnoSelect);

    // Evento para manejar la solicitud de llamar al siguiente paciente
    socket.on('llamar-siguiente', function () {
        // Verificar si hay pacientes en la cola
        if (indiceSiguienteTurno < messages.length) {
            // Llamar al siguiente paciente en la cola
            turnoSelect = messages[indiceSiguienteTurno];
            indiceSiguienteTurno++;

            // Emitir el turno actualizado a todos los clientes conectados
            io.sockets.emit('turno_actual', turnoSelect);
            io.sockets.emit('messages', messages); // Actualizar mensajes en todos los clientes
        } else {
            console.log('No hay más pacientes en la cola.');
        }
    });
    
    // Evento para manejar nuevos mensajes del formulario
    socket.on('new-message', function (data) {
        // Pusheamos el nuevo mensaje ingresado por el usuario
        messages.push(data);

        // Le asignamos un número de turno random al nuevo usuario
        messages.forEach((mensaje) => {
            mensaje.turno = generarTurnoAleatorio();
        });

        /* Usando socket.emit creamos comunicación '1:1', pero la sala de chat es privada
        por lo que se debe notificar a todos los clientes conectados usando io.sockets.emit*/
        io.sockets.emit('messages', messages);
    })
})

// Servidor corriendo en puerto: 8080
server.listen(8080, () => {
    console.log('Servidor corriendo en: http://localhost:8080');
})

