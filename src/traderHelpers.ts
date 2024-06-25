import { DependencyContainer } from "tsyringe";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { ITraderBase, ITraderAssort } from "@spt-aki/models/eft/common/tables/ITrader";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { FluentAssortConstructor as FluentAssortCreator } from "./fluentTraderAssortCreator";
import { Money } from "@spt-aki/models/enums/Money";
import * as baseJson from "../db/base.json";

import { VFS } from "@spt-aki/utils/VFS";
import { jsonc } from "jsonc";
import path from "path";
import { Price } from "./Price";


export class TraderHelper
{

    // getRandomInt(3) returns 0, 1, or 2
    protected getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

     /**
     * Add profile picture to our trader
     * @param baseJson json file for trader (db/base.json)
     * @param preAkiModLoader mod loader class - used to get the mods file path
     * @param imageRouter image router class - used to register the trader image path so we see their image on trader page
     * @param traderImageName Filename of the trader icon to use
     */
     public registerProfileImage(baseJson: any, modName: string, preAkiModLoader: PreAkiModLoader, imageRouter: ImageRouter, traderImageName: string): void
     {
         // Reference the mod "res" folder
         const imageFilepath = `./${preAkiModLoader.getModPath(modName)}res`;
 
         // Register a route to point to the profile picture - remember to remove the .jpg from it
         imageRouter.addRoute(baseJson.avatar.replace(".jpg", ""), `${imageFilepath}/${traderImageName}`);
     }

    /**
     * Add record to trader config to set the refresh time of trader in seconds (default is 60 minutes)
     * @param traderConfig trader config to add our trader to
     * @param baseJson json file for trader (db/base.json)
     * @param refreshTimeSecondsMin How many seconds between trader stock refresh min time
     * @param refreshTimeSecondsMax How many seconds between trader stock refresh max time
     */
    public setTraderUpdateTime(traderConfig: ITraderConfig, baseJson: any, refreshTimeSecondsMin: number, refreshTimeSecondsMax: number): void
    {
        // Add refresh time in seconds to config
        const traderRefreshRecord: UpdateTime = {
            traderId: baseJson._id,
            seconds: {
                min: refreshTimeSecondsMin,
                max: refreshTimeSecondsMax
            } };

        traderConfig.updateTime.push(traderRefreshRecord);
    }

    /**
     * Add our new trader to the database
     * @param traderDetailsToAdd trader details
     * @param tables database
     * @param jsonUtil json utility class
     */
    // rome-ignore lint/suspicious/noExplicitAny: traderDetailsToAdd comes from base.json, so no type
    public addTraderToDb(traderDetailsToAdd: any, tables: IDatabaseTables, jsonUtil: JsonUtil): void
    {
        // Add trader to trader table, key is the traders id
        tables.traders[traderDetailsToAdd._id] = {
            assort: this.createAssortTable(), // assorts are the 'offers' trader sells, can be a single item (e.g. carton of milk) or multiple items as a collection (e.g. a gun)
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)) as ITraderBase, // Deserialise/serialise creates a copy of the json and allows us to cast it as an ITraderBase
            questassort: {
                started: {},
                success: {},
                fail: {}
            } // questassort is empty as trader has no assorts unlocked by quests
        };
    }

    /**
     * Create basic data for trader + add empty assorts table for trader
     * @param tables SPT db
     * @param jsonUtil SPT JSON utility class
     * @returns ITraderAssort
     */
    private createAssortTable(): ITraderAssort
    {
        // Create a blank assort object, ready to have items added
        const assortTable: ITraderAssort = {
            nextResupply: 0,
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        }

        return assortTable;
    }


     /**
     * Add basic items to trader
     * @param tables SPT db
     * @param traderId Traders id (basejson/_id value)
     */
     public addSingleItemsToTrader(tables: IDatabaseTables, traderId: string, assortCreator: FluentAssortCreator, container: DependencyContainer, logger: ILogger) : void {

        const vfs = container.resolve<VFS>("VFS")
        const config = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")))

        const SEALED_WEAPON_CASE_ID = "a_sealed_weapon_gamble";
        const WALLET_GAMBLE_ID = "ba_wallet_gamble";
        const KEY_GAMBLE_ID = "bb_key_gamble";
        const KEYCARD_GAMBLE_ID = "bc_keycard_gamble";
        const MELEE_GAMBLE_ID = "bd_melee_weapon_gamble";
        const STIM_GAMBLE_ID = "be_stim_gamble";
        const FIFTY_FIFTY_GAMBLE_ID = "z_50/50_gamble";
        const GUN_GAMBLE_ID = "w_weapon_gamble";
        const BACKPACK_GAMBLE_ID = "wr_backpack_gamble";
        const HELMET_GAMBLE_ID = "x_helmet_gamble";
        const HEADSET_GAMBLE_ID = "xy_headset_gamble";
        const ARMOR_GAMBLE_ID = "w_armor_gamble";
        const PREMIUM_ARMOR_GAMBLE_ID = "w_premium_armor_gamble";
        const PREMIUM_GUN_GAMBLE_ID = "wa_premium_weapon_gamble";
        const SEVEN_SIX_TWO_BY_TWO_FIVE_GAMBLE_ID = "a_7.62x25_gamble";
        const NINE_BY_ONE_EIGHT_GAMBLE_ID = "a_9x18_gamble";
        const NINE_BY_ONE_NINE_GAMBLE_ID = "a_9x19_gamble";
        const NINE_BY_TWO_ONE_GAMBLE_ID = "a_9x21_gamble";
        const THREE_FIVE_SEVEN_GAMBLE_ID = "a_.357_gamble";
        const FOUR_FIVE_GAMBLE_ID = "a_.45_gamble";
        const FOUR_SIX_BY_THREE_ZERO_GAMBLE_ID = "a_4.6x30_gamble";
        const FIVE_SEVEN_BY_TWO_EIGHT_GAMBLE_ID = "a_5.7x28_gamble";
        const FIVE_FOUR_FIVE_BY_THREE_NINE_GAMBLE_ID = "a_5.45x39_gamble";
        const FIVE_FIVE_SIX_BY_FOUR_FIVE_GAMBLE_ID = "a_5.56x45_gamble";
        const THREE_ZERO_ZERO_GAMBLE_ID = "a_.300_gamble";
        const SEVEN_SIX_TWO_BY_THREE_NINE_GAMBLE_ID = "a_7.62x39_gamble";
        const SEVEN_SIX_TWO_BY_FIVE_ONE_GAMBLE_ID = "a_7.62x51_gamble";
        const SEVEN_SIX_TWO_BY_FIVE_FOUR_GAMBLE_ID = "a_7.62x54_gamble";
        const THREE_THREE_EIGHT_GAMBLE_ID = "a_.338_gamble";
        const NINE_BY_THREE_NINE_GAMBLE_ID = "a_9x39_gamble";
        const THREE_SIX_SIX_GAMBLE_ID = "a_.366_gamble";
        const ONE_TWO_SEVEN_BY_FIVE_FIVE_GAMBLE_ID = "a_12.7x55_gamble";
        const ONE_TWO_BY_SEVEN_ZERO_GAMBLE_ID = "a_12/70_gamble";
        const TWO_ZERO_BY_SEVEN_ZERO_GAMBLE_ID = "a_20/70_gamble";
        const TWO_THREE_BY_SEVEN_FIVE_GAMBLE_ID = "a_23x75_gamble";
        

        const price = new Price(container, config, logger)
        const newPrices = price.getPrices()
        

        assortCreator.createSingleAssortItem(WALLET_GAMBLE_ID)
                                .addStackCount(config.wallet_stock)
                                .addBuyRestriction(config.wallet_stock)
                                .addMoneyCost(Money.ROUBLES, (config.wallet_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(KEY_GAMBLE_ID)
                                .addStackCount(config.key_stock)
                                .addBuyRestriction(config.key_stock)
                                .addMoneyCost(Money.ROUBLES, (config.key_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(STIM_GAMBLE_ID)
                                .addStackCount(config.stimulant_stock)
                                .addBuyRestriction(config.stimulant_stock)
                                .addMoneyCost(Money.ROUBLES, (config.stimulant_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(KEYCARD_GAMBLE_ID)
                                .addStackCount(config.keycard_stock)
                                .addBuyRestriction(config.keycard_stock)
                                .addMoneyCost(Money.ROUBLES, (config.keycard_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(FIFTY_FIFTY_GAMBLE_ID)
                                .addStackCount(config.fiftyfity_stock)
                                .addBuyRestriction(config.fiftyfity_stock)
                                .addMoneyCost(Money.ROUBLES, (config.fiftyfity_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(SEALED_WEAPON_CASE_ID)
                                .addStackCount(config.sealed_case_stock)
                                .addBuyRestriction(config.sealed_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.sealed_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(MELEE_GAMBLE_ID)
                                .addStackCount(config.melee_stock)
                                .addBuyRestriction(config.melee_stock)
                                .addMoneyCost(Money.ROUBLES, (config.melee_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(GUN_GAMBLE_ID)
                                .addStackCount(config.gun_case_stock)
                                .addBuyRestriction(config.gun_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.gun_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(HELMET_GAMBLE_ID)
                                .addStackCount(config.helmet_case_stock)
                                .addBuyRestriction(config.helmet_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.helmet_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(ARMOR_GAMBLE_ID)
                                .addStackCount(config.armor_case_stock)
                                .addBuyRestriction(config.armor_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.armor_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(PREMIUM_ARMOR_GAMBLE_ID)
                                .addStackCount(config.premium_armor_case_stock)
                                .addBuyRestriction(config.premium_armor_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.premium_armor_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(PREMIUM_GUN_GAMBLE_ID)
                                .addStackCount(config.premium_gun_case_stock)
                                .addBuyRestriction(config.remium_gun_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.premium_gun_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(BACKPACK_GAMBLE_ID)
                                .addStackCount(config.backpack_case_stock)
                                .addBuyRestriction(config.backpack_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.backpack_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(HEADSET_GAMBLE_ID)
                                .addStackCount(config.headset_case_stock)
                                .addBuyRestriction(config.headset_case_stock)
                                .addMoneyCost(Money.ROUBLES, (config.headset_case_price * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        /*
        assortCreator.createSingleAssortItem(SEVEN_SIX_TWO_BY_TWO_FIVE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["7.62x25_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["7.62x25_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["7.62x25_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        */
        assortCreator.createSingleAssortItem(NINE_BY_ONE_EIGHT_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["9x18_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["9x18_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["9x18_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(NINE_BY_ONE_NINE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["9x19_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["9x19_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["9x19_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(NINE_BY_TWO_ONE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["9x21_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["9x21_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["9x21_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(THREE_FIVE_SEVEN_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds[".357_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds[".357_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds[".357_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(FOUR_FIVE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds[".45_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds[".45_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds[".45_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(FOUR_SIX_BY_THREE_ZERO_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["4.6x30_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["4.6x30_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["4.6x30_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(FIVE_SEVEN_BY_TWO_EIGHT_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["5.7x28_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["5.7x28_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["5.7x28_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(FIVE_FOUR_FIVE_BY_THREE_NINE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["5.45x39_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["5.45x39_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["5.45x39_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(FIVE_FIVE_SIX_BY_FOUR_FIVE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["5.56x45_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["5.56x45_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["5.56x45_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(THREE_ZERO_ZERO_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds[".300_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds[".300_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds[".300_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(SEVEN_SIX_TWO_BY_THREE_NINE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["7.62x39_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["7.62x39_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["7.62x39_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(SEVEN_SIX_TWO_BY_FIVE_ONE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["7.62x51_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["7.62x51_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["7.62x51_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(SEVEN_SIX_TWO_BY_FIVE_FOUR_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["7.62x54_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["7.62x54_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["7.62x54_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(THREE_THREE_EIGHT_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds[".338_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds[".338_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds[".338_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(NINE_BY_THREE_NINE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["9x39_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["9x39_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["9x39_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(THREE_SIX_SIX_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds[".366_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds[".366_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds[".366_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(ONE_TWO_SEVEN_BY_FIVE_FIVE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["12.7x55_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["12.7x55_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["12.7x55_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(ONE_TWO_BY_SEVEN_ZERO_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["12/70_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["12/70_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["12/70_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(TWO_ZERO_BY_SEVEN_ZERO_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["20/70_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["20/70_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["20/70_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);
        assortCreator.createSingleAssortItem(TWO_THREE_BY_SEVEN_FIVE_GAMBLE_ID)
                                .addStackCount(config.ammo_cases_price_and_odds["23x75_case_stock"])
                                .addBuyRestriction(config.ammo_cases_price_and_odds["23x75_case_stock"])
                                .addMoneyCost(Money.ROUBLES, (config.ammo_cases_price_and_odds["23x75_case_price"] * config.price_multiplier))
                                .addLoyaltyLevel(1)
                                .export(tables.traders[baseJson._id]);

     }

     /**
     * Add traders name/location/description to the locale table
     * @param baseJson json file for trader (db/base.json)
     * @param tables database tables
     * @param fullName Complete name of trader
     * @param firstName First name of trader
     * @param nickName Nickname of trader
     * @param location Location of trader (e.g. "Here in the cat shop")
     * @param description Description of trader
     */
    public addTraderToLocales(baseJson: any, tables: IDatabaseTables, fullName: string, firstName: string, nickName: string, location: string, description: string)
    {
        // For each language, add locale for the new trader
        const locales = Object.values(tables.locales.global) as Record<string, string>[];
        for (const locale of locales) {
            locale[`${baseJson._id} FullName`] = fullName;
            locale[`${baseJson._id} FirstName`] = firstName;
            locale[`${baseJson._id} Nickname`] = nickName;
            locale[`${baseJson._id} Location`] = location;
            locale[`${baseJson._id} Description`] = description;
        }
    }
}