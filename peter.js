use('XML');
use('EventHandler')

function ttsSpeak (session, phrase) {
  session.speak(ttsengine, ttsvoice, phrase, ttstimer);
}

var ttsengine = "flite"; // TTS engine 
var ttsvoice = "slt"; // TTS voice      
var ttstimer = "soft"; // TTS timer type

//Answer the call
if(session.ready()) {
    session.answer()
    ttsSpeak(session, "Hello capstone team");

    var buff = "***REMOVED***";
    route = "sofia/gateway/gw_outbound/"+buff;
    session.execute("bridge", route);
    session.waitForAnswer(5000);
    console_log("notice", "Disconnect cause: " + session.cause + "\n");
    
    session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/silence.wav", onInput);

}

function onInput(session, type, data, arg) {
        console_log("CONSOLE", "Command In Progress: " + commandInProgress);
        session.execute("set", "tts_engine=flite");
        session.execute("set", "tts_voice=awb");

        var body = data.getBody();
        body = body.replace(/<\?.*?\?>/g, '');
        var xml = new XML("<xml>" + body + "</xml>");
        var result = xml.getChild('result');
        var command = "";
        session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_s.wav", onInput);
        if (result)
        {
            command = result.getChild('interpretation').getChild('input').data;
            session.execute("speak", command);
            session.streamFile("/usr/local/freeswitch/sounds/en/us/invocabot/siri_e.wav", onInput);
        }
}


