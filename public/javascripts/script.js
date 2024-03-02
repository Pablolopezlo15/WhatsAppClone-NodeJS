let auth;
let user;
let salaActual = '';
let login = document.getElementById('login');
let chat = document.getElementById('chat');
let chatArea = document.getElementById('chatArea');
let sala1 = document.getElementById('sala1');
let sala2 = document.getElementById('sala2');
let salaPrivada = document.getElementById('salaPrivada');
let errorPorCorreoExisitente = document.getElementById('errorPorCorreoExisitente');

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


  const buttons = [
    document.getElementById('emoji-button-general'),
    document.getElementById('emoji-button-sala1'),
    document.getElementById('emoji-button-sala2'),
    document.getElementById('emoji-button-privado')
  ];
  const pickers = [
    document.getElementById('emoji-picker-general'),
    document.getElementById('emoji-picker-sala1'),
    document.getElementById('emoji-picker-sala2'),
    document.getElementById('emoji-picker-privado')
  ];
  const inputs = [
    document.getElementById('mensaje'),
    document.getElementById('mensajesala1'),
    document.getElementById('mensajesala2'),
    document.getElementById('mensajePrivado')
  ];

  // Mostrar el selector cuando se hace clic en un botón
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      pickers[index].style.display = pickers[index].style.display === 'none' ? 'flex' : 'none';
    });
  });

  // Insertar el emoji seleccionado en el input
  pickers.forEach((picker, index) => {
    picker.addEventListener('click', event => {
      if (event.target.tagName === 'LI') {
        inputs[index].value += event.target.textContent;
      }
    });
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



  let chatsPrivados = document.getElementsByClassName('chatPrivados');
  for (let i = 0; i < chatsPrivados.length; i++) {
    chatsPrivados[i].style.display = 'none';
  }

  let usuarioIDContainer = document.getElementById(mensajesUsuarioID);
  if (!usuarioIDContainer) {
    // Si no existe, crea uno nuevo
    usuarioIDContainer = document.createElement('ul');
    usuarioIDContainer.setAttribute('class', 'chatPrivados mensajesbox');
    usuarioIDContainer.setAttribute('id', mensajesUsuarioID);
    chatMensajes.appendChild(usuarioIDContainer);
  }



  const enviarmensajeprivado = document.getElementById('enviarmensajeprivado');
  enviarmensajeprivado.setAttribute('onclick', `enviarPrivado('${usuario.id}')`);
  
  usuarioIDContainer.style.display = 'block';

  socket.emit('entrarRoom', usuario.id);
}

function enviarPrivado(usuarioID) {
  const listaMensajes = document.getElementById('mensajes-'+usuarioID);
  const input = document.getElementById('mensajePrivado');
  socket.emit('mensajePrivado', { mensaje: input.value, receptorID: usuarioID });
  const nuevoMensaje = document.createElement('li');
  nuevoMensaje.setAttribute('class', 'destinMenssage');
  nuevoMensaje.textContent = input.value;
  listaMensajes.appendChild(nuevoMensaje);

  let mensajesbox = document.getElementById('mensajes-'+usuarioID);
  mensajesbox.scrollTop = mensajesbox.scrollHeight;

  input.value = '';
}


const input = document.getElementById('mensaje');
const mensajesala1 = document.getElementById('mensajesala1');
const mensajesala2 = document.getElementById('mensajesala2');
input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      enviar();
    }
});
mensajesala1.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    enviarRoom();
  }
});
mensajesala2.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    enviarRoom();
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
      //Maqueto el mensaje que llega
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


      listaMensajes.appendChild(mensajeRecibido);

      let mensajesbox = document.querySelector('.mensajesbox');
      mensajesbox.scrollTop = mensajesbox.scrollHeight;
    });

    socket.on('mensajeEnRoom', (msg) => {
      //Maqueto el mensaje que llega
      console.log(msg);
      let sala = msg.room;
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'remetenteMenssage');
    
      const contenidoMensaje = document.createElement('div');
      contenidoMensaje.classList.add('contenido-mensaje');
    
      const nick = document.createElement('p');
      nick.textContent = msg.nick;
      nick.classList.add('nick');
    
      const mensaje = document.createElement('p');
      mensaje.textContent = msg.mensaje;
    
      const hora = document.createElement('p');
      hora.textContent = msg.hora;
    
      contenidoMensaje.appendChild(nick);
      contenidoMensaje.appendChild(mensaje);
      contenidoMensaje.appendChild(hora);
      mensajeRecibido.appendChild(contenidoMensaje);
    
      const listaMensajes = document.getElementById('mensajes-'+sala);
      listaMensajes.appendChild(mensajeRecibido);

      // Desplazar la lista de mensajes al final
      listaMensajes.scrollTop = listaMensajes.scrollHeight;
    });

    socket.on('mensajePrivado', (datos) => {
      if (socket.id === datos.receptor.id) {
        console.log("No puedes enviarte un mensaje a ti mismo");
        return;
      }
      console.log(datos);
      //Maqueto el mensaje que llega

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
    
      contenidoMensaje.appendChild(nick);
      contenidoMensaje.appendChild(mensaje);
      contenidoMensaje.appendChild(hora);
      mensajeRecibido.appendChild(contenidoMensaje);
    
      const listaMensajes = document.getElementById('mensajes-' + datos.receptor.id);
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

    socket.on('archivoCompartido', (datos) => {
      console.log(datos);
      const listaMensajes = document.getElementById('mensajes');
    
      const mensajeRecibido = document.createElement('li');
      mensajeRecibido.setAttribute('class', 'remetenteMenssage');
    
      const mensaje = document.createElement('p');
      mensaje.setAttribute('class', 'archivoCompartido');
      if (datos.mensaje.includes('.png') || datos.mensaje.includes('.jpg') || datos.mensaje.includes('.jpeg') || datos.mensaje.includes('.gif')) {
        const img = document.createElement('img');
        img.setAttribute('src', 'archivosComp/' + datos.mensaje);
        img.setAttribute('class', 'imagenMensaje');

        descargar = document.createElement('a');
        descargar.setAttribute('href', 'archivosComp/' + datos.mensaje);
        descargar.setAttribute('download', '');
        descargar.textContent = 'Descargar';
        mensaje.appendChild(descargar);
        mensaje.appendChild(img);
      } else {
        const archivo = document.createElement('a');
        archivo.setAttribute('href', 'archivosComp/' + datos.mensaje);
        archivo.setAttribute('target', '_blank');
        archivo.textContent = datos.mensaje;
        mensaje.appendChild(archivo);
      }
      mensajeRecibido.appendChild(mensaje);
    
      const datosMensaje = document.createElement('div');
      datosMensaje.setAttribute('class', 'datos-mensaje');
      mensajeRecibido.appendChild(datosMensaje);
    
      const avatar = document.createElement('img');
      avatar.setAttribute('src', datos.avatar);
      avatar.setAttribute('class', 'fotoUsuarioMensaje');
      datosMensaje.appendChild(avatar);
    
      const nick = document.createElement('p');
      nick.setAttribute('class', 'nick');
      nick.textContent = datos.nick;
      datosMensaje.appendChild(nick);
    
      const hora = document.createElement('p');
      hora.textContent = datos.hora;
      datosMensaje.appendChild(hora);
    
      listaMensajes.appendChild(mensajeRecibido);
    
      let mensajesbox = document.querySelector('.mensajesbox');
      mensajesbox.scrollTop = mensajesbox.scrollHeight;
    });

    socket.on('error', (msg) => {
      console.log(msg);
    });
  

}

const subirAvatar = document.getElementById('subirAvatar');
  const elegirAvatar = document.getElementById('elegirAvatar');
  // const endpoint = 'http://localhost:3000/upload';
  const endpoint = 'https://whatsappclone-nodejs.onrender.com/upload';
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
      alert('Avatar seleccionado Correctamente, ahora inicia sesión con cualquiera de las opciones.');
      socket.emit('archivoCompartido', file.name);
    })
    .catch(error => {
      console.error(error);
      alert('Error uploading file');
    });
  });

  document.getElementById('fichero').addEventListener('change', compartirArchivo);

  function compartirArchivo() {
    const input = document.getElementById('fichero');
    
    if (input.files.length === 0) {
      console.log('No file selected');
      return;
    }
  
    const file = input.files[0];
    const formData = new FormData();
    formData.append('fichero', file);
    const endpoint = 'https://whatsappclone-nodejs.onrender.com/uploadArchivo';
    // const endpoint = 'http://localhost:3000/uploadArchivo';
    fetch(endpoint, {
      method: 'POST',
      body: formData
    })
    .then(response => response)
    .then(data => {
      console.log(file.name);
      const datos = {
        nick: auth.currentUser.displayName,
        avatar: auth.currentUser.photoURL,
        mensaje: file.name,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        room: salaActual
      };
      socket.emit('archivoCompartido', datos);
      input.value = '';

      //Maqueto el archivo
      const listaMensajes = document.getElementById('mensajes');
      const mensajeEnviado = document.createElement('li');
      mensajeEnviado.setAttribute('class', 'destinMenssage');
  
      const mensaje = document.createElement('p');
      mensaje.setAttribute('class', 'archivoCompartido');
      if (datos.mensaje.includes('.png') || datos.mensaje.includes('.jpg') || datos.mensaje.includes('.jpeg') || datos.mensaje.includes('.gif')) {
        const img = document.createElement('img');
        img.setAttribute('src', 'archivosComp/' + datos.mensaje);
        img.setAttribute('class', 'imagenMensaje');
        mensaje.appendChild(img);
      } else {
        const archivo = document.createElement('a');
        archivo.setAttribute('href', 'archivosComp/' + datos.mensaje);
        archivo.setAttribute('download', '');
        archivo.setAttribute('target', '_blank');
        archivo.textContent = datos.mensaje;
        mensaje.appendChild(archivo);
      }
      mensajeEnviado.appendChild(mensaje);
  
      const datosMensaje = document.createElement('div');
      datosMensaje.setAttribute('class', 'datos-mensaje');
      mensajeEnviado.appendChild(datosMensaje);
  
      const hora = document.createElement('p');
      hora.textContent = datos.hora;
      datosMensaje.appendChild(hora);
  
      listaMensajes.appendChild(mensajeEnviado);
  
      let mensajesbox = document.querySelector('.mensajesbox');
      mensajesbox.scrollTop = mensajesbox.scrollHeight;
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  socket.on('usuarios', (usuarios) => {
    const user = auth.currentUser;
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

      // Añadir las clases a los elementos
      boxContato.classList.add('boxContato');
      img.classList.add('fotoUsuario');
      ifoUsuario.classList.add('ifoUsuario');
      nomeUsuario.classList.add('nomeUsuario');
      previewMenssage.classList.add('previewMenssage');
      infoMenssage.classList.add('infoMenssage');
      horario.classList.add('horario');

      // Añadir los atributos a los elementos
      inputavatar = document.getElementById('elegirAvatar');
      img.setAttribute('src', usuario.avatar);


      img.setAttribute('alt', 'Imagem do avatar 2');

      ifoUsuario.setAttribute('onclick', `entrarSalaPrivada(${JSON.stringify(usuario)})`);
      // Añadir el texto a los elementos
      nomeUsuario.textContent = usuario.nick;
      previewMenssage.textContent = '¡Bienvenido!';
      horario.textContent = '20:44';

      // Añadir los elementos al DOM
      boxContato.appendChild(img);
      ifoUsuario.appendChild(nomeUsuario);
      ifoUsuario.appendChild(previewMenssage);
      infoMenssage.appendChild(horario);
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
    })
    .catch((error) => {
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorPorCorreoExisitente.textContent = 'Ya existe un usuario con la misma dirección de correo electrónico pero con diferentes credenciales de inicio de sesión.';
      }
    });
  }

  function iniciarSesionGitHub() {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      let nick = user.displayName;
      configurarUsuario(user);
    })
    .catch((error) => {
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorPorCorreoExisitente.textContent = 'Ya existe un usuario con la misma dirección de correo electrónico pero con diferentes credenciales de inicio de sesión.';
      }
    }) ;
  }

  function iniciarSesionFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      let nick = user.displayName;
      configurarUsuario(user);
    })
    .catch((error) => {
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorPorCorreoExisitente.textContent = 'Ya existe un usuario con la misma dirección de correo electrónico pero con diferentes credenciales de inicio de sesión.';
      }
    })
    ;
  }

  function iniciarSesion(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      configurarUsuario(user);
    })
    .catch((error) => {
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorPorCorreoExisitente.textContent = 'Ya existe un usuario con la misma dirección de correo electrónico pero con diferentes credenciales de inicio de sesión.';
      }
    });
  }

  function registrarse(){
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email-registro').value;
    const password = document.getElementById('password-registro').value;
    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: nombre
      }).then(() => userCredential.user);
    })
    .then((user) => {
      console.log(user);
      configurarUsuario(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorPorCorreoExisitente.textContent = 'Ya existe un usuario con la misma dirección de correo electrónico pero con diferentes credenciales de inicio de sesión.';
      }
      console.log(error);
    });
  }


function configurarUsuario(user){
  let inputavatar = document.getElementById('elegirAvatar');
  let miImagen = document.getElementById('miimagen');
  
  let nick;
  let avatar;

  if (user) {
    nick = user.displayName;
  }

  if (inputavatar.value === '' && user) {
    avatar = user.photoURL;
    if (user.photoURL === null) {
      avatar = './img/avatarDefault.png';
    }
    actualizarPerfilChat(user, nick, avatar, miImagen);
  } else {
    //Actualizo los datos en firebase
    let file = inputavatar.files[0];
    let storageRef = firebase.storage().ref('avatars/' + file.name);
    let uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', function(snapshot){
    }, function(error) {
      console.log(error);
    }, function() {

      // Cuando la subida se completa, obtener la URL de la imagen y actualizar el perfil del usuario
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        avatar = downloadURL;
        user.updateProfile({
          photoURL: avatar
        }).then(function() {
          // Actualizar el perfil del usuario en el chat
          actualizarPerfilChat(user, nick, avatar, miImagen);
        }).catch(function(error) {
          console.log(error);
        });
      });
    });
  }
}

function actualizarPerfilChat(user, nick, avatar, miImagen) {
  socket.emit('nick', nick, avatar);

  document.getElementById('miusuario').textContent = nick;
  miImagen.setAttribute('src', avatar);

  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
  document.getElementById('sala1').style.display = 'none';
  document.getElementById('sala2').style.display = 'none';
}