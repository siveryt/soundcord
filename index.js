/** @format */
// Importing All node modules
const fs = require('fs')
const Discord = require('discord.js')
var stringSimilarity = require('string-similarity')
const uuidv1 = require('uuid/v1')
const getMP3Duration = require('get-mp3-duration')
let request = require(`request`)

// Defining constents for client, prefix, token etc
const client = new Discord.Client()
const invite = 'https://discord.com/api/oauth2/authorize?client_id=828596063749406740&permissions=808545344&scope=bot'
const { prefix, token } = require('./config.json')
const emojiList = ['🤪', '😜', '🤫', '🤥', '😈', '🤡', '💩', '👊', '🥷', '💆‍♂️', '💃', '🐌', '🫐', '♻️', '⚽️']
var cooldown = {}
var sounds = fs.readdirSync('./sounds/')

// Functions
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
  // Sets Presence of the Bot to "Playing with *help"
  client.user.setPresence({
    activity: { name: 'with *help' },
    status: 'online',
  })

  console.log('Ready!')
})

client.on('message', (message) => {
  // Adds space at the end of Message because of bugs.
  message.content = message.content + ' '
  // Constants for commandhandling
  const withoutPrefix = message.content.slice(prefix.length)
  const split = withoutPrefix.split(/ +/)
  const command = split[0]
  const args = split.slice(1)

  // Stops execution if sender is bot
  if (message.author.bot) return
  // Chechs if message starts with prfix
  if (!message.content.startsWith(prefix)) return
  // Checks if command is "*sounds"
  if (message.content.startsWith(prefix + 'sounds')) {
    // Checks if we're in a dm channel and if not deletes the message.
    if (message.channel.type != 'dm') {
      message.delete()
    }
    // Prepares The list of sounds
    var msg = '__Here is a list of all my sounds:__'
    sounds.forEach((sound) => {
      msg = msg + `\n${sound.replace('.mp3', '')}`
    })
    msg = msg + `\nHave fun! ${emojiList[Math.floor(Math.random() * emojiList.length)]}`
    // Sends message
    return message.author.send(msg)
  }
  // Checks if commands is "*sound" or "*-"
  if (message.content.startsWith(prefix + 'sound') || message.content.startsWith(prefix + '-')) {
    var sender = message.author

    //__ --------------- Configuration ---------------
    // Checks if command was executed in DMs
    if (message.channel.type === 'dm') {
      return message.reply("I can't execute that command inside DMs! " + emojiList[Math.floor(Math.random() * emojiList.length)])
    }
    // Checks if user has a cooldown and if he has, sends a message to the user. Otherwise add the user to the cooldown.
    if (cooldown[message.author.id] && cooldown[message.author.id] > parseInt(Date.now() / 1000) && message.author.id != 419828969588916225) {
      message.delete()
      return message.author.send("You can't spam this command! Please wait a little bit before using a command again! " + emojiList[Math.floor(Math.random() * emojiList.length)])
    } else {
      // Adds user to cooldown. How?: Gets current date and adds 30 secs ontop of it.
      cooldown[message.author.id] = parseInt(Date.now() / 1000) + 30
    }
    // Checks if soudncord is already set up on the server. If not notifies the sender.
    if (message.guild.roles.cache.find((role) => role.name === 'Soundcord user') == undefined) {
      return message.author.send(`Soundcord isn't setup yet on ${message.guild.name}. You can setup it, by typing \`*setup\` on the Server. Bye! ${emojiList[Math.floor(Math.random() * emojiList.length)]}`)
    }
    // Gets the role for this server
    let soundRole = message.guild.roles.cache.find((role) => role.name === 'Soundcord user')
    // Checks if sender has the role
    if (message.member.roles.cache.has(soundRole.id)) {
    } else {
      message.delete()
      return message.author.send(`You don't have the permission to use use Soundcord on ${message.guild.name}! :sob: You need to have the \`Soundcord user\` role. But if you invite me to your Server, you can do whatever you want!`)
    }

    //__ --------------- Custom Sounds ---------------
    // Generates Unique ID
    var nowid = uuidv1()
    if (message.attachments.first()) {
      //checks if an attachment is sent and downloads it.
      if (message.attachments.first()) {
        console.log(message.attachments.first().url)
        if (!message.attachments.first().url.endsWith('.mp3')) return message.author.send('You have to send me a mp3 file, so that i can play it in a voicechannel.')
        request
          .get(message.attachments.first().url)
          .on('error', console.error)
          .pipe(fs.createWriteStream('custom/' + nowid + '.mp3'))
        // set up the sound variable with the temporary sound
        var sound = 'custom/' + nowid + '.mp3'
      }
    } else {
      // if no attachment sent get text after command and searches for it in the soudns/ folder
      var sound = message.content.replace('*sound ', '').replace('*- ', '')
      sound = stringSimilarity.findBestMatch(sound + '.mp3', sounds)
      sound = sound.bestMatch.target
      sound = 'sounds/' + sound
    }
    // Checks how sure the typo correction was
    if (sound < 0.2) {
      return sender.send("We couldn't find the sound you're looking for. Please try an other. Get the full list with `*sounds` " + emojiList[Math.floor(Math.random() * emojiList.length)])
    }

    // Checks if user got mentioned and if yes, makes his/her to the target.
    if (getUserFromMention(args[args.length - 1]) == undefined) {
      var target = message.member
    } else {
      var target = message.guild.members.cache.get(getUserFromMention(args[args.length - 1]).id)
    }
    // Checks if target is in vc
    if (target.voice.channel == null) {
      if (target.id == sender.id) {
        return sender.send('You must be in a Voicechannel to play sounds. ' + emojiList[Math.floor(Math.random() * emojiList.length)])
      } else {
        return sender.send('The User you mentioned must be in a Voicechannel to play sounds. ' + emojiList[Math.floor(Math.random() * emojiList.length)])
      }
    }

    // creates the easy to read name for file
    var soundDisplay = sound.replace('sounds/', '')
    if (soundDisplay.startsWith('custom')) {
      soundDisplay = 'customSound'
    }
    // Gets the voice channel of target, plays the sound and leaves after the sound ahs ended. If custom mp3 file longer than 10 secs returns
    var voiceChannel = target.voice.channel
    message.delete({ timeout: 100 })
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection.play(sound)

        const buffer = fs.readFileSync(sound)
        const duration = getMP3Duration(buffer)
        if (duration > 10000 && sound.startsWith('custom')) {
          voiceChannel.leave()
          fs.unlink(sound, (err) => {
            if (err) {
              throw err
            }
          })

          return sender.send('Your custom mp3 file can only be up to 10 seconds long')
        }
        sender.send('You played *' + soundDisplay + '* in *' + message.member.voice.channel.name + '* ' + emojiList[Math.floor(Math.random() * emojiList.length)])

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
  // Cheks for help command
  if (message.content.startsWith(prefix + 'help')) {
    // Checks if channel type is dm and if not deletes message.
    if (message.channel.type != 'dm') {
      message.delete({ timeout: 100 })
    }
    // Send help
    message.author.send(`**Soundcord Help**\n If I'm new on you server, please set me up, by typing \`*setup\` \nUse \`*sound Sound_name\` to play a Sound in the channel you are currently in. You also can upload a mp3 file, which isn't longer than 5 seconds to play this mp3 file. As alternative to \`*sound\` you also can use \`*-\` and use the same functions as \`*sound\` uses. \n If you mention someone at the end of the command, you can play a sound in his channel, even if you aren't in the same Channel as he is (Great for pranks)\nA vilad command could look like this:\n \`*sound Meow @${message.author.username}\`\n`)
  }
  // Checks for setup command
  if (message.content.startsWith(prefix + 'setup')) {
    // Checks if channel type is dm and if not deletes message.
    if (message.channel.type != 'dm') {
      message.delete({ timeout: 100 })
    }
    // Checks if role already exists and if not creates role.
    if (message.guild.roles.cache.find((role) => role.name === 'Soundcord user') == undefined) {
      message.guild.roles.create({
        data: {
          name: 'Soundcord user',
          color: 'BLUE',
        },
        reason: 'Give the user which are allowed to use soundcord this role.',
      })
    }
    //  Sends response.
    message.author.send('Soundcord successfully installed! Have fun using it! ' + emojiList[Math.floor(Math.random() * emojiList.length)])
  }
  if (message.content.startsWith(prefix + 'invite')) {
    // Checks if channel type is dm and if not deletes message.
    if (message.channel.type != 'dm') {
      message.delete()
    }
    // Sends the inivte link
    message.author.send('Hey, if you want to invite me to your own Server, just click this link: ' + invite + ' ' + emojiList[Math.floor(Math.random() * emojiList.length)])
  }
})
// logs the bot in to discord
client.login(token)
