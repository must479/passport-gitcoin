import { PlatformSpec, PlatformGroupSpec } from "../types";

export const DiscordPlatformDetails: PlatformSpec = {
  platform: "Discord",
  name: "Discord",
  description: "Connect your existing Discord account to verify.",
  connectMessage: "Connect Account",
};

export const DiscordProviderConfig: PlatformGroupSpec[] = [
  {
    platformGroup: "Account Name",
    providers: [{ title: "Encrypted", name: "Discord" }],
  },
];
