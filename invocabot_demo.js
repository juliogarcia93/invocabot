use('XML');
use('EventHandler')

var ttsengine = "flite"; // TTS engine                                        
var ttsvoice = "slt"; // TTS voice                                                 
//var ttstimer = "soft"; // TTS timer type   

var invocabot = false; // keeps track of whether last command was invocabot or not
var appointmentsCreated = 0;
var events = [];

function ttsSpeak (session, phrase) {
	session.speak(ttsengine, ttsvoice, phrase);
}

function onInput(session, type, data, arg) {
	try {
		var body = data.getBody();
		body = body.replace(/<\?.*?\?>/g, '');
		var xml = new XML("<xml>" + body + "</xml>");
		var result = xml.getChild('result');
		var command = "";

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
		        //DETECTED INVOCABOT KEYWORD & CURRENT COMMAND NOT IN PROGRESS
			if (command.indexOf('INVOCABOT') > -1 && !invocabot) {
			        console_log("CONSOLE", "INVOCABOT");
				session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_s2.wav");
				invocabot = true;
			}
		        //COMMAND NOT EMPTY
			else if (command != "") {
			    console_log("CONSOLE", command);
			    if (invocabot) {
					session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_e2.wav");
					invocabot = false;

					e = new Event("custom", "message");
					e.addBody(session.uuid + " " + command);
					e.fire();
				    
					if (command.indexOf('SCHEDULE') > -1 || command.indexOf('APPOINTMENT') > -1 || command.indexOf('MEETING') > -1 || command.indexOf('SET') > -1 || command.indexOf('LIST') > -1 || command.indexOf('SCRATCH') > -1 ) {
					        //console_log("CONSOLE", command);
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
						if (command.indexOf('HENRY') > -1)
							person = "HENRY";

						if (person != "" && time == "") {
							ttsSpeak(session, "I have successfully scheduled your appointment with " + person);
							events.push("Appointment with " + person);
						}
						else if (person == "" && time != "") {
							ttsSpeak(session, "I have successfully scheduled your appointment at " + time);
							events.push("Appointment at " + time);
						}
						else {
							ttsSpeak(session, "I have successfully scheduled your appointment with " + person + " at " + time);
							events.push("Appointment at " + time + " with " + person);
						}
					        console_log("CONSOLE", "APPOINTMENT CREATED");
						appointmentsCreated = appointmentsCreated + 1;
					}
					else if (command.indexOf('SCRATCH') > -1) {
						if (appointmentsCreated == 0) {
						    ttsSpeak(session, "There are no appointments to be deleted.");
						}
						else {
							ttsSpeak(session, "I have deleted your last appointment.");
							appointmentsCreated = appointmentsCreated - 1;
						}
					        console_log("CONSOLE", "SCRATCH THAT");
					}
					else if (command.indexOf('LIST') > -1) {
					    console_log("CONSOLE", "LISTING EVENTS NOW");
					    for (i = 0; i < events.length; i++) {
						console_log("CONSOLE", events[i]);
						ttsSpeak(session, events[i]);
					    }	
					} 

				} 
			}
		}
	    session.execute("detect_speech", "resume");
	} catch(err) { 
		console_log("CONSOLE", "ERROR");
		session.execute("detect_speech", "resume"); 
	}
	return( true );
}

/***************** Begin Program *****************/
var targetnumber = "***REMOVED***";
var gateway = "gw_outbound";
var originate_options = "ignore_early_media=true";

session.execute("record_session", "/tmp/foo.wav");

outSession = new Session("{"+originate_options+"}sofia/gateway/"+gateway+"/"+targetnumber);



//if (session.ready()){
//	session.answer();
//	if (outSession.ready() && session.ready()) {	    
//		outSession.answer();
//		ttsSpeak(outSession, "The call is currently being recorded");
//		console_log("CONSOLE", "The call is currently being recorded");
//		session.execute("detect_speech", "pocketsphinx invocabot invocabot");
//	        bridge(session, outSession, onInput);
//	}
//}



if (session.ready()){
        session.answer();                                                                                                                       
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
            }
        }
}

