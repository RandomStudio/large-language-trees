import { pickRandomElement } from "random-elements";
import { Howl } from "howler";

export interface HowlWithSource {
  src: string;
  howl: Howl;
}

const growSounds: HowlWithSource[] = [
  "/audio/grow1.mp3",
  "/audio/grow2.mp3",
  "/audio/grow3.mp3",
  "/audio/grow4.mp3",
  "/audio/grow5.mp3"
].map((src) => ({ src, howl: new Howl({ src }) }));

const AMBIENT_SRC = "/audio/ambience.mp3";

const ambientSound: HowlWithSource = {
  src: AMBIENT_SRC,
  howl: new Howl({ src: AMBIENT_SRC })
};

export const playRandomGrow = () => {
  const pick = pickRandomElement(growSounds);
  console.log("playing", pick.src);
  pick.howl.play();
};

export const startAmbience = () => {
  if (ambientSound.howl.playing()) {
    console.warn("already playing ambience; ignore");
  } else {
    console.log("Start ambience...");
    ambientSound.howl.play();
    ambientSound.howl.fade(0, 1, 2000);
  }
};

export const stopAmbience = () => {
  if (!ambientSound.howl.playing()) {
    console.warn("not playing ambience; ignore");
  } else {
    ambientSound.howl.fade(1, 0, 2000);
    ambientSound.howl.once("fade", () => {
      console.log("...finished fade");
      ambientSound.howl.stop();
    });
  }
};
