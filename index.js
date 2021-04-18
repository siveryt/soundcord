/** @format */

const fs = require('fs')
const Discord = require('discord.js')
var stringSimilarity = require('string-similarity')
const uuidv1 = require('uuid/v1')
const getMP3Duration = require('get-mp3-duration')
const { prefix, token } = require('./config.json')
const client = new Discord.Client()
client.cooldowns = new Discord.Collection()
let request = require(`request`)
const invite = 'https://discord.com/api/oauth2/authorize?client_id=828596063749406740&permissions=808545344&redirect_uri=https%3A%2F%2Fsoundcord.sivery.de%2Finvite.html&scope=bot'
var cooldown = {}

const emojiList = ['🤪', '😜', '🤫', '🤥', '😈', '🤡', '💩', '👊', '🥷', '💆‍♂️', '💃', '🐌', '🫐', '♻️', '⚽️']

var sounds = fs.readdirSync('./sounds/')
function getUserFromMention(mention) {
  if (!mention) return

  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1)

    if (mention.startsWith('!')) {
      mention = mention.slice(1)
    }

    return client.users.cache.get(mention)
  }
}
client.once('ready', () => {
  client.user.setPresence({
    activity: { name: 'with *help' },
    status: 'online',
  })

  console.log('Ready!')
  console.log(Date.now())
})

client.on('message', (message) => {
  const withoutPrefix = message.content.slice(prefix.length)
  const split = withoutPrefix.split(/ +/)
  const command = split[0]
  const args = split.slice(1)

  if (message.author.bot) return
  if (!message.content.startsWith(prefix)) return

  if (message.content.startsWith(prefix + 'sound')) {
    if (message.channel.type === 'dm') {
      return message.reply("I can't execute that command inside DMs! " + emojiList[Math.floor(Math.random() * emojiList.length)])
    }
    if (cooldown[message.author.id]) {
      message.delete()
      return message.author.send("You can't spam this command! Please wait a little bit before using a command again! " + emojiList[Math.floor(Math.random() * emojiList.length)])
    } else {
      cooldown[message.author.id] = parseInt(Date.now() / 1000) + 30
    }

    if (message.guild.roles.cache.find((role) => role.name === 'Soundcord user') == undefined) {
      return message.author.send(`Soundcord isn't setup yet on ${message.guild.name}. You can setup it, by typing \`*setup\` on the Server. Bye! ${emojiList[Math.floor(Math.random() * emojiList.length)]}`)
    }

    let soundRole = message.guild.roles.cache.find((role) => role.name === 'Soundcord user')

    if (message.member.roles.cache.has(soundRole.id)) {
    } else {
      message.delete()
      return message.author.send(`You don't have the permission to use use Soundcord on ${message.guild.name}! :sob: But if you invite me to your Server, you can do whatever you want!`)
    }
    var nowid = uuidv1()

    if (message.attachments.first()) {
      //checks if an attachment is sent
      if (message.attachments.first()) {
        request
          .get(message.attachments.first().url)
          .on('error', console.error)
          .pipe(fs.createWriteStream('custom/' + nowid + '.mp3'))
        var sound = 'custom/' + nowid + '.mp3'
      }
    } else {
      var sound = message.content.replace('*sound ', '')
      sound = stringSimilarity.findBestMatch(sound + '.mp3', sounds)
      sound = sound.bestMatch.target
      sound = 'sounds/' + sound
    }
    var sender = message.author

    if (getUserFromMention(args[args.length - 1]) == undefined) {
      var target = message.member
    } else {
      var target = message.guild.members.cache.get(getUserFromMention(args[args.length - 1]).id)
    }

    if (sound < 0.2) {
      return sender.send("We couldn't find the sound you're looking for. Please try an other. get the full list at https://soundcord.sivery.de " + emojiList[Math.floor(Math.random() * emojiList.length)])
    }

    if (target.voice.channel == null) {
      if (target.id == sender.id) {
        return sender.send('You must be in a Voicechannel to play sounds. ' + emojiList[Math.floor(Math.random() * emojiList.length)])
      } else {
        return sender.send('The User you mentioned must be in a Voicechannel to play sounds. ' + emojiList[Math.floor(Math.random() * emojiList.length)])
      }
    }

    // return message.reply("VC: " + message.member.voice.id )

    var soundDisplay = sound.replace('sounds/', '')
    if (soundDisplay.startsWith('custom')) {
      soundDisplay = 'customSound'
    }

    sender.send('You played *' + soundDisplay + '* in *' + message.member.voice.channel.name + '* ' + emojiList[Math.floor(Math.random() * emojiList.length)])
    var voiceChannel = target.voice.channel
    message.delete({ timeout: 100 })
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection.play(sound)

        const buffer = fs.readFileSync(sound)
        const duration = getMP3Duration(buffer)

        setTimeout(function () {
          voiceChannel.leave()
          if (sound.startsWith('custom/')) {
            fs.unlink(sound, (err) => {
              if (err) {
                throw err
              }
            })
          }
        }, duration + 100)
      })
      .catch((err) => console.log(err))
  }

  if (message.content.startsWith(prefix + 'help')) {
    if (message.channel.type != 'dm') {
      message.delete({ timeout: 100 })
    }
    message.author.send(`**Soundcord Help**\nUse \`*sound Sound_name\` to play a Sound in the channel you are currently in. \n If you mention someone at the end of the command, you can play a sound in his channel, even if you aren't in the same Channel as he is (Great for pranks)\nA vilad command could look like this:\n \`*sound Meow @${message.author.username}\``)
  }
  if (message.content.startsWith(prefix + 'setup')) {
    if (message.channel.type != 'dm') {
      message.delete({ timeout: 100 })
    }
    if (message.guild.roles.cache.find((role) => role.name === 'Soundcord user') == undefined) {
      message.guild.roles.create({
        data: {
          name: 'Soundcord user',
          color: 'BLUE',
        },
        reason: 'I NEED THIS!!!',
      })
    }
    message.author.send('Soundcord successfully installed! Have fun using it! 🩳')
  }

  // do the same for the rest of the commands...
})

client.login(token)
