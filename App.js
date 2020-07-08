import React,{useState} from 'react';
import './App.css';

function App() {
  const [first_name,setName]= useState('');
  const [email,setEmail] =useState('');
  const[password,setPassword]=useState('');


  const handleOnSubmit = async(e) =>{
    e.preventDefault();
    const res = await fetch('http://localhost:3001/login',{
      method:'POST',
      mode:'cors',
      credentials:'include',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({first_name,password,email})
    });
    //const jsonRes = await res.json();
    //console.log(jsonRes);

    const {success,user} = await res.json();
    if(success) {
      alert('Welcome user: ' + user);
    }

  }




  return (
    <div className="App">
       <form onSubmit={handleOnSubmit}>
        <input type ="first_name" value={first_name} onChange={(e)=> setName(e.target.value)}placeholder = "enter name"/>
        <input type ="password" value={password} onChange={(e)=> setPassword(e.target.value)}placeholder = "enter password"/>
        <input type ="email" value={email} onChange={(e)=> setEmail(e.target.value)}placeholder = "enter email"/>
        <input type="submit" value ="submit"/>
      </form>
     
    </div>
  );
}

export default App;
