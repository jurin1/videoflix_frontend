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

  // Speed test variables
  private destroy$ = new Subject<void>();
  downloadSpeed: number = 0;
  downloadProgress: number = 0;
  currentResolution: string = '720p'; // Default resolution
  isSpeedTestCompleted: boolean = false;

  // Available resolutions in order of quality
  private resolutions = ['120p', '360p', '720p', '1080p'];

  ngOnInit() {
    // Initialize component
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      setTimeout(() => {
        this.setupPlayer();
        this.startSpeedTest();
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
          this.player.play().catch(() => { });
        });

      } catch (error) { }
    }, 300);
  }

  startSpeedTest() {
    this.downloadProgress = 0;
    this.isSpeedTestCompleted = false;

    // Reset the existing subscription
    this.destroy$.next();

    // Simulate download speed test with progress updates
    const testDuration = 3000; // 3 seconds test
    const progressInterval = 100; // Update progress every 100ms
    const totalSteps = testDuration / progressInterval;

    interval(progressInterval).pipe(
      takeUntil(this.destroy$)
    ).subscribe(count => {
      // Update progress
      this.downloadProgress = Math.min(Math.round((count / totalSteps) * 100), 100);

      // When test is complete
      if (this.downloadProgress >= 100) {
        this.completeSpeedTest();
      }
    });

    // Start the actual speed test
    this.measureConnectionSpeed();
  }

  measureConnectionSpeed() {
    // Measure actual download speed
    // This is a simplified version - in production, you would use a more accurate method
    const imageAddr = "https://unsplash.com/photos/-JMK4lyhnGM/download?ixid=M3wxMjA3fDB8MXxhbGx8Mnx8fHx8fHx8MTc0MTk0NjYwOXw&force=true&w=2400"; // Large image for testing
    const downloadSize = 459000; // Approximate size in bytes

    const startTime = new Date().getTime();
    const download = new Image();

    download.onload = () => {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000; // Duration in seconds
      const bitsLoaded = downloadSize * 8;
      const speedBps = (bitsLoaded / duration).toFixed(2);
      const speedKbps = (Number(speedBps) / 1024).toFixed(2);
      const speedMbps = (Number(speedKbps) / 1024).toFixed(2);

      this.downloadSpeed = Number(speedMbps);
      // Continue with the simulated progress
    };

    download.onerror = () => {
      // In case of error, estimate speed
      this.downloadSpeed = 5; // Default to 5 Mbps
    };

    // Start the download test
    download.src = imageAddr + "?n=" + Math.random();
  }

  completeSpeedTest() {
    this.isSpeedTestCompleted = true;

    // Determine appropriate resolution based on speed
    const newResolution = this.getOptimalResolution(this.downloadSpeed);

    // Only change if resolution is different
    if (newResolution !== this.currentResolution && this.player && this.videoData) {
      const currentTime = this.player.currentTime();
      this.currentResolution = newResolution;

      // Get the URL for the new resolution
      const newVideoUrl = this.getVideoUrlForResolution(newResolution);

      if (newVideoUrl) {
        // Change the source and restore playback position
        this.player.src({
          src: newVideoUrl,
          type: 'video/mp4'
        });

        this.player.ready(() => {
          this.player.currentTime(currentTime);
          this.player.play();
        });
      }
    }
  }

  getOptimalResolution(speedMbps: number): string {
    // Determine optimal resolution based on connection speed
    if (speedMbps < 1) {
      return '120p';
    } else if (speedMbps < 3) {
      return '360p';
    } else if (speedMbps < 5) {
      return '720p';
    } else {
      return '1080p';
    }
  }

  getVideoUrlForResolution(resolution: string): string {
    if (!this.videoData || !this.videoData.resolutions) {
      return this.videoUrl; // Fallback to current URL
    }

    const resolutions = this.videoData.resolutions;

    // Get the requested resolution or fall back to the next available lower resolution
    const index = this.resolutions.indexOf(resolution);

    for (let i = index; i >= 0; i--) {
      const res = this.resolutions[i];
      if (resolutions[res]) {
        return `http://localhost:8000${resolutions[res]}`;
      }
    }

    // If no matching resolution found, return the original video file
    return `http://localhost:8000${this.videoData.video_file}`;
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
}