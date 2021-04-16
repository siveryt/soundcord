module.exports = {
    name: "raw",
    execute(message) {
        // connection.play('audio.mp3', { volume: 0.5 });
        var voiceChannel = message.guild.channels.cache.find(channel => channel.name === "notify");
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play('./audio.mp3');
            dispatcher.on("end", end => {
                voiceChannel.leave();
            });
        }).catch(err => console.log(err));
    }
}