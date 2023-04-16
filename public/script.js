const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const videoRecord = document.getElementById('recorded');
const myVideo = document.createElement('video');
const video = document.createElement('video');
// const myVideo2 = document.createElement('video');
// let recorder;
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});

let myVideoStream
let userStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    
    peer.on('call', call => {
        call.answer(stream);
      
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
            userStream = userVideoStream;
            // addVideoStream(myVideo2, userVideoStream)
            // myVideo2 = myVideo;
        })
        
    })

    socket.on('user-connected', (userId) => {
        connecToNewUser(userId, stream);
    })
    // let canvas = document.querySelector("#canvas");
    //   const takePicture = () => {
	  //   canvas.getContext('2d').drawImage(myVideo, 0, 0, canvas.width, canvas.height);
    //   let image_data_url = canvas.toDataURL('image/jpeg');
    //   console.log(image_data_url);
    //   }
    let msg = $('#chat_message');

    // Nhan ENTER de gui tin nhan
    $('html').keydown(function (e) {
    if (e.which == 13 && msg.val().length !== 0) {
        socket.emit('message', msg.val());
        console.log(msg.val());
        msg.val('')
        
        }
    });

    // Them tin nhan vao Chat Box
    socket.on('createMessage', message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })


    const recorder = new MediaRecorder(stream);
    
})



// Thanh cuon tin nhan
const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


// Bat-Tat Audio
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}


// Bat - Tat Hinh anh
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
  
const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}




/// Xu ly chuyen doi giao dien

// Xu ly chuyen doi Box 

const showLibrary = () => { 
  setShowLibrary()
}

const setShowLibrary = () => {
  document.querySelector('.main__right').style.display = "none";
  document.querySelector('.main__right_2').style.display = "flex";
  document.querySelector('.messages').style.display = "none";
}

const showChatBox = () => {
  setShowChatBox()
}

const setShowChatBox = () => {
  document.querySelector('.main__right').style.display = "flex";
  document.querySelector('.main__right_2').style.display = "none";
  document.querySelector('.messages').style.display = "flex";

}




/// Xu ly Chup anh

// Chup anh
let canvas = document.querySelector("#canvas");
const takePicture = () => {
	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  let image_data_url = canvas.toDataURL('image/jpeg');
  console.log(image_data_url);
}

// Tai hinh anh da chup
const download_picture = () => {
  let canvasImage = document.getElementById('canvas').toDataURL('image/jpeg');
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function () {
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhr.response);
    a.download = 'img.png';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  xhr.open('GET', canvasImage); //Tai hinh anh
  xhr.send();
}




//// Xu ly Quay Video

// Quay Video
let mediaRecorder;
const parts= [];
const recordVideo = () => {  
    mediaRecorder = new MediaRecorder(myVideoStream, {mimeType: 'video/webm'});
    mediaRecorder.start();
    mediaRecorder.ondataavailable = function(e){
      parts.push(e.data);
    }
  setRecordVideo();
}

const setRecordVideo = () => {
  const html = `
  <i class="record fas fa-solid fa-record-vinyl"></i>
    <span>Recording...</span>
  `
  document.querySelector('.main__record_button').innerHTML = html;
}

const stopRecoder = () => {
  mediaRecorder.stop();
  setStopRecordVideo();
  const blob = new Blob(parts, {type: 'video/mp4'});
  const url = URL.createObjectURL(blob);
  videoRecord.play();
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "record.mp4";
  a.click();
}


const setStopRecordVideo = () => {
  const html = `
  <i class="fas fa-solid fa-record-vinyl"></i>
    <span>Record</span>
  `
  document.querySelector('.main__record_button').innerHTML = html;
}


// Tai Video

// Ket noi room
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});


//Ket noi nguoi dung moi
const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
}


// Them Video nguoi dung moi
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);

}