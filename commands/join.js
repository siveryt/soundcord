module.exports = {
    name: 'join',
    description: 'Joins you channel',
    args: false,
    usage: '',
    aliases: ['voice', 'notify'],
    guildOnly: true,
    cooldown: 20,
    execute(message, args) {
        var voiceChannel = message.guild.channels.cache.find(channel => channel.name === "notify");
        message.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play('./join.mp3');
            dispatcher.on("end", end => {
                voiceChannel.leave();
            });
        }).catch(err => console.log(err));

    }
};