import { system, world, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, GameMode, PlayerPermissionLevel, Entity, Player, Dimension } from "@minecraft/server";
import { ActionFormData, CustomForm, MessageBox, MessageFormData, ModalFormData, ObservableBoolean, ObservableString } from "@minecraft/server-ui";

///$F
function $FblockTpChecker($subject: Player, $target: string, $fromx: number, $fromy: number, $fromz: number, $fromDim: Dimension) {
    let $blockCheck1 = world.getDimension("minecraft:overworld").getBlock({ x: $fromx + 1, y: $fromy, z: $fromz })?.type.id;
    let $blockCheck2 = world.getDimension("minecraft:overworld").getBlock({ x: $fromx - 1, y: $fromy, z: $fromz })?.type.id;
    let $blockCheck3 = world.getDimension("minecraft:overworld").getBlock({ x: $fromx, y: $fromy, z: $fromz + 1 })?.type.id;
    let $blockCheck4 = world.getDimension("minecraft:overworld").getBlock({ x: $fromx, y: $fromy, z: $fromz - 1 })?.type.id;
    switch ($target) {
        case $blockCheck1:
            $subject.teleport({ x: $fromx + 1, y: $fromy + 1, z: $fromz }, { dimension: $fromDim });
            //console.warn("OK debug 1");
            break;
        case $blockCheck2:
            $subject.teleport({ x: $fromx - 1, y: $fromy + 1, z: $fromz }, { dimension: $fromDim });
            //console.warn("OK debug 2");
            break;
        case $blockCheck3:
            $subject.teleport({ x: $fromx, y: $fromy + 1, z: $fromz + 1 }, { dimension: $fromDim });
            //console.warn("OK debug 3");
            break;
        case $blockCheck4:
            $subject.teleport({ x: $fromx, y: $fromy + 1, z: $fromz - 1 }, { dimension: $fromDim });
            //console.warn("OK debug 4");
            break;
        default:
            $subject.teleport({ x: $fromx, y: $fromy + 1, z: $fromz - 2 }, { dimension: $fromDim });
        //console.warn("OK debug Default" + $blockCheck1 + $blockCheck2 + $blockCheck3 + $blockCheck4);
    }
    ;
}
;
///
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerEnum("dd:about", ["about"]);
    customCommandRegistry.registerCommand({
        name: "dd:ddisabler",
        description: "Enable or disable the restriction.",
        permissionLevel: CommandPermissionLevel.Any,
        cheatsRequired: false,
        optionalParameters: [
            { name: "dd:about", type: CustomCommandParamType.Enum },
        ],
    }, (origin) => {
        let $mainform = new ActionFormData();
        $mainform.title("Dimension Disabler Menu");
        $mainform.body("Select an Option");
        $mainform.button("Nether");
        $mainform.button("End");
        $mainform.button("Status");
        let $netherMenu = new ModalFormData();
        $netherMenu.title("Nether Restrictions");
        $netherMenu.toggle("Enable Restriction?", { defaultValue: Boolean(world.getDynamicProperty("dd:isNetherEnabled")), tooltip: "Enables movement and gamemode restriction on the Nether" });
        $netherMenu.toggle("Enable Teleporting back?", { defaultValue: Boolean(world.getDynamicProperty("dd:netherTpToggle")), tooltip: "Enables teleporting back to the overworld" });
        $netherMenu.textField("Time until teleport:", String(world.getDynamicProperty("dd:netherTimer")), { defaultValue: String(world.getDynamicProperty("dd:netherTimer")) });
        $netherMenu.toggle("Show Message?", { defaultValue: Boolean(world.getDynamicProperty("dd:netherMsgToggle")), tooltip: "Enables showing the restriction message" });
        $netherMenu.textField("Time until show messsage:", String(world.getDynamicProperty("dd:netherMsgTimer")), { defaultValue: String(world.getDynamicProperty("dd:netherMsgTimer")) });
        $netherMenu.textField("Message to show:", String(world.getDynamicProperty("dd:netherMsg")), { defaultValue: String(world.getDynamicProperty("dd:netherMsg")) });
        let $endMenu = new ModalFormData();
        $endMenu.title("End Restrictions");
        $endMenu.toggle("Enable Restriction?", { defaultValue: Boolean(world.getDynamicProperty("dd:isEndEnabled")), tooltip: "Enables movement and gamemode restriction on the End" });
        $endMenu.toggle("Enable Teleporting back?", { defaultValue: Boolean(world.getDynamicProperty("dd:endTpToggle")), tooltip: "Enables teleporting back to the overworld" });
        $endMenu.textField("Time until teleport:", String(world.getDynamicProperty("dd:endTimer")), { defaultValue: String(world.getDynamicProperty("dd:endTimer")) });
        $endMenu.toggle("Show Message?", { defaultValue: Boolean(world.getDynamicProperty("dd:endMsgToggle")), tooltip: "Enables showing the restriction message" });
        $endMenu.textField("Time until show messsage:", String(world.getDynamicProperty("dd:endMsgTimer")), { defaultValue: String(world.getDynamicProperty("dd:endMsgTimer")) });
        $endMenu.textField("Message to show:", String(world.getDynamicProperty("dd:endMsg")), { defaultValue: String(world.getDynamicProperty("dd:endMsg")) });
        let $statusMenu = new MessageFormData();
        $statusMenu.title("Restriction Status ");
        $statusMenu.body("RESTRICTION STATUS:\n\n"
            + "Nether: " + world.getDynamicProperty("dd:isNetherEnabled") + "\n"
            + "Teleport: " + world.getDynamicProperty("dd:netherTpToggle") + "\n"
            + "Teleport timer: " + world.getDynamicProperty("dd:netherTimer") + " seconds." + "\n"
            + "Message: " + world.getDynamicProperty("dd:netherMsg") + "\n"
            + "Message timer: " + world.getDynamicProperty("dd:netherMsgTimer") + " seconds." + "\n\n"
            + "End: " + world.getDynamicProperty("dd:isEndEnabled") + "\n"
            + "Teleport: " + world.getDynamicProperty("dd:endTpToggle") + "\n"
            + "Teleport timer: " + world.getDynamicProperty("dd:endTimer") + " seconds." + "\n"
            + "Message: " + world.getDynamicProperty("dd:endMsg") + "\n"
            + "Message timer: " + world.getDynamicProperty("dd:endMsgTimer") + " seconds." + "\n\n"
            + "Addon made by: Redmond Limited Co.");
        $statusMenu.button1("Done");
        $statusMenu.button2("Someone got stuck?");
        ///
        let $player: Player = origin.sourceEntity as Player;
        if ($player.playerPermissionLevel === PlayerPermissionLevel.Operator) {

            system.run(() => {

                /// NETHER FORM

                let $netherMainToggle = new ObservableBoolean(Boolean(world.getDynamicProperty("dd:isNetherEnabled")), {clientWritable: true});
                $netherMainToggle.subscribe(()=>{
                    world.setDynamicProperty("dd:isNetherEnabled", $netherMainToggle.getData());
                    if ($netherMainToggle.getData() === false) {$netherTpToggle.setData(false); 
                        $netherMsgToggle.setData(false);
                    }});

                let $netherTpToggle = new ObservableBoolean(Boolean(world.getDynamicProperty("dd:netherTpToggle")), {clientWritable: true});
                $netherTpToggle.subscribe(()=>{
                    world.setDynamicProperty("dd:netherTpToggle", $netherTpToggle.getData());
                });
                let $netherTpTime = new ObservableString(String(world.getDynamicProperty("dd:netherTimer")), {clientWritable: true});
                $netherTpTime.subscribe(()=>{
                    world.setDynamicProperty("dd:netherTimer", $netherTpTime.getData());
                });
                let $netherMsgToggle = new ObservableBoolean(Boolean(world.getDynamicProperty("dd:netherMsgToggle")), {clientWritable: true})
                $netherMsgToggle.subscribe(()=>{
                    world.setDynamicProperty("dd:netherMsgToggle", $netherMsgToggle.getData());
                });
                let $netherMsgTimer = new ObservableString(String(world.getDynamicProperty("dd:netherMsgTimer")), {clientWritable: true});
                $netherMsgTimer.subscribe(()=>{
                    world.setDynamicProperty("dd:netherMsgTimer", $netherMsgTimer.getData());
                });
                let $netherMsg = new ObservableString(String(world.getDynamicProperty("dd:netherMsg")), {clientWritable: true});
                $netherMsg.subscribe(()=>{
                    world.setDynamicProperty("dd:netherMsg", $netherMsg.getData());
                });

                let $netherForm = new CustomForm($player, "The Nether settings");
                $netherForm.toggle("Enable restriction?", $netherMainToggle, {description: "Turns ON/OFF the restriction."});
                $netherForm.toggle("Enable teleport.", $netherTpToggle, {visible: $netherMainToggle, description: "Enables the teleporting back to the overworld."});
                $netherForm.textField("Time until teleport:", $netherTpTime, {visible: $netherTpToggle, description: "Time in seconds until the teleport happens."});
                $netherForm.toggle("Show message.",$netherMsgToggle, {visible: $netherMainToggle, description: "Enables the message to the players who joins the dimension."});
                $netherForm.textField("Time until show the message:", $netherMsgTimer, {visible: $netherMsgToggle, description: "Time in seconds until the message shows."});
                $netherForm.textField("Message to show:", $netherMsg, {visible: $netherMsgToggle, description: 'Write the message to show, you can use "§" for text formatting.'});
                $netherForm.closeButton();

                ///END FORM

                let $endMainToggle = new ObservableBoolean(Boolean(world.getDynamicProperty("dd:isEndEnabled")), {clientWritable: true});
                $endMainToggle.subscribe(()=>{
                    world.setDynamicProperty("dd:isEndEnabled", $endMainToggle.getData());
                    if ($endMainToggle.getData() === false) {$endTpToggle.setData(false); 
                        $endMsgToggle.setData(false);
                    }});

                let $endTpToggle = new ObservableBoolean(Boolean(world.getDynamicProperty("dd:endTpToggle")), {clientWritable: true});
                $endTpToggle.subscribe(()=>{
                    world.setDynamicProperty("dd:endTpToggle", $endTpToggle.getData());
                });
                let $endTpTime = new ObservableString(String(world.getDynamicProperty("dd:endTimer")), {clientWritable: true});
                $endTpTime.subscribe(()=>{
                    world.setDynamicProperty("dd:endTimer", $endTpTime.getData());
                });
                let $endMsgToggle = new ObservableBoolean(Boolean(world.getDynamicProperty("dd:endMsgToggle")), {clientWritable: true})
                $endMsgToggle.subscribe(()=>{
                    world.setDynamicProperty("dd:endMsgToggle", $endMsgToggle.getData());
                });
                let $endMsgTimer = new ObservableString(String(world.getDynamicProperty("dd:endMsgTimer")), {clientWritable: true});
                $endMsgTimer.subscribe(()=>{
                    world.setDynamicProperty("dd:endMsgTimer", $endMsgTimer.getData());
                });
                let $endMsg = new ObservableString(String(world.getDynamicProperty("dd:endMsg")), {clientWritable: true});
                $endMsg.subscribe(()=>{
                    world.setDynamicProperty("dd:endMsg", $endMsg.getData());
                });

                let $endForm = new CustomForm($player, "The End settings");
                $endForm.toggle("Enable restriction?", $endMainToggle, {description: "Turns ON/OFF the restriction."});
                $endForm.toggle("Enable teleport.", $endTpToggle, {visible: $endMainToggle, description: "Enables the teleporting back to the overworld."});
                $endForm.textField("Time until teleport:", $endTpTime, {visible: $endTpToggle, description: "Time in seconds until the teleport happens."});
                $endForm.toggle("Show message.",$endMsgToggle, {visible: $endMainToggle, description: "Enables the message to the players who joins the dimension."});
                $endForm.textField("Time until show the message:", $endMsgTimer, {visible: $endMsgToggle, description: "Time in seconds until the message shows."});
                $endForm.textField("Message to show:", $endMsg, {visible: $endMsgToggle, description: 'Write the message to show, you can use "§" for text formatting.'});
                $endForm.closeButton();
            
                /// OTHER DIMENSIONS FORM

                ///STATUS FORM

                let $statusForm = new CustomForm($player, "Restriction Status");
                $statusForm.divider();
                $statusForm.label(
                    "Nether: " + world.getDynamicProperty("dd:isNetherEnabled") + "\n"
                    + "Teleport: " + world.getDynamicProperty("dd:netherTpToggle") + "\n"
                    + "Teleport timer: " + world.getDynamicProperty("dd:netherTimer") + " seconds." + "\n"
                    + "Message: " + world.getDynamicProperty("dd:netherMsg") + "\n"
                    + "Message timer: " + world.getDynamicProperty("dd:netherMsgTimer") + " seconds."
                );
                $statusForm.divider();
                $statusForm.label(
                    "End: " + world.getDynamicProperty("dd:isEndEnabled") + "\n"
                     + "Teleport: " + world.getDynamicProperty("dd:endTpToggle") + "\n"
                    + "Teleport timer: " + world.getDynamicProperty("dd:endTimer") + " seconds." + "\n"
                    + "Message: " + world.getDynamicProperty("dd:endMsg") + "\n"
                    + "Message timer: " + world.getDynamicProperty("dd:endMsgTimer") + " seconds."
                );
                $statusForm.spacer();
                $statusForm.divider();
                $statusForm.label(
                    "Addon made by: Redmond Limited Co."
                );

                /// MAIN FORM
                
                let $newform = new CustomForm($player, "Dimension Disabler");
                $newform.label("Select an option:");
                $newform.divider();
                $newform.button("The Nether.", ()=>{$newform.close(); system.runTimeout(()=>{$netherForm.show().then(()=>{$newform.show()})}, 1)});
                $newform.button("The End.", ()=>{$newform.close(); system.runTimeout(()=>{$endForm.show().then(()=>{$newform.show()})}, 1)});
                $newform.button("Other dimensions. (Soon..)", (()=>{}));
                $newform.button("Status.", ()=>{$newform.close(); system.runTimeout(()=>{$statusForm.show().then(()=>{$newform.show()})}, 1)});
                $newform.divider();
                $newform.show();
                /*$mainForm.show($player).then(r => {
                    if (r.canceled)
                        return;
                    let $selected = r.selection;
                    switch ($selected) {
                        case 0:
                            $netherMenu.show($player).then((r) => {
                                if (r.canceled)
                                    return;
                                let [$mainToggle, $tpToggle, $tpTimer, $msgToggle, $msgTimer, $msg] = r.formValues;
                                //console.warn($mainToggle, $tpToggle, $tpTimer, $msgToggle, $msgTimer, $msg);
                                world.setDynamicProperty("dd:isNetherEnabled", Boolean($mainToggle));
                                world.setDynamicProperty("dd:netherTpToggle", Boolean($tpToggle));
                                if (!isNaN(Number($tpTimer))) {
                                    world.setDynamicProperty("dd:netherTimer", Number($tpTimer));
                                }
                                else {
                                    $player.sendMessage("§l[dDisaber]>>§r§c You put text inside the Nether tp timer field.");
                                }
                                ;
                                world.setDynamicProperty("dd:netherMsgToggle", Boolean($msgToggle));
                                if (!isNaN(Number($msgTimer))) {
                                    world.setDynamicProperty("dd:netherMsgTimer", Number($msgTimer));
                                }
                                else {
                                    $player.sendMessage("§l[dDisaber]>>§r§c You put text inside the Nether message timer field.");
                                }
                                ;
                                world.setDynamicProperty("dd:netherMsg", String($msg));
                            });
                            break;
                        case 1:
                            $endMenu.show($player).then((r) => {
                                if (r.canceled)
                                    return;
                                let [$mainToggle, $tpToggle, $tpTimer, $msgToggle, $msgTimer, $msg] = r.formValues;
                                //console.warn($mainToggle, $tpToggle, $tpTimer, $msgToggle, $msgTimer, $msg);
                                world.setDynamicProperty("dd:isEndEnabled", Boolean($mainToggle));
                                world.setDynamicProperty("dd:endTpToggle", Boolean($tpToggle));
                                if (!isNaN(Number($tpTimer))) {
                                    world.setDynamicProperty("dd:endTimer", Number($tpTimer));
                                }
                                else {
                                    $player.sendMessage("§l[dDisaber]>>§r§c You put text inside the Nether tp timer field.");
                                }
                                ;
                                world.setDynamicProperty("dd:endMsgToggle", Boolean($msgToggle));
                                if (!isNaN(Number($msgTimer))) {
                                    world.setDynamicProperty("dd:endMsgTimer", Number($msgTimer));
                                }
                                else {
                                    $player.sendMessage("§l[dDisaber]>>§r§c You put text inside the Nether message timer field.");
                                }
                                ;
                                world.setDynamicProperty("dd:endMsg", String($msg));
                            });
                            break;
                        case 2:
                            $statusMenu.show($player).then((r) => {
                                if (r.canceled || r.selection === 0) { }
                                ;
                                if (r.selection === 1 && world.getDynamicProperty("dd:isEndEnabled") === true) {
                                    let $op_location = $player.location;
                                    let $op_dimension = $player.dimension;
                                    let $end_players = world.getDimension("minecraft:the_end").getPlayers();
                                    $end_players.forEach(n => { n.teleport($op_location, { dimension: $op_dimension }); });
                                }
                                ;
                                if (r.selection === 1 && world.getDynamicProperty("dd:isNetherEnabled") === true) {
                                    let $op_location = $player.location;
                                    let $op_dimension = $player.dimension;
                                    world.getDimension("minecraft:nether").getPlayers().forEach(Player => { Player.teleport($op_location, { dimension: $op_dimension }); });
                                }
                                ;
                            });
                            break;
                    }
                    ;
                });*/
            });
        }
        else {
            return {
                status: CustomCommandStatus.Failure,
                message: "§l[dDisaber]>>§r§c Permission error"
            };
        }
        ;
    });
});
world.afterEvents.worldLoad.subscribe(() => {
    if (world.getDynamicProperty("dd:version") === undefined || world.getDynamicProperty("dd:version") !== "1.3.0") {
        world.setDynamicProperty("dd:version", "1.3.0");
        world.setDynamicProperty("dd:isNetherEnabled", true);
        world.setDynamicProperty("dd:isEndEnabled", true);
        world.setDynamicProperty("dd:netherMsg", "You are not allowed to enter the Nether.");
        world.setDynamicProperty("dd:endMsg", "You are not allowed to enter the End.");
        world.setDynamicProperty("dd:netherTimer", 6);
        world.setDynamicProperty("dd:endTimer", 6);
        world.setDynamicProperty("dd:netherMsgToggle", true);
        world.setDynamicProperty("dd:netherMsgTimer", 2);
        world.setDynamicProperty("dd:endMsgToggle", true);
        world.setDynamicProperty("dd:endMsgTimer", 2);
        world.setDynamicProperty("dd:netherTpToggle", true);
        world.setDynamicProperty("dd:endTpToggle", true);
        console.warn("resseting values");
    }
    ;
});
world.afterEvents.playerSpawn.subscribe((eventData) => {
    if (eventData.player.getDynamicProperty("dd:teleported") === "nether" || "end") {
        let $resCheck = eventData.player.getDynamicProperty("dd:isRestricted");
        let $tpPendantCheck = eventData.player.getDynamicProperty("dd:isTpPendant");
        let $posx = Number(eventData.player.getDynamicProperty("dd:fromLocX"));
        let $posy = Number(eventData.player.getDynamicProperty("dd:fromLocY"));
        let $posz = Number(eventData.player.getDynamicProperty("dd:fromLocZ"));
        let $dim = world.getDimension("minecraft:overworld");
        if ($resCheck === true) {
            eventData.player.inputPermissions.setPermissionCategory(2, false);
        }
        ;
        if ($tpPendantCheck === "nether" && world.getDynamicProperty("dd:netherTpToggle") === true) {
            eventData.player.teleport({ x: $posx, y: $posy, z: $posz }, { dimension: $dim });
        }
        ;
        if ($tpPendantCheck === "end" && world.getDynamicProperty("dd:endTpToggle") === true) {
            eventData.player.teleport({ x: $posx, y: $posy + 2, z: $posz }, { dimension: $dim });
            system.runTimeout(() => {
                $FblockTpChecker(eventData.player, "minecraft:end_portal_frame", $posx, $posy, $posz, $dim);
            }, 5);
        }
        ;
    }
    ;
});
world.afterEvents.playerDimensionChange.subscribe((eventData) => {
    const player = eventData.player;
    const $from = eventData.fromDimension.id;
    const $fromDim = eventData.fromDimension;
    const $fromLoc = eventData.fromLocation;
    const $fromx = eventData.fromLocation.x;
    const $fromy = eventData.fromLocation.y;
    const $fromz = eventData.fromLocation.z;
    const $to = eventData.toDimension.id;
    let $version = world.getDynamicProperty("dd:version");
    let $netherEnabled = Boolean(world.getDynamicProperty("dd:isNetherEnabled"));
    let $endEnabled = Boolean(world.getDynamicProperty("dd:isEndEnabled"));
    let $netherMsg = String(world.getDynamicProperty("dd:netherMsg"));
    let $endMsg = String(world.getDynamicProperty("dd:endMsg"));
    let $endTimer = Number(world.getDynamicProperty("dd:endTimer"));
    let $netherTimer = Number(world.getDynamicProperty("dd:netherTimer"));
    let $netherMsgTimer = Number(world.getDynamicProperty("dd:netherMsgTimer"));
    let $endMsgTimer = Number(world.getDynamicProperty("dd:endMsgTimer"));
    let $netherTpToggle = Boolean(world.getDynamicProperty("dd:netherTpToggle"));
    let $endTpToggle = Boolean(world.getDynamicProperty("dd:endTpToggle"));
    let $netherMsgToggle = Boolean(world.getDynamicProperty("dd:netherMsgToggle"));
    let $endMsgToggle = Boolean(world.getDynamicProperty("dd:endMsgToggle"));
    player.setDynamicProperty("dd:teleported", true);
    if ($from === "minecraft:overworld" && $to === "minecraft:nether" || $to === "minecraft:the_end") {
        // Nether Restrictions
        if ($netherEnabled === true && $to === "minecraft:nether") {
            eventData.player.inputPermissions.setPermissionCategory(2, false);
            eventData.player.setGameMode(GameMode.Spectator);
            eventData.player.setDynamicProperty("dd:isRestricted", true);
        }
        ;
        if ($netherTpToggle === true && $to === "minecraft:nether") {
            player.setDynamicProperty("dd:isTpPendant", "nether");
            player.setDynamicProperty("dd:fromLocX", $fromx);
            player.setDynamicProperty("dd:fromLocY", $fromy);
            player.setDynamicProperty("dd:fromLocZ", $fromz);
            system.runTimeout(() => {
                player.teleport($fromLoc, { dimension: $fromDim });
            }, $netherTimer * 20);
        }
        ;
        if ($netherMsgToggle === true && $to === "minecraft:nether") {
            system.runTimeout(() => {
                eventData.player.onScreenDisplay.setActionBar($netherMsg);
            }, $netherMsgTimer * 20);
        }
        ;
        /// End Restrictions
        if ($endEnabled === true && $to === "minecraft:the_end") {
            eventData.player.inputPermissions.setPermissionCategory(2, false);
            eventData.player.setGameMode(GameMode.Spectator);
            eventData.player.setDynamicProperty("dd:isRestricted", true);
        }
        ;
        if ($endTpToggle === true && $to === "minecraft:the_end") {
            player.setDynamicProperty("dd:isTpPendant", "end");
            player.setDynamicProperty("dd:fromLocX", $fromx);
            player.setDynamicProperty("dd:fromLocY", $fromy);
            player.setDynamicProperty("dd:fromLocZ", $fromz);
            system.runTimeout(() => {
                player.teleport({ x: $fromx, y: $fromy + 2, z: $fromz }, { dimension: $fromDim });
                system.runTimeout(() => {
                    $FblockTpChecker(player, "minecraft:end_portal_frame", $fromx, $fromy, $fromz, $fromDim);
                }, 5);
            }, $endTimer * 20);
        }
        ;
        if ($endMsgToggle === true && $to === "minecraft:the_end") {
            system.runTimeout(() => {
                eventData.player.onScreenDisplay.setActionBar($endMsg);
            }, $endMsgTimer * 20);
        }
        ;
    }
    ;
    if ($to === "minecraft:overworld" && $from === "minecraft:nether" || $from === "minecraft:the_end") {
        eventData.player.inputPermissions.setPermissionCategory(2, true);
        eventData.player.setGameMode(GameMode.Survival);
        eventData.player.setDynamicProperty("dd:isRestricted", false);
        player.setDynamicProperty("dd:isTpPendant", false);
    }
    ;
});
