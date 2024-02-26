window.onload = () => {
    var login = true;
    var chat = false;
    var sala1 = false;
    var sala2 = false;


    recibir();
}

const socket = io();
const messages = document.getElementById('messages');
const room = 'Sala1';
const room2 = 'Sala2';


function entrarSala1() {
  socket.emit('entrarRoom', room);
  login = false;
  chat = false;
  sala1 = true;
  sala2 = false;
}
function entrarSala2() {
  socket.emit('entrarRoom', room2);
  login = false;
  chat = false;
  sala1 = false;
  sala2 = true;
}
socket.on("mensajeEnRoom", (msg) => {
  console.log(msg);
});
function enviar() {
    const input = document.getElementById('mensaje'); 
    const listaMensajes = document.getElementById('mensajes');
    socket.emit('mensaje', input.value);


    const nuevoMensaje = document.createElement('li');
    nuevoMensaje.setAttribute('class', 'destinMenssage');
    nuevoMensaje.textContent = input.value;
    listaMensajes.appendChild(nuevoMensaje);

    input.value = '';
}

function enviaremoji() {
    const inputemoji = document.getElementById('emoji');
    const listaMensajes = document.getElementById('mensajes');
    socket.emit('mensaje', inputemoji.value);

    const nuevoMensaje = document.createElement('li');
    const nuevoEmoji = document.createElement('img');
    nuevoEmoji.setAttribute('src', inputemoji.value);
    nuevoMensaje.appendChild(nuevoEmoji);
    nuevoMensaje.setAttribute('class', 'destinMenssage');
    nuevoEmoji.setAttribute('class', 'emojis');
    listaMensajes.appendChild(nuevoMensaje);

    inputemoji.value = '';
}

const emojis = document.querySelectorAll('.emojis');
emojis.forEach(emoji => {
    emoji.addEventListener('click', () => {
        const inputemoji = document.getElementById('emoji');
        inputemoji.value = emoji.src;
    });
});


const input = document.querySelector('input');
input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      enviar();
    }
});

const avatar = document.querySelectorAll('.avatar');
avatar.forEach(avatar => {
    avatar.addEventListener('click', () => {
        const inputavatar = document.getElementById('avatar-input');
        inputavatar.value = avatar.src;
        console.log(inputavatar.value);
    });
});

function recibir() {
    const listaMensajes = document.getElementById('mensajes');
    const mensajeRecibido = document.createElement('li');
    mensajeRecibido.setAttribute('class', 'remetenteMenssage');

    socket.on('mensaje', (msg) => {
      console.log(msg);
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'remetenteMenssage');

      const mensaje = document.createElement('p');

      mensaje.textContent = msg.mensaje;
      
      mensajeRecibido.appendChild(mensaje);

      const datosMensaje = document.createElement('div');
      datosMensaje.setAttribute('class', 'datos-mensaje');
      mensajeRecibido.appendChild(datosMensaje);
      

      const nick = document.createElement('p');
      nick.setAttribute('class', 'nick');
      nick.textContent = msg.nick;
      datosMensaje.appendChild(nick);


      const avatar = document.createElement('img');
      avatar.setAttribute('src', msg.avatar);
      avatar.setAttribute('class', 'emojis');
      datosMensaje.appendChild(avatar);

      const hora = document.createElement('p');
      hora.textContent = msg.hora;
      datosMensaje.appendChild(hora);

      // const archivo = document.createElement('img');
      // archivo.setAttribute('src', msg.archivo);
      // archivo.textContent = msg.archivo;
      // mensajeRecibido.appendChild(archivo);

      listaMensajes.appendChild(mensajeRecibido);
    });
}

function enviarNick() {
    const input = document.getElementById('nick');
    console.log(input.value);
    socket.emit('nick', input.value);
    console.log("Nick asignado: "+ input.value);
    input.value = '';
}

function enviarAvatar() {
    const input = document.getElementById('avatar-input');
    console.log(input.value);
    socket.emit('avatar', input.value);
    console.log("Avatar asignado: "+ input.value);
    input.value = '';
}

// const uploadButton = document.getElementById('uploadButton');
//   const fileInput = document.getElementById('fileInput');
//   const endpoint = 'http://localhost:3000/upload';
//   uploadButton.addEventListener('click', () => {
//     const file = fileInput.files[0];
//     const formData = new FormData();
//     formData.append('fichero', file);
//     fetch(endpoint, {
//       method: 'POST',
//       body: formData
//     })
//     .then(data => {
//       console.log(file.name);
//       alert('File uploaded successfully!');
//       socket.emit('archivoCompartido', file.name);
//     })
//     .catch(error => {
//       console.error(error);
//       alert('Error uploading file');
//     });
//   });

function compartirArchivo() {
    const input = document.getElementById('fichero');
    console.log(input.value);
    socket.emit('archivoCompartido', input.value);
    console.log("Archivo compartido: "+ input.value);
    input.value = '';
}

function recibirArchivo(){
  listaMensajes = document.getElementById('mensajes');
  const img = document.createElement('img');
  img.setAttribute('src', 'uploads/' + msg);
  img.setAttribute('class', 'emojis');
  listaMensajes.appendChild(img);

}

socket.on('usuarios', (usuarios) => {
  console.log(usuarios);
  const listaUsuarios = document.getElementById('lista-usuarios');
  listaUsuarios.innerHTML = '';

  usuarios.forEach((usuario) => {
    // Crear los elementos
    let boxContato = document.createElement('div');
    let img = document.createElement('img');
    let ifoUsuario = document.createElement('div');
    let nomeUsuario = document.createElement('p');
    let previewMenssage = document.createElement('p');
    let infoMenssage = document.createElement('div');
    let horario = document.createElement('p');
    let menssagePendente = document.createElement('p');

    // Añadir las clases a los elementos
    boxContato.classList.add('boxContato');
    img.classList.add('fotoUsuario');
    ifoUsuario.classList.add('ifoUsuario');
    nomeUsuario.classList.add('nomeUsuario');
    previewMenssage.classList.add('previewMenssage');
    infoMenssage.classList.add('infoMenssage');
    horario.classList.add('horario');
    menssagePendente.classList.add('menssagePendente');

    // Añadir los atributos a los elementos
    img.setAttribute('src', './img/avatar3.png');
    img.setAttribute('alt', 'Imagem do avatar 2');
    ifoUsuario.setAttribute('onclick', 'entrarSala2()');

    // Añadir el texto a los elementos
    nomeUsuario.textContent = usuario;
    previewMenssage.textContent = '-';
    horario.textContent = '20:44';
    menssagePendente.textContent = '3';

    // Añadir los elementos al DOM
    ifoUsuario.appendChild(nomeUsuario);
    ifoUsuario.appendChild(previewMenssage);
    infoMenssage.appendChild(horario);
    infoMenssage.appendChild(menssagePendente);
    boxContato.appendChild(img);
    boxContato.appendChild(ifoUsuario);
    boxContato.appendChild(infoMenssage);

    // Añadir el elemento principal a la lista de usuarios
    listaUsuarios.appendChild(boxContato);
  });
});