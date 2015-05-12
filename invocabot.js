use('XML');
use('EventHandler')

// var net = require('net')
// var client = net.connect(8080, 'localhost');

var commandInProgress = false;

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
	    session.execute("speak", command);
	    session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/beep.wav", onInput);
	}

}

/***************** Begin Program *****************/
if (session.answer()){
        session.execute("sleep", "5000");
        session.execute("detect_speech", "pocketsphinx invocabot invocabot");
        session.execute("divert_events", "on");
        while ( session.ready( )) {
            //session.execute("set", "tts_engine=flite");                                                                                                                                               
            //session.execute("set", "tts_voice=slt");                                                                                                                                                  
            //session.execute("speak", "This is an example of flite text to speech engine.");                                                                                                           
            //session.execute("set", "playback_terminators=#");                                                                                                                                         
            session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput);
        }
}
