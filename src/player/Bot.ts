import Player, { TypeOfPlayer } from "./Player";
import { ILogger } from "../logger/Logger";
import {
    adjectives,
    uniqueNamesGenerator,
} from "unique-names-generator";

const matrixNames = [
    "Agent Brown",
    "Agent Jones",
    "Agent Smith",
    "Apoc",
    "Architect",
    "Choi",
    "Cypher",
    "Dozer",
    "DuJour",
    "Keymaker",
    "Link",
    "Merovingian",
    "Mifune",
    "Morpheus",
    "Mouse",
    "Neo",
    "Oracle",
    "Phersephone",
    "Rhineheart",
    "Sati",
    "Sentinel",
    "Switch",
    "Tank",
    "Trainman",
    "Trinity",
    "Twins",
    "Woman in red",
    "Zee",
];

abstract class Bot extends Player {
    // it's just the numbers we can play, so we can select randomly
    public typeOfPlayer: TypeOfPlayer = TypeOfPlayer.Bot;

    protected think = (ms: number) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    protected constructor(protected logger: ILogger, namePrefix: string) {
        const name = uniqueNamesGenerator({
            dictionaries: [adjectives, matrixNames],
            style: "capital",
            separator: " ",
        });
        super({name: `${namePrefix} ${name}`});
    }
}

export default Bot;
