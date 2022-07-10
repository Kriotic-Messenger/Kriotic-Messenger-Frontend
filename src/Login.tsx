import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";
import Header from "./Header";

function Login(){
    const inputData = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    return(
        <div>
            <Header/>
            <div style={{display:'flex',justifyContent:'center',flexDirection:'column'}}>
                <input type={'text'} ref={inputData} style={{margin:'2vh',padding:'3vh',fontSize:'3vh',marginTop:'8vh',border:'2px solid black'}} placeholder="Enter you username"/>
                <br/>
                <button type="submit" style={{color:'white',backgroundColor:'green',fontSize:'3vh',padding:'3vh',marginRight:'2vh',marginLeft:'2vh'}}
                    onClick={(event)=>{
                    event.preventDefault();
                    localStorage.setItem('username',inputData.current? inputData.current.value : "no user"); 
                    navigate('/ChooseContact')}}>Log In</button>
            </div>
        </div>
    )
}

export default Login;