# MC-Whitelister

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://github.com/TriRealm/Valknut/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1383009209196613675?color=7289DA&label=Dev%20Discord)](https://discord.gg/EvYFUSpbVz)
[![Kofi](https://img.shields.io/badge/Kofi-Support_the_Dev-8755D6)](https://ko-fi.com/trirealm)

---

**MC-Whitelister** is a bot that listens and checks roles in discord servers and if a user has `X` role they can whitelist! once `X` role is removed their whitelist will be auto-removed.

This was made due to me wanting a Mod/Plugin/Bot that could handle MULTIPLE Communities to access onto the same server but I couldn't find any. So... I made it.

This bot allows you to have different Roles in each guild if they lable their subscription intergration roles differently to gain access and whitelist onto a minecraft server using the RCON connection.

---

## 🌟 Key Features

- **Auto-Whitelist and Un-Whitelist**  
  Does what it says on the tin.

- **Multi Discord Server Support**  
  Able to support/manage multiple discord servers and different roles.

---

## ⚙️ Setup Command Overview

| Subcommand / Option | Permissions | Description |
|--------------------|------------|-------------|
| `/whitelist` | **Server Owner** <br> Permission:<br> `Administrator` | Creates the embed in the channel the command was used with a button to allow users to whitelist themselves. |

---

## 📖 "/Config" Command Details

### `/whitelist`
- **Permissions:** Server Owner with `Administrator`  
- Creates the embed in the channel the command was used with a button to allow users to whitelist themselves.

# Remove a user from all mutual servers with the reason "GFX/Scam Artist"
/globalban @troublesomeUser GFX/Scam Artist
