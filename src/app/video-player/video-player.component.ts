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
          this.restorePlaybackTimeFromSessionStorage();
          this.player.play().catch(() => { });
        });

      } catch (error) { }
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
      } catch (e) { }
    }
  }

  private getSessionStorageKey(): string {
    return `videoflix_playback_time_${this.videoData?.id}`;
  }

  saveCurrentTime() { // Hinzugefügte Methode zum Speichern der Zeit
    if (this.player && this.videoData?.id) {
      const currentTime = this.player.currentTime();
      const key = this.getSessionStorageKey();
      sessionStorage.setItem(key, currentTime.toString());
      console.log(`Playback time saved to sessionStorage for video ID ${this.videoData.id} at ${currentTime} seconds.`);
    } else {
      console.log('Player not initialized or videoData ID missing.');
    }
  }

  private restorePlaybackTimeFromSessionStorage(): void { // **Methode zum Wiederherstellen der Zeit**
    if (this.player && this.videoData?.id) {
      const savedTime = sessionStorage.getItem(this.getSessionStorageKey());
      if (savedTime) {
        this.player.currentTime(parseFloat(savedTime));
        console.log(`Playback time restored from sessionStorage for video ID ${this.videoData.id} to ${savedTime} seconds.`);
        sessionStorage.removeItem(this.getSessionStorageKey()); // Optional: Einmaliges Wiederherstellen
      } else {
        console.log(`No saved playback time found in sessionStorage for video ID ${this.videoData.id}.`);
      }
    }
  }
}