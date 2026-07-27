import { RenaissanceProfile } from "./renaissanceProfile";

const profiles = [
  new RenaissanceProfile(),
];

export function detectProfile(document) {

  for (const profile of profiles) {

    if (profile.detect(document)) {
      return profile;
    }

  }

  return null;

}