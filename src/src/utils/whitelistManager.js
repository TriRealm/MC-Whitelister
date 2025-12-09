const fs = require("fs");
const path = require("path");

const storePath = path.join(__dirname, "..", "whitelistStore.json");
let store = fs.existsSync(storePath) ? JSON.parse(fs.readFileSync(storePath)) : {};
const { sendRconCommand } = require("./rcon");


function saveStore() {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

// REQUIRED ROLES PER GUILD
const allowedRoles = {
    "605777191325925387": [ // The Hollow
        "1333055102323265577", // Role: Fledgelings
        "1333055102323265578",  // Role: Tier 1
        "1333055102323265579",  // Role: Tier 2
        "1333055102323265580",  // Role: Tier 3
        "605778471762788354",  // Role: V.I.P
        "1447006523606827115",  // Role: Game Access
        "1369095840534237204" // Role: Staff
        //"1367362877744349266" // Role: Testing Role
    ],

    "966171098821582868": [ // The Aquarium
        "1159385479741968404", // Role: Twitch Subscriber
        "1159385479741968405",  // Role: Tier 1
        "1159385479741968410",  // Role: Tier 2
        "1159385481134481428",  // Role: Tier 3
        "966171964198756363",  // Role: Staff
        "1373916462418497578"  // Role: YouTube Member
        //"1374550283375480922" // Role: Testing Role
    ]
};

module.exports = async function runWhitelistCheck(client) {
    for (const guildId of Object.keys(store)) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;

        const rolesNeeded = allowedRoles[guildId];
        if (!rolesNeeded) continue;

        for (const userId of Object.keys(store[guildId])) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) continue;

            console.log(`Checking whitelist for ${member.user.tag} in guild ${guild.name}`);
            //console.log(`Required roles: ${rolesNeeded}`);
            //console.log(`Member roles:`, member.roles.cache.map(r => r.id));

            const hasRole = rolesNeeded.some(roleId => member.roles.cache.has(roleId));

            console.log(`Has required role?`, hasRole);

            if (!hasRole) {
                const mcName = store[guildId][userId].mcName;
                console.log(`Removing whitelist for: ${mcName}`);
                await sendRconCommand(`whitelist remove ${mcName}`);

                delete store[guildId][userId];
                saveStore();

                const logChannel = guild.channels.cache.get("LOG-CHANNEL-ID-HERE");
                if (logChannel) {
                    logChannel.send(`❌ Removed **${mcName}** from whitelist (lost required role).`);
                }
            }
        }
    }
};

