//dc user token(not bot token)
const d_token = "<put-discord-user-token-here>";
//talk to userin which channel
const d_cid = "<channel-in-which-character-will-talk>";
//c.ai api key
const c_key = '<characterai-unofficial-key>';
//c.ai character id
const c_id = "<chracter-id>";
//for voice(experimental)(1 = enabled)
const voice = 0;

//discord user login
const Discord = require("discord-user-bots");
const client = new Discord.Client(d_token); // Login with the token given

//discord user started
// Executes this function when the client is ready
client.on.ready = function() { 
    console.log("Discord Connected sucessfully!"); 
};

//character ai api(unofficial)
const CharacterAI = require("node_characterai");
const characterAI = new CharacterAI();

//tts api
const { EdgeTTS } = require('node-edge-tts')

//mp3player
const { exec } = require('child_process');
const mp3FilePath = './speech.mp3';

// Build the ffplay command
const command = `ffplay -nodisp -autoexit ${mp3FilePath}`;

(async () => {
    // Authenticating as a guest (use `.authenticateWithToken()` to use an account)
    await characterAI.authenticateWithToken(c_key);

    // Place your character's id here
    const characterId = c_id;

    //continue or create chat with the desired character
    const chat = await characterAI.createOrContinueChat(characterId);

    // Executes this function when the client receives a message
    client.on.message_create = async function(message) { 
        console.log(message.content); // Logs the message

        // replies if the message is not sent by the bot itself
        if (message.author.id != client.info.user.id) {

            //displaying typing 
            client.type(
                d_cid // The channel ID to type in
            );

            //request answer from character api
            const response = await chat.sendAndAwaitResponse(message.content, true);
            
            // Stops typing
            client.stop_type(d_cid);

            //send reply
            client.send(d_cid, {
                content: response.text.toLowerCase(),
                }
            );
            
            if (voice == 1) {
                //gen audio
                const ttsasync = async function() {
                    const tts = new EdgeTTS({
                        voice: 'en-US-AvaNeural',
                        lang: 'en-US',
                        outputFormat: 'audio-24khz-96kbitrate-mono-mp3'
                    })
                    await tts.ttsPromise(response.text, './speech.mp3')
                }
                await ttsasync();
            
                //play audio
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                      console.error('Error playing the MP3 file:', error);
                      process.exit(1); // Exit with an error code
                    }
                    console.log("(^Voice SUCCESSFUL^)")
                    console.log("-----------------------------------------------------------------------------------------------------------------")
                    //console.log(`Playing: ${mp3FilePath}`);
                });
            }
        }
    };
})();