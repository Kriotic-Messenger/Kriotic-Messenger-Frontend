import logo from "./logo.png";

function Header(){
    return(
        <div className="stick" style={{backgroundColor:'darkslateblue',marginTop:'0px',padding:'1vh',
            color:'white',display:'flex',justifyContent:'center',border:'1px solid black'}}>
            <div style={{display:'flex',alignItems:'center'}}>
                <img src={logo} height={150} />
                <h1 style={{display:'flex',marginLeft:'-20px'}}>Kriotic Messenger</h1>
            </div>
        </div>
    )
}

export default Header;