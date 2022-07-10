import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import logo from "./logo.png";
import Header from "./Header";
import userlogo from "./userlogo.png";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

function ChooseContact(){
    const inputUser = useRef<HTMLInputElement>(null);
    const inputMessage = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [users,setUsers] = useState<{id:number,username:string}[]>([]);
    const [options,setOptions] = useState(<></>);

    useEffect(()=>{
        let data = users.map((data,index)=>{
            return(
                <div>
                    <button style={{fontSize:'3vh',marginLeft:'1vh',marginRight:'0vh',marginBottom:'2vh',width:'95%',backgroundColor:'#5CDB95'}}
                        onClick={(event)=>{
                        event.preventDefault();
                        if(data.username!==null){  
                            localStorage.setItem('conversationWith',data.username);
                            const user : string = localStorage.getItem('username') || "no user";
                            if(user.localeCompare(data.username)<0){
                                localStorage.setItem('subscriptionName',user+"-"+data.username);
                            }
                            else{
                                localStorage.setItem('subscriptionName',data.username+"-"+user);
                            }
                        }
                        navigate('/Message')}}>
                            <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
                                <img src={userlogo} height={90} style={{marginRight:'2vh'}}/> 
                                <p>{data.username} </p>
                            </div>
                    </button>
                    <br/>
                </div>
            )
        });

        setOptions(<div style={{width:'100%',display:'flex',flexDirection:'column',marginBottom:'1vh'}}>{data}</div>);

    },[users]);

    useEffect(()=>{
        Axios.get(`${localStorage.getItem('server')}/getUsers/${localStorage.getItem('username')}`).then(
            res =>{
                setUsers(res.data);
            }
        )
    },[]);


    useEffect(()=>{

        const sock = new SockJS(`${localStorage.getItem('server')}/ws`);
        const stompClient = Stomp.over(sock);

        sock.onopen = function() { console.log('open');}

        stompClient.connect({},function(frame){
            console.log('connected '+frame);
            navigator.serviceWorker.register('sw.js');
            Notification.requestPermission(function(result) {
                if (result === 'granted') {
                    navigator.serviceWorker.ready.then(function(registration) {
                        registration.showNotification(`Hi ${localStorage.getItem('username')}`,{
                            body : 'Welcome To Kriotic Messenger' ,
                            icon : logo
                        });
                    });
                }
            });

            stompClient.subscribe(`/topic/getnotification/${localStorage.getItem('username')}`,function(greeting){
                let json = JSON.parse(greeting.body);
                if(json.from!==localStorage.getItem('username')){
                    Notification.requestPermission(function(result) {
                        if (result === 'granted') {
                            navigator.serviceWorker.ready.then(function(registration) {
                                registration.showNotification(json.from, {
                                    body: json.message ,
                                    icon : logo 
                                });
                            });
                        }
                    });
                }
            });

        });

        return () => {
            sock.close();
        };
    },[])


    return(
        <div>
            <Header/>
            <div style={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center',marginTop:'2vh'}}>
                {options}
                <div style={{display:'flex',width:'100%',flexDirection:'column',alignItems:'center'}}>
                    <input type={'text'} style={{padding:'2vh 10vh',margin:'2vh',width:'40%',fontSize:'3vh',border:'2px solid black'}} ref={inputUser} placeholder="Type username"/>
                    <button type="submit" style={{padding:'2vh 0vh',width:'40%',marginRight:'1vh',backgroundColor:'#4CAF50',color:'white',marginBottom:'6vh',borderRadius:'1vh'}}
                        onClick={(event)=>{
                        event.preventDefault();
                        if(inputUser.current?.value!==null){
                            const user : string = localStorage.getItem('username') || "no user";
                            const conversationWith = inputUser.current?.value || "no conversationWith";
                            localStorage.setItem('conversationWith',conversationWith);
                            if(user.localeCompare(conversationWith)<0){
                                localStorage.setItem('subscriptionName',user+"-"+conversationWith);
                            }
                            else{
                                localStorage.setItem('subscriptionName',conversationWith+"-"+user);
                            }
                        }
                        navigate('/Message')}}> Start New Conversation </button>
                </div>
            </div>
        </div>
    )
}

export default ChooseContact;