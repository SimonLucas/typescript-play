// src/planetwars/core/GameParams.ts

export class GameParams {
    // Spatial parameters
    width: number;
    height: number;
    edgeSeparation: number;
    radialSeparation: number;
    growthToRadiusFactor: number;

    // Game parameters
    numPlanets: number;
    initialNeutralRatio: number;
    maxTicks: number;
    minInitialShipsPerPlanet: number;
    maxInitialShipsPerPlanet: number;
    minGrowthRate: number;
    maxGrowthRate: number;
    transporterSpeed: number;

    // Meta parameters
    newMapEachRun: boolean;

    constructor({
        width = 640,
        height = 480,
        edgeSeparation = 25.0,
        radialSeparation = 1.5,
        growthToRadiusFactor = 200.0,

        numPlanets = 10,
        initialNeutralRatio = 0.5,
        maxTicks = 2000,
        minInitialShipsPerPlanet = 2,
        maxInitialShipsPerPlanet = 20,
        minGrowthRate = 0.02,
        maxGrowthRate = 0.1,
        transporterSpeed = 3.0,

        newMapEachRun = true,
    }: Partial<GameParams> = {}) {
        this.width = width;
        this.height = height;
        this.edgeSeparation = edgeSeparation;
        this.radialSeparation = radialSeparation;
        this.growthToRadiusFactor = growthToRadiusFactor;

        this.numPlanets = numPlanets;
        this.initialNeutralRatio = initialNeutralRatio;
        this.maxTicks = maxTicks;
        this.minInitialShipsPerPlanet = minInitialShipsPerPlanet;
        this.maxInitialShipsPerPlanet = maxInitialShipsPerPlanet;
        this.minGrowthRate = minGrowthRate;
        this.maxGrowthRate = maxGrowthRate;
        this.transporterSpeed = transporterSpeed;

        this.newMapEachRun = newMapEachRun;
    }
}
