// alert('form chat script')

let username_h1 = document.getElementById(
    'username');
let chat_div  =document.getElementById('chat');
let chat_msg = document.getElementById('chatmsg')
let send_btn = document.getElementById('send')
let clear_btn = document.getElementById('clear')
let online_lst = document.getElementById('online')
let private_chat_div  =document.getElementById('private_chat')
private_chat_div.style.display="none"

function add_event_to_btn(btn_id){
    console.log("here",btn_id)
    let btn= document.getElementById(btn_id)
    console.log(btn)
    btn.addEventListener('click', function (){
        console.log('button clicked', {btn_id})
        // private_chat_div.style.display="block"
        private_chat_div.style.display="block"

    })
}



username= prompt('Please enter your name : ')
username_h1.innerHTML =username
// use websocket to connection to the web socket server

let mywebsocket = new WebSocket('ws://localhost:8000'); // connected to server
console.log('here',mywebsocket);
console.log("iti")



// 1- open connection

mywebsocket.onopen = function (){
    console.log('connection opened');
    // I need to send the server myname ??
    // best practice while sending data is to prepare it in form object
    msg_to_send  ={
        type: "login",
        username: username
    }

    mywebsocket.send(JSON.stringify(msg_to_send))
}

function clicky(){
     console.log('button clicked', {})
        // private_chat_div.style.display="block"
        private_chat_div.style.display="block"
}

// 2- on message ?
mywebsocket.onmessage= function (event){
    console.log(event)
    let received_msg = JSON.parse(event.data)
    console.log(received_msg.online)
    if (received_msg.type==='login'){
        chat_div.innerHTML +=`<h3 style="color: green; text-align: center">${received_msg.body}</h3>`
    }else if(received_msg.type==='logout'){
        chat_div.innerHTML +=`<h3 style="color: red; text-align: center">${received_msg.body}</h3>`

    } else if(received_msg.type==='chat'){
        chat_div.innerHTML +=`<h3 class="w-50 bg-light rounded-2 p-2 mx-2 " >${received_msg.body}</h3>`

    }

    online_lst.innerHTML = ''
    private_chat_div.style.display="none"
    online_users = received_msg.online
    online_users.forEach((user)=>{
        online_lst.innerHTML += `<li> ${user.name} </li>`
        elem = document.createElement('button');
        elem.id = "btn_" +user.id;
        elem.appendChild(document.createTextNode('Click'))
        elem.class='btn btn-success';
        elem.addEventListener("click", clicky);
        online_lst.append(elem)

        // while sending data --> id of users

    })

}

send_btn.addEventListener('click', function (){
    let msg_val = `${username}:${chat_msg.value}.`
    let msg_to_send= {
        type: 'chat',
        body: msg_val
    }
    chat_div.innerHTML +=`<h2  class="w-50 ms-auto bg-warning  rounded-2 p-2 mx-2 " >Me:${chat_msg.value}</h2>`
    msg_to_send= JSON.stringify(msg_to_send);
    mywebsocket.send(msg_to_send);
    chat_msg.value = '';

})

clear_btn.addEventListener('click', function (){
    chat_div.innerHTML ='';
})


// 3- close the connection