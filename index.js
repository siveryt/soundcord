const fs = require('fs');
const Discord = require('discord.js');
var stringSimilarity = require('string-similarity');
const getMP3Duration = require('get-mp3-duration');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

var sounds = fs.readdirSync('./sounds/');
function getUserFromMention(mention) {
  if (!mention) return;

  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1);

    if (mention.startsWith('!')) {
      mention = mention.slice(1);
    }

    return client.users.cache.get(mention);
  }
}
client.once('ready', () => {
  client.user.setActivity('sich selbst', { type: 'LISTENING' });
  console.log('Ready!');
});

client.on('message', (message) => {
  const withoutPrefix = message.content.slice(prefix.length);
  const split = withoutPrefix.split(/ +/);
  const command = split[0];
  const args = split.slice(1);

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  if (message.content.startsWith(prefix + 'sound')) {
    var sound = message.content.replace('*sound ', '');
    sound = stringSimilarity.findBestMatch(sound + '.mp3', sounds);
    sound = sound.bestMatch.target;

    var sender = message.author;

    if (getUserFromMention(args[args.length - 1]) == undefined) {
      var target = message.member;
    } else {
      var target = message.guild.members.cache.get(
        getUserFromMention(args[args.length - 1]).id
      );
    }

    console.log(target);

    if (sound < 0.2) {
      return sender.send(
        "We couldn't find the sound you're looking for. Please try an other. get the full list at https://soundcord.sivery.de"
      );
    }

    if (message.channel.type === 'dm') {
      return message.reply("I can't execute that command inside DMs!");
    }

    if (target.voice.channel == null) {
      if (target.id == sender.id) {
        return sender.send('You must be in a Voicechannel to play sounds.');
      } else {
        return sender.send(
          'The User you mentioned must be in a Voicechannel to play sounds.'
        );
      }
    }

    // return message.reply("VC: " + message.member.voice.id )

    sender.send(
      'You played *' +
        sound +
        '* in *' +
        message.member.voice.channel.name +
        '*'
    );
    var voiceChannel = target.voice.channel;
    message.delete({ timeout: 100 });
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection.play('./sounds/' + sound);

        const buffer = fs.readFileSync('./sounds/' + sound);
        const duration = getMP3Duration(buffer);

        setTimeout(function () {
          voiceChannel.leave();
        }, duration + 100);
      })
      .catch((err) => console.log(err));
  }

  if (message.content.startsWith(prefix + 'help')) {
    if (message.channel.type != 'dm') {
      message.delete({ timeout: 100 });
    }
    message.author.send(
      `**Soundcord Help**\nUse \`*sound Sound_name\` to play a Sound in the channel you are currently in. \n If you mention someone at the end of the command, you can play a sound in his channel, even if you aren't in the same Channel as he is (Great for pranks)\nA vilad command could look like this:\n \`*sound Meow @${message.author.username}\``
    );
  }

  // do the same for the rest of the commands...
});

client.login(token);
