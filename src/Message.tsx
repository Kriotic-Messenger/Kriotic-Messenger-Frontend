import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./App.css";
import userlogo from "./userlogo.png";
import logo from "./logo.png";

function Message(){

    const inputData = useRef<HTMLInputElement>(null);
    const inputUsername = useRef<HTMLInputElement>(null);
    const btn1 = useRef<HTMLButtonElement>(null);
    const focusElement = useRef<HTMLDivElement>(null);
    const [heading,setHeading] = useState('');
    const [btn,setbtn] = useState(<></>);

    const [messages,setMessages] = useState<{from:string,to:string,message:string}[]>([]);
    const [initialMessages,setInitialMessages] = useState<{id:number,messagefrom:string,message:string}[]>([]);

    const [data,setData] = useState(<></>);
    const navigate = useNavigate();
    const [marginBottonCnt,setMarginBottomCnt] = useState('-85vh');

    useEffect(()=>{
        let data1 = messages.map((message,index)=>{
            // console.log(message);
            if(message.from===localStorage.getItem('username')){
                return(
                    // alignSelf:'self-end'
                    <div style={{marginBottom:'15px',color:'white',alignSelf:"end",marginRight:'2vh',marginLeft:'10vh',
                        border:'1px solid green',padding:'1vh 4vh',paddingRight:'3vh',backgroundColor:'green',borderRadius:'25px',borderBottomRightRadius:'0px'}}>
                        <h3>{message.from} : {message.message}</h3>
                    </div>
                )
            }

            return(
                // alignSelf:'flex-start'
                <div style={{marginBottom:'15px',color:'black',alignSelf:'flex-start',marginLeft:'2vh',
                    marginRight:'10vh',border:'1px solid lightgrey',padding:'1vh 4vh',paddingLeft:'3vh',backgroundColor:'lightgrey',borderRadius:'20px',borderBottomLeftRadius:'1px'}}>
                    <h3>{message.from} : {message.message}</h3>
                </div>
            )
        });

        function convertToString(e : number){
            return e.toString();
        }

        if(messages.length<=10){
            if(window.innerHeight<700){
                setMarginBottomCnt(marginBottonCnt=>convertToString(75-(9*messages.length))+"vh")
            }
            else{
                setMarginBottomCnt(marginBottonCnt=>convertToString(83-(9*messages.length))+"vh")
            }
        }
        else{
            if(window.innerHeight<1000){
                setMarginBottomCnt('15vh')
            }
            else{
                setMarginBottomCnt('11vh')
            }
        }
        setData(<div style={{display:'flex',flexDirection:'column'}}>{data1}</div>);
    },[messages]);

    useEffect(()=>{
        let initialData : {from:string,to:string,message:string}[] = [];
        initialMessages.map((initialMessage,index)=>{
            initialData.push(
                {
                    from : initialMessage.messagefrom,
                    to : '',
                    message : initialMessage.message
                }
            )
        });
        setMessages(messages=>[...initialData]);
    },[initialMessages]);

    useEffect(()=>{
        Axios.get(`${localStorage.getItem('server')}/getConversation/${localStorage.getItem('username')}/${localStorage.getItem('conversationWith')}`)
            .then(res=>{setInitialMessages(res.data)});
    },[]);

    const handleSubmit = event => {
        console.log('handleSubmit ran');
        event.preventDefault();
    
        // 👇️ clear all input values in the form
        event.target.reset();
      };

    useEffect(()=>{

        const sock = new SockJS(`${localStorage.getItem('server')}/ws`);
        const stompClient = Stomp.over(sock);

        sock.onopen = function() { console.log('open');}

        stompClient.connect({},function(frame){
            console.log('connected '+frame);
            focusElement.current?.scrollIntoView();
            navigator.serviceWorker.register('sw.js');

            setbtn(<div>
                        <button type="button" style={{borderRadius:'50%',padding:'2vh',backgroundColor:'lightgreen',border:'1px solid green'}}
                            onClick={(event)=>{navigate('/ChooseContact');}}>{'<'}</button>
                        <input type={'text'} ref={inputData} style={{margin:'2vh 1vh',padding:'1vh'}}/>
                        <button style={{padding:'2vh',backgroundColor:'lightgreen',borderRadius:'10px',border:'1px solid green'}} onClick={(event)=>{
                            event.preventDefault();
                            function seperator(strr : string){
                                let temp_str : string = "";
                                for(let i=0;i<strr.length;i=i+20){
                                    if((i+20)>strr.length){
                                        temp_str = temp_str + "\n" + strr.slice(i,strr.length);
                                    }
                                    else{
                                        temp_str = temp_str + "\n" + strr.slice(i,i+20);
                                    }
                                }
                                return temp_str;
                            }
            
                            function makeMessage(str_arr : string[]){
                                let new_str : string = "";
                                for(let i=0;i<str_arr.length;i++){
                                    if((str_arr.at(i) || "").length >20){
                                        new_str = new_str + (new_str.length ? " " : "") + seperator(str_arr.at(i) || "");
                                    }
                                    else if((str_arr.at(i) || "")?.length>0){
                                        new_str = new_str + (new_str.length ? " " : "") + str_arr.at(i);
                                    }
                                }
                                return new_str
                            }
            
                            function filterMessage(str:string){
                                return makeMessage(str.split(' '))
                            }


                            stompClient.send("/app/sendPrivateMessage",{},
                                JSON.stringify(
                                    {
                                        from : localStorage.getItem('username') ,
                                        to : localStorage.getItem('conversationWith') ,
                                        message : filterMessage(inputData.current?.value || "")
                                    }
                                )
                            );
                            let a : string = "1";
                            inputData.current ? inputData.current.value = "" : a="2";

                        }}>Send Message</button>
                    </div>);

            stompClient.subscribe('/topic/public',function(greeting){
                setHeading(greeting.body);
            });

            stompClient.subscribe(`/topic/private/${localStorage.getItem('subscriptionName')}`,function(greeting){
                let json = JSON.parse(greeting.body);
                // console.log(new_str);
                console.log(json.message);
                setMessages(messages=>[...messages,json]);
                focusElement.current?.scrollIntoView();
            });

            stompClient.subscribe(`/topic/getnotification/${localStorage.getItem('username')}`,function(greeting){
                let json = JSON.parse(greeting.body);
                if(json.from!==localStorage.getItem('username')){
                    Notification.requestPermission(function(result) {
                        if(document.visibilityState!=="visible" || json.from!==localStorage.getItem('conversationWith')){
                            if (result === 'granted') {
                                navigator.serviceWorker.ready.then(function(registration) {
                                    registration.showNotification(json.from, {
                                        body: json.message ,
                                        icon : logo 
                                    });
                                });
                            }
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
            <div className="stick" style={{display:'flex',justifyContent:'center',backgroundColor:'darkslateblue',border:'1px solid black'}}>
                <img src={userlogo} height={65} style={{marginRight:'1vh'}} />
                <h2 style={{color:'white'}}>{localStorage.getItem('conversationWith')}</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:'2vh'}}>
                {data}
            </div>
            <div ref={focusElement} style={{marginBottom:'15vh'}}></div>
            <div className="stick2" style={{backgroundColor:'lightsalmon',marginRight:'0px',display:'flex',justifyContent:'center',marginTop:marginBottonCnt}}>
                {btn}
            </div>
            {/* <div style={{display:'flex',justifyContent:'center'}}>
                <button type="submit"  ref={btn1} onClick={(event)=>{ setMessages(messages=>[]);}}>clear all</button>
                <button type="submit" onClick={(event)=>{navigate('/ChooseContact');}}>Go Back</button>
            </div> */}
    </div>
    )
}

export default Message;