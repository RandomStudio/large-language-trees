<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

  let videoElement: HTMLVideoElement;
  let decodedText: string | null = null;
  let reader: BrowserMultiFormatReader;
  let isVideoPlaying = false;

  onMount(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.addEventListener("playing", () => {
          isVideoPlaying = true;
        });
        videoElement.addEventListener("ended", () => {
          isVideoPlaying = false;
        });
        videoElement.addEventListener("pause", () => {
          isVideoPlaying = false;
        });
        videoElement.play().catch((err) => {
          console.error("Error playing video:", err);
        });
        setupCodeReader(stream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  });

  onDestroy(() => {
    if (reader) {
      reader.reset();
    }
    stopVideoStream();
  });

  function setupCodeReader(stream: MediaStream): void {
    reader = new BrowserMultiFormatReader();
    reader.decodeFromStream(stream, videoElement, (result, err) => {
      if (result) {
        decodedText = result.getText();
      } else if (err && !(err instanceof NotFoundException)) {
        console.error("Error decoding QR code:", err);
      }
    });
  }

  function stopVideoStream(): void {
    if (videoElement && videoElement.srcObject) {
      const stream: MediaStream = videoElement.srcObject as MediaStream;
      const tracks: MediaStreamTrack[] = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoElement.srcObject = null;
      isVideoPlaying = false;
    }
  }
</script>

<div>
  <video bind:this={videoElement} playsinline></video>
  <div>
    <h2>Decoded QR Code:</h2>
    <p>{decodedText || "No QR code detected"}</p>
  </div>
</div>

<style>
  video {
    width: 100%;
    border: 1px solid black;
  }
  div {
    text-align: center;
  }
</style>
