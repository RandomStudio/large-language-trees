import { pickRandomElement } from "random-elements";
import { Howl, Howler } from "howler";

const growSounds = [
  "/audio/grow1.mp3",
  "/audio/grow2.mp3",
  "/audio/grow3.mp3",
  "/audio/grow4.mp3",
  "/audio/grow5.mp3"
].map((src) => ({ src, howl: new Howl({ src }) }));

export const playRandomGrow = () => {
  const pick = pickRandomElement(growSounds);
  console.log("playing", pick.src);
  pick.howl.play();
};
