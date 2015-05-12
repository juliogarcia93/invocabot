use('XML');
use('EventHandler')

// var net = require('net')                                                                          
// var client = net.connect(8080, 'localhost');                                                      

var ttsengine = "flite"; // TTS engine                                                                              
var ttsvoice = "slt"; // TTS voice                                                                                  
var ttstimer = "soft"; // TTS timer type   

var invocabot = false; // keeps track of whether last command was invocabot or not

function ttsSpeak (session, phrase) {
	session.speak(ttsengine, ttsvoice, phrase, ttstimer);
}

function halfVolume(session, type, data, arg) {
	return ( "volume:-2");
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
		if (command.indexOf('INVOCABOT') > -1 && !invocabot) {
			session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_s.wav", halfVolume);
			invocabot = true;
		}
		else if (command != "") {
			//session.execute("sleep", "2000");
			// newCommand = command.slice(10);
			if (invocabot) {
				session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_e.wav", halfVolume);
				invocabot = false;
				e = new Event("custom", "message");
				e.addBody(session.uuid + " " + command);
				e.fire();

				if (command.indexOf('APPOINTMENT') > -1 || command.indexOf('MEETING')) {
					ttsSpeak(session, "I have successfully scheduled your appointment.")
				}
				if (command.indexOf('SCRATCH') > -1) {
					ttsSpeak(session, "I have deleted your last appointment.")
				}
			}
		}

		session.execute("detect_speech", "resume");
	}
	return( false );
}

function bridgeCallback ( session, type, dtmf, user_data) {
	console_log("CONSOLE", "BEGINNING VOICE RECOGNITION");
	//session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput);
	return false;
}

/***************** Begin Program *****************/
var targetnumber = "***REMOVED***";
var gateway = "gw_outbound";
var originate_options = "ignore_early_media=true";

var eh = new EventHandler('ALL');
var evt;

session.execute("record_session", "/tmp/foo.wav");

//outSession = new Session("{"+originate_options+"}sofia/gateway/"+gateway+"/"+targetnumber);



if (session.ready()){
	session.answer();
	session.execute("sleep", "5000");
	session.execute("detect_speech", "pocketsphinx invocabot invocabot");
	session.execute("divert_events", "on");

	//	if (outSession.ready()) {
	//     outSession.answer();
	//bridge(session, outSession, bridgeCallback);
	// ttsSpeak(outSession, "The call is currently being recorded");
	//    console_log("CONSOLE", "The call is currently being recorded");

	while (session.ready()) {
		session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput); 
	   evt = eh.getEvent(60000);
	   if (evt){
       		consoleLog('info', 'Got event: ' + evt.serialize() + '\n');
   		}
	}
}
