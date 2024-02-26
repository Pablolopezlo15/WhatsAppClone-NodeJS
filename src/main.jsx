import React, { Children } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/css/index.css'

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";


import Sala from './Components/Sala.jsx'
import Login from './Components/Login.jsx'
import ChatApp from './Components/ChatApp.jsx'


const router = createBrowserRouter([
  {
    element: (
      <>
        <Outlet />
      </>
    ),

    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/sala',
        element: <Sala />,
      },
      {
        path: '/chat',
        element: <ChatApp />,
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router}/>
    <Outlet />
  </>,
)
