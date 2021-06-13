/**
 * @name TogglableBadges
 * @author pog fish
 * @authorId 783404330573234216
 * @version 1.3.0
 * @description Allows you to toggle certain badges
 * @source https://github.com/Gabe616/TogglableBadges/blob/master/TogglableBadges.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Gabe616/TogglableBadges/master/TogglableBadges.plugin.js
 * @website https://github.com/Gabe616/TogglableBadges
 * @invite thedevs
*/
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

const TogglableBadges = (() => {
  const config = {
    "main": "index.js",
    "info": {
      "name": "Togglable Badges",
      "authors": [
        {
          "name": "pog fish",
          "discord_id": "783404330573234216",
          "github_username": "Gabe616"
        }
      ],
      "version": "1.3.0",
      "description": "Allows you to toggle certain badges",
      "github": "https://github.com/Gabe616/TogglableBadges/blob/master/TogglableBadges.plugin.js",
      "github_raw": "https://raw.githubusercontent.com/Gabe616/TogglableBadges/master/TogglableBadges.plugin.js",
      "icon_folder": "https://raw.githubusercontent.com/Gabe616/TogglableBadges/master/icons/"
    },
    "changelog": [
      {
        "title": "Bug Fixes",
        "type": "fixed",
        "items": ["The plugin actually saves shit"]
      },
      {
        "title": "TODO",
        "type": "improved",
        "items": ["Nitro badges"]
      }
    ]
  };

  return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
      const plugin = (Plugin, Library) => {
        const {Logger, Patcher, Settings} = Library;

        return class TogglableBadges extends Plugin {
          constructor() {
            super();
            this.badges = {
STAFF:                       { label: "Staff", value: 1 << 0 },
DISCORD_PARTNER:             { label: "Discord Partner", value: 1 << 1 },
HYPESQUAD_EVENTS:            { label: "Hypesquad Events", value: 1 << 2 },
BUGHUNTER_LVL_1:             { label: "Bughunter Level 1", value: 1 << 3 },
HOUSE_BRAVERY:               { label: "Hypesquad House of Bravery", value: 1 << 6 },
HOUSE_BRILLIANCE:            { label: "Hypesquad House of Brilliance", value: 1 << 7 },
HOUSE_BALANCE:               { label: "Hypesquad House of Balance", value: 1 << 8 },
EARLY_SUPPORTER:             { label: "Early Supporter", value: 1 << 9 },
BUGHUNTER_LVL_2:             { label: "Bughunter Level 2", value: 1 << 14 },
EARLY_VERIFIED_DEVELOPER:    { label: "Early Verified Developer", value: 1 << 17 },
DISCORD_CERTIFIED_MODERATOR: { label: "Discord Certified Moderator", value: 1 << 18 }
            }
            let lol = {};
            for (let i = 0; i < Object.keys(this.badges).length; i++) {
              let k = Object.keys(this.badges)[i];
              lol[k.toLowerCase()] = false;
            }
            this.defaultSettings = {
              badges: lol
            }
          }

          onStart() {
            this.updateFlags();
          }

          onStop() {
            this.updateFlags();
          }

          updateFlags() {
            let webpack = Object.values(window.webpackJsonp.push([ [], { [''] : (_, e, r) => { e.cache = r.c }}, [ [''] ] ] ).cache);
            let user = webpack.find(m => m.exports && m.exports.default && !!m.exports.default.getCurrentUser).exports.default.getCurrentUser();
            user.flags = Object.keys(this.settings.badges).filter(k => !!this.settings.badges[k]).map(a => this.badges[a.toUpperCase()].value).reduce((a, b) => a | b, 0);
          }

          getSettingsPanel(collapseStates = {}) {
            /*const panel = this.buildSettingsPanel();
            panel.append(this.buildSetting({
              title: "Badges:",
              children: Object.keys(this.badges).map(key => ({
                type: "Switch",
                plugin: this,
                keys: ["badges", key],
                label: this.badges[key].label,
                value: this.settings.badges[key],
                labelChildren: [
									BDFDB.ReactUtils.createElement("img", {style: {width: 28, height: 28}, src: config.info.icon_folder + key})
								]
              }))
            }));
            return panel.getElement();

            return BDFDB.PluginUtils.createSettingsPanel(this, {
              collapseStates,
              children: () => {
                let panel = [];

                panel.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
                  title: "Badges:",
                  children: Object.keys(this.badges).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
                    type: "Switch",
                    plugin: this,
                    keys: ["badges", key],
                    label: this.badges[key].label,
                    value: this.settings.badges[key],
                    labelChildren: [
                      BDFDB.ReactUtils.createElement("img", {style: {width: 28, height: 28}, src: config.info.icon_folder + key})
                    ]
                  }))
                }));

                return panel;
              }
            });*/

            
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
              new Settings.SettingGroup("Badges").append(...Object.keys(this.badges).map(key => {
                let a = this.badges[key];
                return new Settings.Switch(a.label, "", this.settings.badges[key.toLowerCase()], (e) => {
                  this.settings.badges[key.toLowerCase()] = e;
                  this.updateFlags();
                });
              }))
            );
          }
        }
      }
      return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();

/*@end@*/