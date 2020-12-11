import React from 'react';
import './App.css';
import dat from './example_data.json'
import Zoom1 from "./components/Zoom/Zoom1";
function App() {
    return (
        <div className="App">
            <Zoom1 data={dat}/>
        </div>
    );
}

export default App;
