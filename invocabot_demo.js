use('XML');
use('EventHandler')

function onInput(session, type, data, arg) {
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
    e = new Event("custom", "message");
    e.addBody(command);
    e.fire();
	    
 	session.execute("detect_speech", "resume");	    
    return( true );
}

/***************** Begin Program *****************/
if (session.answer()){

	session.execute("sleep", "5000");
	session.execute("detect_speech", "pocketsphinx invocabot invocabot");
	session.execute("divert_events", "on");

	while ( session.ready( )) {
		session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput);
	}
}
