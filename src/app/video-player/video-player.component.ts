import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnDestroy, OnChanges, OnInit {
  @Input() videoUrl: string = '';
  @Input() videoData: any;
  @ViewChild('target', { static: false }) target: ElementRef | undefined;
  player: any;
  @Input() showModal: boolean = false;
  faXmark = faXmark;

  // Speed test variables (erstmal ignoriert)
  private destroy$ = new Subject<void>();
  downloadSpeed: number = 0;
  downloadProgress: number = 0;
  currentResolution: string = '720p';
  isSpeedTestCompleted: boolean = false;
  private resolutions = ['120p', '360p', '720p', '1080p'];
  playerReady: boolean = false; // Flag, um anzuzeigen, ob der Player bereit ist


  ngOnInit() {
    // Initialize component
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      setTimeout(() => {
        this.setupPlayer();
      }, 100);
    } else {
      this.destroyPlayer();
    }
  }

  private setupPlayer() {
    this.destroyPlayer();

    setTimeout(() => {
      if (!this.target || !this.target.nativeElement) {
        return;
      }

      try {
        this.player = videojs(this.target.nativeElement, {
          controls: true,
          autoplay: true,
          muted: true,
          preload: 'auto',
          fluid: true,
          sources: [{
            src: this.videoUrl,
            type: 'video/mp4'
          }]
        });

        this.player.ready(() => {
          console.log("setupPlayer: player is ready");
          this.playerReady = true; // Setze das Flag, wenn der Player bereit ist
          this.restorePlaybackTimeFromSessionStorage();
          this.player.play().catch(() => { });
        });

      } catch (error) {
        console.error("setupPlayer: Error initializing video.js", error);
      }
    }, 300);
  }


  ngOnDestroy() {
    this.destroyPlayer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeModal() {
    this.showModal = false;
    this.destroyPlayer();
  }

  private destroyPlayer() {
    if (this.player) {
      try {
        this.player.pause();
        this.player.dispose();
        this.player = null;
        this.playerReady = false; // Setze das Flag zurück
      } catch (e) {
        console.error("destroyPlayer: Error disposing video.js", e);
      }
    }
  }

  private getSessionStorageKey(): string {
    const key = `videoflix_playback_time_${this.videoData?.id}`;
    return key;
  }

  saveCurrentTime() { // Hinzugefügte Methode zum Speichern der Zeit
    if (this.player && this.videoData?.id) {
      const currentTime = this.player.currentTime();
      const key = this.getSessionStorageKey();
      console.log("saveCurrentTime - Key:", key, "currentTime:", currentTime);
      sessionStorage.setItem(key, currentTime.toString());
      console.log(`Playback time saved to sessionStorage for video ID ${this.videoData.id} at ${currentTime} seconds.`);
    } else {
      console.log('Player not initialized or videoData ID missing.');
    }
  }

  private restorePlaybackTimeFromSessionStorage(): void { // **Methode zum Wiederherstellen der Zeit**
    if (this.player && this.videoData?.id && this.playerReady) { // Stelle sicher, dass der Player bereit ist
      const key = this.getSessionStorageKey();
      console.log("restorePlaybackTimeFromSessionStorage - Key:", key);
      const savedTime = sessionStorage.getItem(key);
      if (savedTime) {
        this.player.currentTime(parseFloat(savedTime));
        console.log(`Playback time restored from sessionStorage for video ID ${this.videoData.id} to ${savedTime} seconds.`);
      } else {
        console.log(`No saved playback time found in sessionStorage for video ID ${this.videoData.id}.`);
      }
    } else {
      console.log("restorePlaybackTimeFromSessionStorage: Player not ready or videoData missing");
    }
  }

  onResolutionChange(event: any) {
    const selectedResolution = event.target.value;
    this.saveCurrentTime();
    this.currentResolution = selectedResolution;
    this.changeVideoSource(selectedResolution);
  }

  changeVideoSource(resolution: string) {
    const baseUrl = this.videoUrl.substring(0, this.videoUrl.lastIndexOf('/') + 1);
    const videoUrl = `${baseUrl}${resolution}.mp4`;

    console.log("changeVideoSource: videoUrl =", videoUrl);

    if (this.player) {
      this.setVideoSource(videoUrl);
    }
  }

  setVideoSource(videoUrl: string) {
    this.player.src({
      src: videoUrl,
      type: 'video/mp4'
    });

    this.player.one('loadedmetadata', () => {
      console.log("setVideoSource: loadedmetadata event triggered");
      console.log("setVideoSource: videoData.id inside loadedmetadata =", this.videoData?.id); // Überprüfe die ID HIER

      // Verzögere das Wiederherstellen der Zeit um einen kleinen Moment
      setTimeout(() => {
        this.restorePlaybackTimeFromSessionStorage();
        this.player.play().catch(() => { });
      }, 100); // Warte 100ms
    });
  }
}