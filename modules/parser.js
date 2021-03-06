const emojiRegex = require("emoji-regex/RGI_Emoji");

const {client} = require("./globals");

module.exports = {
    // Parses a user from a mention or directly from the id
    userFromMention: userFromMention,
    // Parses a member from a mention or directly from the id
    memberFromMention(mention, guild) {
        const user = userFromMention(mention);

        if (user && guild) {
            return guild.members.cache.get(user.id)
        }
    },
    // Parses a role from a mention or directly from the id
    roleFromMention(mention, guild) {
        if (mention && guild) {
            if (mention.startsWith("<@") && mention.endsWith(">")) {
                mention = mention.slice(2, -1);

                if (mention.startsWith("&")) {
                    mention = mention.slice(1);
                }
            }

            return guild.roles.cache.get(mention);
        }
    },
    // Parses a message from the id
    channelFromId(id, guild) {
        if (id && guild) {
            return guild.channels.cache.get(id);
        }
    },
    // Parses a message from the id
    async messageFromId(id, channel) {
        if (id && channel) {
            try {
                // Return fetched message
                return await channel.messages.fetch(id);
            } catch (ignored) {
                // Invalid channel
            }
        }
    },
    // Parses the emoji object from the emoji string
    stringToEmoji(string) {
        if (string) {
            // Try to find an available guild emoji
            const guildEmoji = client.emojis.cache.find(emoji => emoji.available && string ===
                (emoji.id === null ? emoji.name : `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`));

            if (guildEmoji) {
                return guildEmoji;
            }

            // Try to find an available unicode emoji
            const unicodeEmoji = emojiRegex().exec(string);

            if (unicodeEmoji && unicodeEmoji.length > 0) {
                return unicodeEmoji[0];
            }
        }
    },
    // Parses the emoji string from a emoji object
    stringFromEmoji(emoji) {
        // Check if emoji is a string already
        if (typeof emoji === "string") {
            return emoji;
        }

        return emoji.id === null ? emoji.name : `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
    },
    // Parses an array of strings into a json wrapped array of arrays of strings, which fit into the max message size
    arraySplit(message = [""]) {
        // Static vars
        const startString = "```json";
        const endString = "```";
        const maxLength = 2000;

        const reply = [];
        let currentMessage = [];
        let currentSum = 0;
        for (let newString of message) {
            // Add startString in the beginning
            if (!currentMessage || currentMessage.length <= 0 || !currentMessage[0].startsWith(startString)) {
                currentMessage[0] = startString;
                currentSum = startString.length + endString.length + 2;
            }

            if (currentSum + newString.length > maxLength) {
                // Add current string to message
                currentMessage.push(endString);
                reply.push(currentMessage);

                // Reset currentMessage
                currentMessage = [startString];
                currentSum = startString.length + 1;
            }

            currentMessage.push(newString);
            currentSum += newString.length + 1;
        }

        // Add closing markdown if necessary
        if (currentMessage && currentMessage.length > 1) {
            currentMessage.push(endString);
            reply.push(currentMessage);
        }

        return reply;
    }
};

function userFromMention(mention) {
    if (!mention) {
        return;
    }

    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        if (mention.startsWith("!")) {
            mention = mention.slice(1);
        }
    }

    const user = client.users.cache.get(mention);

    if (!user || user.bot) {
        return;
    }

    return user;
}
