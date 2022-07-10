import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './Home';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './Login';
import Message from './Message';
import ChooseContact from './ChooseContact';
import WindowFocusHandler from './WindowFocusHandler';

function App() {

  localStorage.setItem('server','http://localhost:8080');

  return (
    <BrowserRouter>
        <div>
          <Routes>
            <Route path="/Home" element={<Home/>} />
            <Route path="/" element={<Login/>} />
            <Route path="/Message" element={<Message/>}/>
            <Route path="/ChooseContact" element={<ChooseContact/>}/>
            <Route path="/window" element={<WindowFocusHandler/>}/>
          </Routes>
        </div> 
      </BrowserRouter>
  );
}

export default App;
