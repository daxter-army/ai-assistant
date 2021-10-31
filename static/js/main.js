'use strict';

(function () {
    // getting elements from the page
    // DECLARATIONS
    const microphoneBtn = document.querySelector('#btn-microphone');
    const loader = document.querySelector('#loader');
    const audioElement = document.querySelector('#audio-option');
    const commandInputField = document.querySelector('#input-command');
    const querySent = document.querySelector('#query-sent');
    const randomEmojis = ["😁", "😄", "🐒", "🔥", "💣", "😏", "🙊", "😎", "🤐"];
    // add functions here,  corresponding to voice commands
    const adobeIllusFuncs = ['plus', '-', 'minus', 'save', 'tab', 'select', 'pic'];

    // const rate = document.querySelector('#rate');
    // const rateValue = document.querySelector('#rate-value');
    // const pitch = document.querySelector('#pitch');
    // const pitchValue = document.querySelector('#pitch-value');

    // const voiceSelect = document.querySelector('#voice-select');
    // let voices = [];

    // helpers
    let listening = false;
    let shouldSend = false;

    // web speech API for Text-to-Speech
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    // web speech API for Speech-to-text
    // const SpeakSpeech = window.speechSynthesis;
    
    // for fetching voices
    // const getVoices = () => {
    //     voices = SpeakSpeech.getVoices();
    //     // loopiing on the options and genrating options for the list
    //     voices.forEach(voice => {
    //         // Create option element
    //         const option = document.createElement('option');
    //         // Filling option with voices and languages
    //         option.textContent = voice.name + ' (' + voice.lang + ')';
    //         // Set needed option attributes
    //         option.setAttribute('data-lang', voice.lang);
    //         option.setAttribute('data-name', voice.name);
    
    //         voiceSelect.appendChild(option);
    //     })
    // }
    // getVoices();

    // Values are fetched Asynchronously,
    // to fix this, because onvoiceschanged event is fired
    // if(SpeakSpeech.onvoiceschanged !== undefined){
    //     SpeakSpeech.onvoiceschanged = getVoices;
    // }

    // return if resources not available
    if (!(SpeechRecognition)) {
        alert('You should not continue');
    }

    const recognition = new SpeechRecognition();

    // For intermediate results ---->less acurate
    recognition.interimResults = false;

    // For continous Results ---->
    recognition.continuous = true;


    microphoneBtn.addEventListener("click", function() {
        if (listening) {
            // on to off
            recognition.stop();
        }
        else {
            // off to on
            recognition.start();
        }
    })

    // event listeners for SpeechRecognition events
    recognition.addEventListener('start', function() {
        console.info('Speech Recognition : START');
        // visuals
        microphoneBtn.innerHTML = '<i class="fas fa-microphone-slash fa-4x"></i>';
        listening = true;
        // audio
        audioElement.src = "../static/sound/micOn.mp3";
        audioElement.play();
        loader.style.display = 'block'
        commandInputField.value = "";
        commandInputField.focus();
        querySent.textContent = ""
    });

    
    recognition.addEventListener('result', function(event) {
        const { resultIndex: currentResultIndex } = event;
        const { transcript } = event.results[currentResultIndex][0];
        // console.log("raw : ", transcript);
        commandInputField.value = transcript.trim();
        
        let keyword = transcript.trim();

        // converting to lowercase
        keyword = keyword.toLowerCase();
        console.log("processed : ", keyword);

        // sleep trigger
        if (keyword === 'terminate') {
            recognition.stop();
            commandInputField.value = "";
            return;
        }

        // additional check
        if(keyword == "") {
            recognition.stop();
            speak("Try again...")
            return
        }

        // checking for approved commands
        for(let i = 0; i < adobeIllusFuncs.length; i++) {
            // console.log('checking', adobeIllusFuncs[i]);
            if(keyword.includes(adobeIllusFuncs[i])){
                shouldSend = true;
                break;
            }
            else {
                shouldSend = false;
            }
        }

        // conditional sending to the server
        if (shouldSend){
            let [ keywordCount, finCommand ] = count(keyword);
            console.log('here');

            let message = {
                "phrase" : finCommand,
                "presses" : keywordCount
            };

            console.info(`Phrase : ${finCommand}, Count : ${keywordCount}`);
            // send to server
            sendToServer(message);
            commandInputField.value = "👍";
            querySent.textContent = `${keyword}`;
        }
        else {
            // audio
            audioElement.src = "../static/sound/notDesired.mp3";
            audioElement.play();
            // commandInputField.value = "⚠️";
            console.log('not desired...');
        }


        // To speak function
        // speak(commandInputField.value);
    })

    recognition.addEventListener('end', function() {
        console.info('Speech Recognition : STOP');
        // visuals
        microphoneBtn.innerHTML = '<i class="fas fa-microphone fa-4x"></i>';
        listening = false;
        // audio
        audioElement.src = "../static/sound/micOff.mp3";
        audioElement.play();

        if (commandInputField.value === "") {
            // to keep yourself asking on empty input
            // speak('Try Again...')
            commandInputField.value = randomEmojis[Math.floor(Math.random()*randomEmojis.length)];
        }
        commandInputField.blur();
        querySent.textContent = "Speak a command";
        loader.style.display = 'none'
    })



    // DEFINITIONS
    // Speak function
    // Uncomment for speeched feedbacks 
    // function speak(inputValue) {
    //     // if already speaking
    //     if(SpeakSpeech.speaking) {
    //         console.error("Already Speaking...");
    //         return;
    //     }
    
    //     if(inputValue !== '') {
    //         // stop listening while speaking
    //         recognition.stop();

    //         const speakText = new SpeechSynthesisUtterance(inputValue);
            
    //         // on speak end
    //         speakText.onend = () => {
    //             console.log("Done Speaking...");

    //             recognition.start();
    //         }

    //         // on speak error
    //         speakText.onerror = (err) => {
    //             console.error(`Something went wrong...${err}`);
    //         }
        
    //         // select voice
    //         const selectedVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');
    //          //Loop through voices
    //          voices.forEach(voice => {
    //             if(voice.name == selectedVoice){
    //                 speakText.voice = voice;
    //             }
    //         });
    
    //         // Set pitch and rate
    //         // speakText.rate = rate.value;
    //         speakText.rate = 1;
    //         // speakText.pitch = pitch.value;
    //         speakText.pitch = 1;
        
    //         // speak
    //         SpeakSpeech.speak(speakText);
    //     }
    //     else {
    //         alert("Input field is empty!");
    //     }
    // }

    // EVENT LISTENERS FOR TEXT-TO-SPEECH
    // speak again on voice change
    // voiceSelect.addEventListener('change', e => {
    //     speak(commandInputField.value)
    // });
    // // Rate value change
    // rate.addEventListener('change', (e) => {
    //     rateValue.textContent = rate.value;
    //     speak(commandInputField.value);
    // });
    // // Pitch value change
    // pitch.addEventListener('change', (e) => {
    //     pitchValue.textContent = pitch.value;
    //     speak(commandInputField.value);
    // });

    // DEFINITIONS
    function count(string) {
        let counter = 1;
        const splitted = string.split(" ");

        if (splitted.length > 1) {
            for(let i = 1; i <= splitted.length; i++) {
                if (splitted[i - 1] === splitted[i]) {
                    counter = counter + 1;
                }
            }
            return [ counter, finalCommand(string) ];
        }
        return [ counter, finalCommand(string) ];
    }

    function finalCommand(string) {
        const splitted = string.split(" ")
        const command = splitted[0];

        // console.log("form final command", command);
        return command;
    }

    function sendToServer(obj) {
        const url = "http://localhost:5000/";
        // creating a new request
        let request = new Request(url, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: new Headers({
                "Content-Type": "application/json",

            })
        })
    
        // sending the request
        fetch(request)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => console.error(err))
    }
})();