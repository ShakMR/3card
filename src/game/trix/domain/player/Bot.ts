import Player, { TypeOfPlayer } from "./Player";
import {
    adjectives,
    uniqueNamesGenerator,
} from "unique-names-generator";
import type { ILogger } from "../../../../logger/Logger";

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

    protected constructor(namePrefix: string, protected logger: ILogger) {
        const name = uniqueNamesGenerator({
            dictionaries: [adjectives, matrixNames],
            style: "capital",
            separator: " ",
        });
        super({name: `${namePrefix} ${name}`});
    }
}

export default Bot;
