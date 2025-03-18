import { Component, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

/**
 * VideoPlayerComponent is a component that handles video playback using Video.js library.
 * It supports features like resolution switching, playback time restoration from session storage,
 * and a speed test to determine the optimal initial resolution.
 */
@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnDestroy, OnChanges, OnInit {
  /**
   * @input videoUrl - The URL of the video to be played. It's an input property.
   */
  @Input() videoUrl: string = '';
  /**
   * @input videoData - Data related to the video, such as its ID. It's an input property.
   */
  @Input() videoData: any;
  /**
   * @viewChild target - Reference to the video player element in the template.
   */
  @ViewChild('target', { static: false }) target: ElementRef | undefined;
  /**
   * player - Instance of the Video.js player.
   */
  player: any;
  /**
   * @input showModal - Boolean to control the visibility of the video player modal. It's an input property.
   */
  @Input() showModal: boolean = false;
  /**
   * faXmark - Icon for the close button.
   */
  faXmark = faXmark;

  private destroy$ = new Subject<void>();
  downloadSpeed: number = 0;
  downloadProgress: number = 0;
  currentResolution: string = '720p';
  isSpeedTestCompleted: boolean = false;
  private resolutions = ['120p', '360p', '720p', '1080p'];
  playerReady: boolean = false;
  playerInitialized: boolean = false;

  speedTestProgress: number = 0;
  isSpeedTestRunning: boolean = false;
  showResolutionDropdown: boolean = false;
  suggestedResolution: string = '720p';

  private baseUrl = environment.apiUrl + '/videos';;
  constructor(private toastr: ToastrService,){}


  /**
   * Lifecycle hook called after component initialization.
   */
  ngOnInit() {
  }

  /**
   * Lifecycle hook called when input properties change.
   * Handles changes to `showModal` and `videoUrl` inputs to manage player initialization,
   * video source updates, and player destruction based on modal visibility.
   * @param changes - SimpleChanges object containing the changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      if (!this.playerInitialized) {
        setTimeout(() => {
          this.performSpeedTest().then(() => {
            this.setupPlayer();
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


  /**
   * Lifecycle hook called before the component is destroyed.
   * Ensures the player is properly disposed of and resources are released.
   */
  ngOnDestroy() {
    this.destroyPlayer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Closes the video player modal and destroys the player instance.
   */
  closeModal() {
    this.showModal = false;
    this.destroyPlayer();
    this.playerInitialized = false;
  }

  /**
   * Destroys the Video.js player instance, pausing playback and disposing of resources.
   * Catches and logs any errors during disposal.
   * @private
   */
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

  /**
   * Generates a unique session storage key based on the video ID.
   * @private
   * @returns The session storage key string.
   */
  private getSessionStorageKey(): string {
    const key = `videoflix_playback_time_${this.videoData?.id}`;
    return key;
  }

  /**
   * Saves the current playback time to session storage for resuming later.
   */
  saveCurrentTime() {
    if (this.player && this.videoData?.id) {
      const currentTime = this.player.currentTime();
      const key = this.getSessionStorageKey();
      sessionStorage.setItem(key, currentTime.toString());
    }
  }

  /**
   * Restores the playback time from session storage if a saved time exists for the current video.
   * @private
   */
  private restorePlaybackTimeFromSessionStorage(): void {
    if (this.player && this.videoData?.id && this.playerReady) {
      const key = this.getSessionStorageKey();
      const savedTime = sessionStorage.getItem(key);
      if (savedTime) {
        this.player.currentTime(parseFloat(savedTime));
      }
    }
  }

  /**
   * Handles the resolution change event from the resolution dropdown.
   * Saves the current time before switching resolution and updates the video source.
   * @param event - The change event from the select element.
   */
  onResolutionChange(event: any) {
    const selectedResolution = event.target.value;
    this.saveCurrentTime();
    this.currentResolution = selectedResolution;
    this.changeVideoSource(selectedResolution);
  }

  /**
   * Changes the video source to the specified resolution.
   * @param resolution - The desired resolution ('120p', '360p', '720p', '1080p').
   */
  changeVideoSource(resolution: string) {
    this.setVideoSource(this.getVideoUrlForResolution(resolution));
  }

  /**
   * Constructs the video URL for a given resolution based on the video ID and base URL.
   * @private
   * @param resolution - The desired resolution.
   * @returns The video URL for the specified resolution, or an empty string if video data is missing.
   */
  private getVideoUrlForResolution(resolution: string): string {
    if (this.videoData && this.videoData.id) {
      return `${this.baseUrl}/stream/${this.videoData.id}/${resolution}/`;
    }
    return '';
  }

  /**
   * Sets the video source for the player and handles restoring playback time after source change.
   * @param videoUrl - The URL of the video source.
   */
  setVideoSource(videoUrl: string) {
    if (this.player) {
      const currentTimeBeforeSwitch = this.player.currentTime();

      this.player.src({
        src: videoUrl,
        type: 'video/mp4'
      });

      this.player.one('loadedmetadata', () => {
        setTimeout(() => {
          this.player.currentTime(currentTimeBeforeSwitch);
          this.restorePlaybackTimeFromSessionStorage();
          this.player.play().catch(() => { });
        }, 100);
      });
    }
  }

  /**
   * Initializes the Video.js player with default settings and sets up event listeners.
   * It uses the suggested resolution determined by the speed test as the initial source.
   * @private
   */
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
            src: this.getVideoUrlForResolution(this.suggestedResolution),
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

  /**
   * Sets up event listeners for the Video.js player to handle events like errors.
   * @private
   */
  private setupEventListeners() {
    if (this.player) {
      this.player.on('error', (event: any) => {
        console.error('Video.js Event: error', this.player.error());
      });
    }
  }

  /**
   * Performs a speed test by downloading an image to estimate the download speed.
   * Determines the suggested video resolution based on the speed test results.
   * @async
   * @private
   * @returns A Promise that resolves when the speed test is complete.
   */
  async performSpeedTest(): Promise<void> {
    return new Promise<void>(resolve => {
      this.isSpeedTestRunning = true;
      this.speedTestProgress = 0;
      this.showResolutionDropdown = false;

      const imageSrc = 'https://drive.google.com/file/d/1m4xX28NduuWZk2C5tUAACaqj7xnKk3Y1/view?usp=sharing';
      const startTime = performance.now();
      let endTime: number;
      let image = new Image();
      let progressInterval: any;
      let loadedBytes = 0;
      const totalBytes = 2934863;

      image.onload = () => {
        endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const bitsLoaded = totalBytes * 8;
        this.downloadSpeed = parseFloat((bitsLoaded / duration / 1024 / 1024).toFixed(2));

        this.suggestedResolution = this.determineResolution(this.downloadSpeed);
        this.toastr.success(`Download speed: ${this.downloadSpeed} Mbps`, 'Speed Test');
        this.currentResolution = this.suggestedResolution;
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

        this.speedTestProgress += 1; 
        this.speedTestProgress = Math.min(this.speedTestProgress, 100); 

        if (this.speedTestProgress >= 100) {
          clearInterval(progressInterval);
          this.speedTestProgress = 100;
        }
      }, 100);
    });
  }

  /**
   * Determines the optimal video resolution based on the download speed in Mbps.
   * @param speedMbps - The download speed in Mbps.
   * @returns The suggested resolution ('120p', '360p', '720p', '1080p').
   */
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