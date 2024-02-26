import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [inputNick, setInputNick] = useState('');
    const [inputAvatar, setInputAvatar] = useState('');
    const [fileInput, setFileInput] = useState(null);

    const socket = io();

    useEffect(() => {
        socket.on('mensaje', (msg) => {
            setMessages([...messages, msg]);
        });
    }, [messages]);

    const handleSendMessage = () => {
        socket.emit('mensaje', inputMessage);
        setInputMessage('');
    };

    const handleSendNick = () => {
        socket.emit('nick', inputNick);
        setInputNick('');
    };

    const handleSendAvatar = () => {
        socket.emit('avatar', inputAvatar);
        setInputAvatar('');
    };

    const handleFileUpload = () => {
        const formData = new FormData();
        formData.append('fichero', fileInput);

        fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert('File uploaded successfully!');
            socket.emit('archivoCompartido', data.fileName);
        })
        .catch(error => {
            console.error(error);
            alert('Error uploading file');
        });
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
    };

    const handleNickChange = (e) => {
        setInputNick(e.target.value);
    };

    const handleAvatarChange = (e) => {
        setInputAvatar(e.target.value);
    };

    const handleFileInputChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    return (
        <div className="container">
            <h1>Chat</h1>
            <div className="input-group">
                <input type="text" value={inputNick} onChange={handleNickChange} placeholder="Tu nombre" />
                <input type="hidden" name="avatar" value={inputAvatar} />
                <p>Avatar</p>
                <div>
                    {/* Renderiza tus imágenes de avatar aquí */}
                </div>
                <button onClick={handleSendAvatar}>Enviar Avatar</button>
                <button onClick={handleSendNick}>Enviar Nick</button>
            </div>
            <form>
                <input type="file" id="fileInput" name="fileInput" onChange={handleFileInputChange} />
                <button type="button" onClick={handleFileUpload}>Upload</button>
            </form>
            <div className="input-group">
                <input type="text" value={inputMessage} onChange={handleInputChange} placeholder="Escribe un mensaje" />
                <button onClick={handleSendMessage}>Enviar</button>
            </div>

            <div className="chat-box">
                <h2>Emoji</h2>
                <div>
                    {/* Renderiza tus imágenes de emoji aquí */}
                </div>
                <input type="hidden" id="emoji" />
                <button >Enviar emoji</button>
            </div>

            <div className="chat-box">
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatApp;
