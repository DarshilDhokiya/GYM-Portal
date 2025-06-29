import { useState } from 'react'
import './App.css'

function App() {
  let [counter , setcounter] = useState(15) 
const addValue = ()=>{
counter +=1
setcounter(counter) 
}
const removevelue = ()=>{
  counter -=1
  setcounter(counter) 
  }
 
  return (
    <>
    
    <h1>hello world:{counter}</h1>
    
    <button onClick={addValue} >add</button>
    <br />
    <button onClick={removevelue}>remove</button>
    </>
  )
  
}

export default App
