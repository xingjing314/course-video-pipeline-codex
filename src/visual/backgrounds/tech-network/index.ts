import { defineBackground } from "../define";
import { TechNetwork } from "./TechNetwork";
import { techNetworkSchema } from "./schema";

export const techNetworkBackground = defineBackground({
  schema: techNetworkSchema,
  component: TechNetwork,
});
