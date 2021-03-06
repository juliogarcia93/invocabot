use('XML');
use('EventHandler')

// var net = require('net')                                                                          
// var client = net.connect(8080, 'localhost');                                                      

var ttsengine = "flite"; // TTS engine                                                                              
var ttsvoice = "slt"; // TTS voice                                                                                  
var ttstimer = "soft"; // TTS timer type   

var invocabot = false; // keeps track of whether last command was invocabot or not
var appointmentsCreated = 0;

function ttsSpeak (session, phrase) {
	session.speak(ttsengine, ttsvoice, phrase, ttstimer);
}

function halfVolume(session, type, data, arg) {
	return ( "volume:+2");
}


function onInput(session, type, data, arg) {
try {
	var ttsengine = "flite"; // TTS engine                                                                      
	var ttsvoice = "slt"; // TTS voice                                                                          
	var ttstimer = "soft"; // TTS timer type                                                                   

	var body = data.getBody();
	body = body.replace(/<\?.*?\?>/g, '');
	var xml = new XML("<xml>" + body + "</xml>");
	var result = xml.getChild('result');
	var command = "";
        
//        session.execute("speak", "Call initiated");

	if (result)
	{
		command = result.getChild('interpretation').getChild('input').data;
		command.replace("INVOCABOT1", "INVOCABOT");
		command.replace("INVOCABOT2", "INVOCABOT");
		command.replace("INVOCABOT3", "INVOCABOT");
		command.replace("INVOCABOT4", "INVOCABOT");
		command.replace("INVOCABOT5", "INVOCABOT");
		command.replace("INVOCABOT6", "INVOCABOT");
		command.replace("INVOCABOT7", "INVOCABOT");
	        console_log("CONSOLE", command);
		if (command.indexOf('INVOCABOT') > -1 && !invocabot) {
			session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_s2.wav");
			invocabot = true;
		}
		else if (command != "") {
			//session.execute("sleep", "2000");
			// newCommand = command.slice(10);
			if (invocabot) {
			        session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav");
				session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_e2.wav");
				invocabot = false;
				e = new Event("custom", "message");
				e.addBody(session.uuid + " " + command);
				e.fire();
				if (command.indexOf('APPOINTMENT') > -1 || command.indexOf('MEETING') > -1 || command.indexOf('SET UP') > -1) {
				    var time = "";
				    if (command.indexOf('ONE') > -1)
					time = "ONE";
				    if (command.indexOf('TWO') > -1)
					time = "TWO";
				    if (command.indexOf('THREE') > -1)
					time = "THREE";
				    if (command.indexOf('FOUR') > -1)
					time = "FOUR";
				    if (command.indexOf('FIVE') > -1)
					time = "FIVE";
				    if (command.indexOf('SIX') > -1)
					time = "SIX";
				    if (command.indexOf('SEVEN') > -1)
					time = "SEVEN";
				    if (command.indexOf('EIGHT') > -1)
					time = "EIGHT";
				    if (command.indexOf('NINE') > -1)
					time = "NINE";
				    if (command.indexOf('TEN') > -1)
					time = "TEN";
				    if (command.indexOf('ELEVEN') > -1)
					time = "ELEVEN";
				    if (command.indexOf('TWELVE') > -1)
					time = "TWELVE";
				    
				    var person = "";
				    if (command.indexOf('BOB') > -1)
					person = "BOB";
				    
				    if (person == "" && time == "")
					ttsSpeak(session, "I have successfully scheduled your appointment");
				    else if (person != "" && time == "")
					ttsSpeak(session, "I have successfully scheduled your appointment with " + person);
				    else if (person == "" && time != "")
					ttsSpeak(session, "I have successfully scheduled your appointment at " + time);
				    else
					ttsSpeak(session, "I have successfully scheduled your appointment with " + person + " at " + time);
				    appointmentsCreated = appointmentsCreated + 1;
				}
				if (command.indexOf('SCRATCH') > -1) {
				    if (appointmentsCreated == 0)
					ttsSpeak(session, "There are no appointments to be deleted.");
				    else {
					ttsSpeak(session, "I have deleted your last appointment.");
					appointmentsCreated = appointmentsCreated - 1;
				    }

				}
			    			
			}
		}

		session.execute("detect_speech", "resume");
	}
} catch(err) { 
    console_log("CONSOLE", "ERROR");
    session.execute("detect_speech", "resume"); 
}
	return( false );
}

function bridgeCallback ( session, type, dtmf, user_data) {
	console_log("CONSOLE", "BEGINNING VOICE RECOGNITION");
	session.streamFile(argv[0], onInput);
	return true;
}

/***************** Begin Program *****************/
var targetnumber = "";
var gateway = "gw_outbound";
var originate_options = "ignore_early_media=true";

var eh = new EventHandler('ALL');
var evt;

//session.execute("record_session", "/tmp/foo.wav");

outSession = new Session("{"+originate_options+"}sofia/gateway/"+gateway+"/"+targetnumber);



if (session.ready()){
	session.answer();
//        session.execute("avmd", "start");
	session.execute("detect_speech", "pocketsphinx invocabot invocabot");
	session.execute("divert_events", "on");

	if (outSession.ready()) {
	    outSession.answer();
	    ttsSpeak(outSession, "The call is currently being recorded");
	    console_log("CONSOLE", "The call is currently being recorded");
	    bridge(session, outSession, onInput);


	while (session.ready()) {
		session.streamFile(argv[0], onInput); 
	    session.execute("detect_speech", "resume");
//	   evt = eh.getEvent(60000);
//	   if (evt){
//       		consoleLog('info', 'Got event: ' + evt.serialize() + '\n');
//   		}
	}
	}
}
