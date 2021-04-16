module.exports = {
    name: 'ping',
    description: 'Ping!',
    args: false,
    usage: '<user> <role>',
    aliases: ['pong', 'test'],
    guildOnly: true,
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Pong.');
    },
};