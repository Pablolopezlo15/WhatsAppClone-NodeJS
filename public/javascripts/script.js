let auth;
let user;
let salaActual = '';
let login = document.getElementById('login');
let chat = document.getElementById('chat');
let chatArea = document.getElementById('chatArea');
let sala1 = document.getElementById('sala1');
let sala2 = document.getElementById('sala2');
let salaPrivada = document.getElementById('salaPrivada');

window.onload = () => {

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    auth = firebase.auth();
    user = auth.currentUser;

    auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        console.log('Usuario inició sesión: ', currentUser);
        configurarUsuario(user);
        user = currentUser;
      } else {
        console.log('No hay ningún usuario con la sesión iniciada');
        login.style.display = 'block';
        chat.style.display = 'none';
        sala1.style.display = 'none';
        sala2.style.display = 'none';
        salaPrivada.style.display = 'none';
        user = null;
      }
    });

    recibir();
}

window.addEventListener('beforeunload', (event) => {
  auth.signOut().then(() => {
    login.style.display = 'block';
    chat.style.display = 'none';
    sala1.style.display = 'none';
    sala2.style.display = 'none';
    salaPrivada.style.display = 'none';
  });
});


const socket = io();
const mensajes = document.getElementById('mensajes');
const room = 'sala1';
const room2 = 'sala2';

function entrarGeneral() {
  salaActual = 'general';
  login.style.display = 'none';
  chat.style.display = 'block';
  chatArea.style.display = 'block';
  sala1.style.display = 'none';
  sala2.style.display = 'none';
  salaPrivada.style.display = 'none';
}

function entrarsala1() {
  salaActual = 'sala1';
  socket.emit('entrarRoom', room);
  login.style.display = 'none';
  chat.style.display = 'block';
  chatArea.style.display = 'none';
  sala1.style.display = 'block';
  sala2.style.display = 'none';
  salaPrivada.style.display = 'none';
}
function entrarsala2() {
  salaActual = 'sala2';
  socket.emit('entrarRoom', room2);
  login.style.display = 'none';
  chat.style.display = 'block';
  chatArea.style.display = 'none';
  sala1.style.display = 'none';
  sala2.style.display = 'block';
  salaPrivada.style.display = 'none';
}

function enviar() {
    const input = document.getElementById('mensaje'); 
    console.log(input.value);

    if (input.value === '') {
      return;
    }
    const listaMensajes = document.getElementById('mensajes');
    socket.emit('mensaje', input.value);

    const nuevoMensaje = document.createElement('li');
    nuevoMensaje.setAttribute('class', 'destinMenssage');
    nuevoMensaje.textContent = input.value;
    listaMensajes.appendChild(nuevoMensaje);

    let mensajesbox = document.querySelector('.mensajesbox');
    mensajesbox.scrollTop = mensajesbox.scrollHeight;

    input.value = '';
}

function enviarRoom() {
  console.log(salaActual);
  const listaMensajes = document.getElementById('mensajes-'+salaActual);
  const input = document.getElementById('mensaje'+salaActual);
  socket.emit('mensajeEnRoom', { mensaje: input.value, room: salaActual });

  const nuevoMensaje = document.createElement('li');
  nuevoMensaje.setAttribute('class', 'destinMenssage');
  nuevoMensaje.textContent = input.value;
  listaMensajes.appendChild(nuevoMensaje);

  let mensajesbox = document.getElementById('mensajes-'+salaActual);
  mensajesbox.scrollTop = mensajesbox.scrollHeight;

  input.value = '';
}

function entrarSalaPrivada(usuario) {
  login.style.display = 'none';
  chat.style.display = 'block';
  chatArea.style.display = 'none';
  sala1.style.display = 'none';
  sala2.style.display = 'none';
  salaPrivada.style.display = 'block';

  nombreusuario = document.getElementById('nombreusuario');
  nombreusuario.textContent = usuario.nick;

  avatarusuario = document.getElementById('avatarusuario');
  avatarusuario.setAttribute('src', usuario.avatar);

  let chatMensajes = document.getElementById('chatMensajes');
  let mensajesUsuarioID = 'mensajes-' + usuario.id;
  let mensajesUsuarioExistente = document.getElementById(mensajesUsuarioID);
  if (mensajesUsuarioExistente) {
    mensajesUsuarioExistente.remove();
  }

  let usuarioIDContainer = document.createElement('ul');
  usuarioIDContainer.setAttribute('class', 'chatPrivados mensajesbox');
  usuarioIDContainer.setAttribute('id', mensajesUsuarioID);

  const enviarmensajeprivado = document.getElementById('enviarmensajeprivado');
  enviarmensajeprivado.setAttribute('onclick', `enviarPrivado('${usuario.id}')`);

  chatMensajes.appendChild(usuarioIDContainer);

  socket.emit('entrarRoom', usuario.id);
}

function enviarPrivado(usuarioID) {
  const listaMensajes = document.getElementById('mensajes-'+usuarioID);
  const input = document.getElementById('mensajePrivado');
  // socket.emit('mensajePrivado', { mensaje: input.value, room: usuarioID });
  socket.emit('mensajePrivado', { mensaje: input.value, receptorID: usuarioID });
  const nuevoMensaje = document.createElement('li');
  nuevoMensaje.setAttribute('class', 'destinMenssage');
  nuevoMensaje.textContent = input.value;
  listaMensajes.appendChild(nuevoMensaje);

  let mensajesbox = document.getElementById('mensajes-'+usuarioID);
  mensajesbox.scrollTop = mensajesbox.scrollHeight;

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


const input = document.getElementById('mensaje');
input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      enviar();
    }
});


let escribiendoTimeout;

input.addEventListener('input', () => {
  clearTimeout(escribiendoTimeout);
  escribiendo();
  escribiendoTimeout = setTimeout(() => {
    socket.emit('escribiendo', null);
  }, 2000);
});

socket.on('escribiendo', (nick) => {
  console.log(nick + ' está escribiendo');
  let escribiendo = document.getElementById('escribiendo');
  if (nick) {
    escribiendo.textContent = nick + ' está escribiendo...';
  } else {
    escribiendo.textContent = '';
  }
});

function escribiendo() {
  socket.emit('escribiendo', auth.currentUser.displayName);
}
function dejoDeEscribir() {
  socket.emit('dejoDeEscribir', auth.currentUser.displayName);
}

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
      
      const avatar = document.createElement('img');
      avatar.setAttribute('src', msg.avatar);
      avatar.setAttribute('class', 'fotoUsuarioMensaje');
      datosMensaje.appendChild(avatar);


      const nick = document.createElement('p');
      nick.setAttribute('class', 'nick');
      nick.textContent = msg.nick;
      datosMensaje.appendChild(nick);

      const hora = document.createElement('p');
      hora.textContent = msg.hora;
      datosMensaje.appendChild(hora);

      // const archivo = document.createElement('img');
      // archivo.setAttribute('src', msg.archivo);
      // archivo.textContent = msg.archivo;
      // mensajeRecibido.appendChild(archivo);

      listaMensajes.appendChild(mensajeRecibido);

      let mensajesbox = document.querySelector('.mensajesbox');
      mensajesbox.scrollTop = mensajesbox.scrollHeight;
    });

    socket.on('mensajeEnRoom', (msg) => {
      console.log(msg);
      let sala = msg.room;
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'remetenteMenssage');
      // Crear elementos HTML para mostrar el mensaje
    
      const contenidoMensaje = document.createElement('div');
      contenidoMensaje.classList.add('contenido-mensaje');
    
      const nick = document.createElement('p');
      nick.textContent = msg.nick;
      nick.classList.add('nick');
    
      const mensaje = document.createElement('p');
      mensaje.textContent = msg.mensaje;
    
      const hora = document.createElement('p');
      hora.textContent = msg.hora;
    
      // Agregar elementos al mensaje recibido
      contenidoMensaje.appendChild(nick);
      contenidoMensaje.appendChild(mensaje);
      contenidoMensaje.appendChild(hora);
      mensajeRecibido.appendChild(contenidoMensaje);
    
      // Agregar mensaje recibido a la lista de mensajes
      const listaMensajes = document.getElementById('mensajes-'+sala); // Asegúrate de tener una lista de mensajes específica para cada sala
      listaMensajes.appendChild(mensajeRecibido);
      // Desplazar la lista de mensajes al final
      listaMensajes.scrollTop = listaMensajes.scrollHeight;
    });

    socket.on('mensajePrivado', (datos) => {
      console.log(datos);
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'remetenteMenssage');
      // Crear elementos HTML para mostrar el mensaje
    
      const contenidoMensaje = document.createElement('div');
      contenidoMensaje.classList.add('contenido-mensaje');
    
      const nick = document.createElement('p');
      nick.textContent = datos.nick;
      nick.classList.add('nick');
    
      const mensaje = document.createElement('p');
      mensaje.textContent = datos.mensaje;
    
      const hora = document.createElement('p');
      hora.textContent = datos.hora;
    
      // Agregar elementos al mensaje recibido
      contenidoMensaje.appendChild(nick);
      contenidoMensaje.appendChild(mensaje);
      contenidoMensaje.appendChild(hora);
      mensajeRecibido.appendChild(contenidoMensaje);
    
      // Agregar mensaje recibido a la lista de mensajes
      const listaMensajes = document.getElementById('mensajes-' + datos.receptor.id); // Asegúrate de tener una lista de mensajes específica para cada usuario
      listaMensajes.appendChild(mensajeRecibido);
    
      // Desplazar la lista de mensajes al final
      listaMensajes.scrollTop = listaMensajes.scrollHeight;
    });

    socket.on('entradausuarios', (entradausuarios) => {
      console.log(entradausuarios);
      const listaMensajes = document.getElementById('mensajes');
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'conexionMensaje');
      mensajeRecibido.textContent = entradausuarios;
      listaMensajes.appendChild(mensajeRecibido);
    });

    socket.on('salidausuarios', (salidausuarios) => {
      console.log(salidausuarios);
      const listaMensajes = document.getElementById('mensajes');
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'desconexionMensaje');
      mensajeRecibido.textContent = salidausuarios;
      listaMensajes.appendChild(mensajeRecibido);
    });

}



function enviarAvatar() {
    const input = document.getElementById('avatar-input');
    console.log(input.value);
    socket.emit('avatar', input.value);
    console.log("Avatar asignado: "+ input.value);
    input.value = '';
}

const subirAvatar = document.getElementById('subirAvatar');
  const elegirAvatar = document.getElementById('elegirAvatar');
  const endpoint = 'http://localhost:3000/upload';
  // const endpoint = 'https://whatsappclone-nodejs.onrender.com/upload';
  subirAvatar.addEventListener('click', () => {
    const file = elegirAvatar.files[0];
    const formData = new FormData();
    formData.append('avatar', file);
    fetch(endpoint, {
      method: 'POST',
      body: formData
    })
    .then(data => {
      console.log(file.name);
      alert('File uploaded successfully!');
      socket.emit('archivoCompartido', file.name);
    })
    .catch(error => {
      console.error(error);
      alert('Error uploading file');
    });
  });

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
  const user = auth.currentUser;
  console.log(usuarios);
  const listaUsuarios = document.getElementById('lista-usuarios');
  listaUsuarios.innerHTML = '';

  usuarios.forEach((usuario) => {
    console.log(usuario);
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
    inputavatar = document.getElementById('elegirAvatar');
    img.setAttribute('src', usuario.avatar);


    img.setAttribute('alt', 'Imagem do avatar 2');

    ifoUsuario.setAttribute('onclick', `entrarSalaPrivada(${JSON.stringify(usuario)})`);
    // Añadir el texto a los elementos
    nomeUsuario.textContent = usuario.nick;
    previewMenssage.textContent = '-';
    horario.textContent = '20:44';
    menssagePendente.textContent = '3';

    // Añadir los elementos al DOM
    boxContato.appendChild(img);
    ifoUsuario.appendChild(nomeUsuario);
    ifoUsuario.appendChild(previewMenssage);
    infoMenssage.appendChild(horario);
    infoMenssage.appendChild(menssagePendente);
    boxContato.appendChild(ifoUsuario);
    boxContato.appendChild(infoMenssage);

    // Añadir el elemento principal a la lista de usuarios
    listaUsuarios.appendChild(boxContato);
  });
});


function iniciarSesionGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
  .then((result) => {
    const user = result.user;
    let nick = user.displayName;
    configurarUsuario(user);
  });
}

function iniciarSesionGitHub() {
  const provider = new firebase.auth.GithubAuthProvider();
  auth.signInWithPopup(provider)
  .then((result) => {
    const user = result.user;
    let nick = user.displayName;
    configurarUsuario(user);
  });
}


function configurarUsuario(user){

  let inputavatar = document.getElementById('elegirAvatar');
  let  miImagen = document.getElementById('miimagen');
  
  let nick;
  let avatar;

  if (user) {
    nick = user.displayName;
  }

  
  if (inputavatar.value === '' && user) {
    avatar = user.photoURL;
  } else {
    let filename = inputavatar.files[0].name;
    avatar = './archivosComp/' + filename;
  }

  socket.emit('nick', nick, avatar);

  document.getElementById('miusuario').textContent = nick;
  miImagen.setAttribute('src', avatar);

  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
  document.getElementById('sala1').style.display = 'none';
  document.getElementById('sala2').style.display = 'none';
}


