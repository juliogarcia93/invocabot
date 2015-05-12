use('XML');
use('EventHandler')

// var net = require('net')
// var client = net.connect(8080, 'localhost');

var commandInProgress = true;

function onInput(session, type, data, arg) {
    console_log("CONSOLE", "Command In Progress: " + commandInProgress);
	session.execute("set", "tts_engine=flite");
        session.execute("set", "tts_voice=awb");
	
	var body = data.getBody();
	body = body.replace(/<\?.*?\?>/g, ''); 
	var xml = new XML("<xml>" + body + "</xml>"); 
	var result = xml.getChild('result');
	var command = "";
	if (result)
	{
		command = result.getChild('interpretation').getChild('input').data;
	}
    
        session.execute("speak", command);

        if (!commandInProgress) {
	    console_log("CONSOLE", "PROCESSING COMMAND")
            var commandArray = command.split(" ");
            if (commandArray.length > 0) {
		for (var wordIndex = 0; wordIndex < commandArray; wordIndex++){
		    if (commandArray[wordIndex] == "INVOCABOT"){
			commandInProgress = true;
		    }
		}
	    }
	    console_log("CONSOLE", "DONE PROCESSING");
	    if (commandInProgress) {
		//Command Input Started
		console_log("CONSOLE", "INVOCABOT DETECTED: COMMAND RECOGNITION IN PROGRESS");
		session.execute("speech_detect", "pause");
		session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/bleep_begin.wav", onInput);
		session.execute("speech_detect", "resume");
	    }
	} else {
	    session.execute("speak", command);
	    // client.write(command);
	    //session.execute("global_setvar", "command=" + command);
	    e = new Event("custom", "message");
	    e.addBody(command);
	    e.fire();

	    console_log("CONSOLE", "INVOCABOT END");
	    console_log("CONSOLE", "YOU SAID: " + command);
	    
	   // session.execute("speech_detect", "pause");
	    //session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/bleep_end.wav", onInput);
            session.execute("speech_detect", "resume");
	    //commandInProgress = false;	    
	}
    return( true );
}

function bridgeCallback ( session, type, dtmf, user_data) {
	return true;
}

/*
   function onCommandSuccessful(){
   var handler = new EventHandler('CommandProcessed');
   var event;
   while ((event = handler.getEvent(600000))) {
   console_log("info", "Command Processed Successfully");
   }
   }*/


/***************** Begin Program *****************/
if (session.answer()){
	//session.speak("cepstral","David","Hello from FreeSwitch");
	//session.execute("record_session", "/tmp/foo.wav");
	session.execute("sleep", "5000");
	session.execute("detect_speech", "pocketsphinx invocabot invocabot");
	session.execute("divert_events", "on");
	//     onCommandSuccessful();
	// var callee = new Session("sofia/gateway/gw_outbound/***REMOVED***");
	// bridge(session, callee, bridgeCallback, "");
	while ( session.ready( )) {
		//session.execute("set", "tts_engine=flite");
                //session.execute("set", "tts_voice=slt");
                //session.execute("speak", "This is an example of flite text to speech engine.");
                //session.execute("set", "playback_terminators=#");
		session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput);
	}
}
