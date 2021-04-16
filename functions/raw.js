module.exports = {
    name: "raw",
    execute(raw) {
        if (['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
        client.channels.get(packet.d.channel_id).message.send("Hiii");
    }
}