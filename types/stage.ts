export enum Stage {
  Ingest = 'Ingest',
  Modelize = 'Modelize',
  Egress = 'Egress',
}

/*
  Every stage lives in exactly one medallion layer of the Data Layer:
    - Ingest lands raw data as received in Bronze.
    - Modelize conforms and standardizes it into Silver.
    - Egress serves the curated Gold layer to destinations.
*/
export enum Layer {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
}

export const StageLayer: Record<Stage, Layer> = {
  [Stage.Ingest]: Layer.Bronze,
  [Stage.Modelize]: Layer.Silver,
  [Stage.Egress]: Layer.Gold,
}
