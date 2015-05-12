use('XML');
use('EventHandler')

// var net = require('net')                                                                          
// var client = net.connect(8080, 'localhost');                                                      

var ttsengine = "flite"; // TTS engine                                                                              
var ttsvoice = "slt"; // TTS voice                                                                                  
var ttstimer = "soft"; // TTS timer type   

function ttsSpeak (session, phrase) {
  session.speak(ttsengine, ttsvoice, phrase, ttstimer);
}


function onInput(session, type, data, arg) {

        var ttsengine = "flite"; // TTS engine                                                                      
        var ttsvoice = "slt"; // TTS voice                                                                          
        var ttstimer = "soft"; // TTS timer type                                                                   

        var body = data.getBody();
        body = body.replace(/<\?.*?\?>/g, '');
        var xml = new XML("<xml>" + body + "</xml>");
        var result = xml.getChild('result');
        var command = "";
        if (result)
        {
            command = result.getChild('interpretation').getChild('input').data;
    	    if (command.indexOf('INVOCABOT') > -1) {
    		  session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_s.wav");
    	    }
        }
        if (command != "") {
        //session.execute("sleep", "2000");
        // session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_e.wav");
        // var newCommand = "";
        // newCommand = command.slice(10);
        console_log("CONSOLE", "Command: " + command);
        // if (command != "" )
        // {
        //     ttsSpeak(session, command);
        // }

        e = new Event("custom", "message");
        e.addBody(command);
        e.fire();

        session.execute("detect_speech", "resume");
    }
    return( false );
}

function bridgeCallback ( session, type, dtmf, user_data) {
        session.execute("sleep", "5000");
        console_log("CONSOLE", "BEGINNING VOICE RECOGNITION");
        while (session.ready()) {
          session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput); 
        }
}

/***************** Begin Program *****************/
var targetnumber = "***REMOVED***";
var gateway = "gw_outbound";
var originate_options = "ignore_early_media=true";

session.execute("record_session", "/tmp/foo.wav")

outSession = new Session("{"+originate_options+"}sofia/gateway/"+gateway+"/"+targetnumber);

if (session.ready()){
        session.answer();
        session.execute("sleep", "5000");
        session.execute("detect_speech", "pocketsphinx invocabot invocabot");
        session.execute("divert_events", "on");
        
        // if (outSession.ready()) {
        //     outSession.answer();
        bridge(session, outSession, bridgeCallback);
	    ttsSpeak(outSession, "The call is currently being recorded");
        
	}
    
    //     while (session.ready() && outSession.ready()) {
		  // session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput); 
    //     }
}
