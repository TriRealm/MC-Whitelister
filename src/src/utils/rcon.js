const { Rcon } = require("rcon-client");

module.exports = {
    async sendRconCommand(command) {
        try {
            const rcon = await Rcon.connect({
                host: "MC_SERVER_IP_HERE",
                port: RCON_PORT_HERE,
                password: "RCON_PASSWORD_HERE"
            });

            const response = await rcon.send(command);
            rcon.end();
            return response;

        } catch (err) {
            console.error("RCON Error:", err);
            return null;
        }
    }
};
