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
  @Input() videoUrl: string = ''; // Wird initial nicht mehr direkt verwendet, aber kann für andere Zwecke behalten werden
  @Input() videoData: any;
  @ViewChild('target', { static: false }) target: ElementRef | undefined;
  player: any;
  @Input() showModal: boolean = false;
  faXmark = faXmark;

  private destroy$ = new Subject<void>();
  downloadSpeed: number = 0;
  downloadProgress: number = 0;
  currentResolution: string = '720p';
  isSpeedTestCompleted: boolean = false;
  private resolutions = ['120p', '360p', '720p', '1080p'];
  playerReady: boolean = false;
  playerInitialized: boolean = false;

  // Basis-URL für die API -  **WICHTIG: Passe diese an deine Django Backend URL an!**
  private baseUrl = 'http://localhost:8000/api/videos';

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      if (!this.playerInitialized) {
        setTimeout(() => {
          this.setupPlayer();
          this.playerInitialized = true;
        }, 100);
      } else {
        if (changes['videoUrl'] && changes['videoUrl'].currentValue !== changes['videoUrl'].previousValue) {
          //  `videoUrl` Input wird jetzt primär ignoriert, die URL wird aus `videoData` und `currentResolution` generiert.
          this.setVideoSource(this.getVideoUrlForResolution(this.currentResolution));
        }
      }
    } else if (changes['showModal'] && !this.showModal) {
      this.destroyPlayer();
      this.playerInitialized = false;
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
            src: this.getVideoUrlForResolution(this.currentResolution), // Verwende die korrekte URL für die initiale Auflösung
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
    this.saveCurrentTime();
    this.currentResolution = selectedResolution;
    this.changeVideoSource(selectedResolution);
  }

  changeVideoSource(resolution: string) {
    this.setVideoSource(this.getVideoUrlForResolution(resolution));
  }

  private getVideoUrlForResolution(resolution: string): string {
    if (this.videoData && this.videoData.id) {
      return `${this.baseUrl}/stream/${this.videoData.id}/${resolution}/`; // **Vollständige URL wird generiert**
    }
    return ''; // oder eine sinnvolle Fallback-URL oder Fehlerbehandlung
  }


  setVideoSource(videoUrl: string) {
    if (this.player) {
      this.player.src({
        src: videoUrl,
        type: 'video/mp4'
      });

      this.player.one('loadedmetadata', () => {
        setTimeout(() => {
          this.restorePlaybackTimeFromSessionStorage();
          this.player.play().catch(() => { });
        }, 100);
      });
    }
  }
}