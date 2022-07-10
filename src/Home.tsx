import logo from "./logo.png";

function Home(){

    navigator.serviceWorker.register('sw.js');
    Notification.requestPermission(function(result) {
    if (result === 'granted') {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification('Anmol',{
                body:'this is the message',
                icon : logo
            });
        });
    }
    });

    return(
        <div>

        </div>
    )
}

export default Home;