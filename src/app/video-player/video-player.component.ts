import { Component, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';

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

  private destroy$ = new Subject<void>();
  downloadSpeed: number = 0;
  downloadProgress: number = 0;
  currentResolution: string = '720p'; // Default-Auflösung
  isSpeedTestCompleted: boolean = false;
  private resolutions = ['120p', '360p', '720p', '1080p'];
  playerReady: boolean = false;
  playerInitialized: boolean = false;

  speedTestProgress: number = 0; // Fortschrittsanzeige für den Speedtest
  isSpeedTestRunning: boolean = false; // Status, ob der Speedtest läuft
  showResolutionDropdown: boolean = false; // Steuert die Anzeige des Dropdowns
  suggestedResolution: string = '720p'; // Vorgeschlagene Auflösung nach Speedtest (Standardwert)


  // Basis-URL für die API
  private baseUrl = 'http://localhost:8000/api/videos';

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      if (!this.playerInitialized) {
        setTimeout(() => {
          this.performSpeedTest().then(() => { // Starte Speedtest und warte auf Abschluss
            this.setupPlayer(); // Initialisiere Player NACH dem Speedtest
            this.playerInitialized = true;
          });
        }, 100);
      } else {
        if (changes['videoUrl'] && changes['videoUrl'].currentValue !== changes['videoUrl'].previousValue) {
          this.setVideoSource(this.getVideoUrlForResolution(this.currentResolution));
        }
      }
    } else if (changes['showModal'] && !this.showModal) {
      this.destroyPlayer();
      this.playerInitialized = false;
    }
  }

  // ... (restliche Methoden wie setupPlayer, setupEventListeners, ngOnDestroy, closeModal, destroyPlayer, getSessionStorageKey, saveCurrentTime, restorePlaybackTimeFromSessionStorage, onResolutionChange, changeVideoSource, getVideoUrlForResolution, setVideoSource) ...

  ngOnDestroy() {
    this.destroyPlayer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeModal() {
    this.showModal = false;
    this.destroyPlayer();
    this.playerInitialized = false;
  }

  private destroyPlayer() {
    if (this.player) {
      try {
        this.player.pause();
        this.player.dispose();
        this.player = null;
        this.playerReady = false;
      } catch (e) {
        console.error("destroyPlayer: Error disposing video.js", e);
      }
    }
  }

  private getSessionStorageKey(): string {
    const key = `videoflix_playback_time_${this.videoData?.id}`;
    return key;
  }

  saveCurrentTime() {
    if (this.player && this.videoData?.id) {
      const currentTime = this.player.currentTime();
      const key = this.getSessionStorageKey();
      sessionStorage.setItem(key, currentTime.toString());
    }
  }

  private restorePlaybackTimeFromSessionStorage(): void {
    if (this.player && this.videoData?.id && this.playerReady) {
      const key = this.getSessionStorageKey();
      const savedTime = sessionStorage.getItem(key);
      if (savedTime) {
        this.player.currentTime(parseFloat(savedTime));
      }
    }
  }

  onResolutionChange(event: any) {
    const selectedResolution = event.target.value;
    this.saveCurrentTime(); // Speichere Zeit VOR dem Auflösungswechsel
    this.currentResolution = selectedResolution;
    this.changeVideoSource(selectedResolution);
  }

  changeVideoSource(resolution: string) {
    this.setVideoSource(this.getVideoUrlForResolution(resolution));
  }

  private getVideoUrlForResolution(resolution: string): string {
    if (this.videoData && this.videoData.id) {
      return `${this.baseUrl}/stream/${this.videoData.id}/${resolution}/`;
    }
    return '';
  }


  setVideoSource(videoUrl: string) {
    if (this.player) {
      const currentTimeBeforeSwitch = this.player.currentTime(); // Aktuelle Zeit VOR dem Wechsel speichern

      this.player.src({
        src: videoUrl,
        type: 'video/mp4'
      });

      this.player.one('loadedmetadata', () => {
        setTimeout(() => {
          this.player.currentTime(currentTimeBeforeSwitch); // Zeit NACH dem Wechsel wiederherstellen
          this.restorePlaybackTimeFromSessionStorage();
          this.player.play().catch(() => { });
        }, 100);
      });
    }
  }


  private setupPlayer() {
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
            src: this.getVideoUrlForResolution(this.suggestedResolution), // Starte mit der vorgeschlagenen Auflösung
            type: 'video/mp4'
          }]
        });

        this.setupEventListeners();

        this.player.ready(() => {
          this.playerReady = true;
          this.restorePlaybackTimeFromSessionStorage();
          this.player.play().catch(() => { });
        });

      } catch (error) {
        console.error("setupPlayer: Error initializing video.js", error);
      }
    }, 300);
  }

  private setupEventListeners() {
    if (this.player) {
      this.player.on('error', (event: any) => {
        console.error('Video.js Event: error', this.player.error());
      });
    }
  }


  async performSpeedTest(): Promise<void> {
    return new Promise<void>(resolve => {
      this.isSpeedTestRunning = true;
      this.speedTestProgress = 0;
      this.showResolutionDropdown = false;

      const imageSrc = 'https://unsplash.com/photos/-JMK4lyhnGM/download?ixid=M3wxMjA3fDB8MXxhbGx8Mnx8fHx8fHx8MTc0MTk2NjMzOXw&force=true&w=640' + Math.random(); // Verwende lokales Bild
      const startTime = performance.now();
      let endTime: number;
      let image = new Image();
      let progressInterval: any;
      let loadedBytes = 0;
      const totalBytes = 40325; // Deine Bildgröße beibehalten

      image.onload = () => {
        endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const bitsLoaded = totalBytes * 8;
        this.downloadSpeed = parseFloat((bitsLoaded / duration / 1024 / 1024).toFixed(2));
        console.log(`Download Speed: ${this.downloadSpeed} Mbps`);

        this.suggestedResolution = this.determineResolution(this.downloadSpeed);
        this.currentResolution = this.suggestedResolution; // **Setze currentResolution auf suggestedResolution**
        this.isSpeedTestCompleted = true;
        this.isSpeedTestRunning = false;
        this.showResolutionDropdown = true;
        clearInterval(progressInterval);
        resolve();
      };

      image.onerror = () => {
        console.error('Speed test image failed to load');
        this.isSpeedTestRunning = false;
        this.showResolutionDropdown = true;
        clearInterval(progressInterval);
        resolve();
      };

      image.src = imageSrc;

      progressInterval = setInterval(() => {
        if (endTime) {
          clearInterval(progressInterval);
          return;
        }
        const currentTime = performance.now();
        const timeElapsed = (currentTime - startTime) / 1000;
        const expectedBytesLoaded = Math.min(totalBytes, Math.round(this.downloadSpeed * 125 * timeElapsed * 1024));
        this.speedTestProgress = Math.round((expectedBytesLoaded / totalBytes) * 100);
        this.speedTestProgress = Math.min(this.speedTestProgress, 100);

        if (this.speedTestProgress >= 100) {
          clearInterval(progressInterval);
          this.speedTestProgress = 100;
        }
      }, 100);
    });
  }

  determineResolution(speedMbps: number): string {
    if (speedMbps >= 10) {
      return '1080p';
    } else if (speedMbps >= 5) {
      return '720p';
    } else if (speedMbps >= 2) {
      return '360p';
    } else {
      return '120p';
    }
  }

}