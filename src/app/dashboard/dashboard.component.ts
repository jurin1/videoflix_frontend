import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { Subject, takeUntil } from 'rxjs';
import videojs from 'video.js';
import { ToastrService } from 'ngx-toastr';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Interface defining the structure of a video response from the API.
 */
export interface VideoResponse {
  id: number;
  title: string;
  description: string;
  video_file: string;
  thumbnail: string;
  resolutions: {
    "120p"?: string;
    "360p"?: string;
    "720p"?: string;
    "1080p"?: string;
  };
  upload_date: string;
  genre: string;
}

/**
 * Type alias for possible video resolutions.
 */
type VideoResolution = '120p' | '360p' | '720p' | '1080p';

/**
 * Dashboard component displaying video content categorized by genre.
 * Includes carousels for different video categories and a hero video section.
 *
 * @Component
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, VideoPlayerComponent, FontAwesomeModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  /**
   * Play icon from FontAwesome.
   */
  faPlay = faPlay;
  /**
   * Currently selected video for detailed view or modal.
   */
  selectedVideo: VideoResponse | null = null;
  /**
   * Hero video displayed prominently on the dashboard.
   */
  heroVideo: VideoResponse | any;
  /**
   * List of videos categorized as 'New on Videoflix'.
   */
  newOnVideoflixVideos: VideoResponse[] = [];
  /**
   * List of documentary videos.
   */
  documentaryVideos: VideoResponse[] = [];
  /**
   * List of drama videos.
   */
  dramaVideos: VideoResponse[] = [];
  /**
   * List of comedy videos.
   */
  comedyVideos: VideoResponse[] = [];
  /**
   * List of action videos.
   */
  actionVideos: VideoResponse[] = [];
  /**
   * List of videos for 'Continue Watching' section.
   */
  continueWatchingVideos: VideoResponse[] = [];
  /**
   * Subject to manage the component's lifecycle and unsubscribe from observables.
   * @private
   */
  private destroy$ = new Subject<void>();

  /**
   * Video.js player instance.
   */
  player: any;

  /**
   * Reference to the hero video player element in the template.
   */
  @ViewChild('heroVideoPlayer', { static: false }) heroVideoPlayerRef: ElementRef | undefined;
  /**
   * Reference to the 'New on Videoflix' carousel element.
   */
  @ViewChild('newOnVideoflixCarousel', { static: false }) newOnVideoflixCarouselRef: ElementRef | undefined;
  /**
   * Reference to the documentary carousel element.
   */
  @ViewChild('documentaryCarousel', { static: false }) documentaryCarouselRef: ElementRef | undefined;
  /**
   * Reference to the drama carousel element.
   */
  @ViewChild('dramaCarousel', { static: false }) dramaCarouselRef: ElementRef | undefined;
  /**
   * Reference to the comedy carousel element.
   */
  @ViewChild('comedyCarousel', { static: false }) comedyCarouselRef: ElementRef | undefined;
  /**
   * Reference to the action carousel element.
   */
  @ViewChild('actionCarousel', { static: false }) actionCarouselRef: ElementRef | undefined;
  /**
   * Reference to the 'Continue Watching' carousel element.
   */
  @ViewChild('continueWatchingCarousel', { static: false }) continueWatchingCarouselRef: ElementRef | undefined;

  /**
   * Object to track if carousel is needed for each category based on content width.
   */
  carouselNeeded: { [key: string]: boolean } = {};
  /**
   * URL of the selected video to be played in the modal.
   */
  selectedVideoUrl: string = '';
  /**
   * Flag to control the visibility of the video modal.
   */
  showVideoModal: boolean = false;

  /**
   * Determines the appropriate video resolution based on the screen width.
   *
   * @private
   * @returns {string} Video resolution ('360p', '720p', or '1080p') as a string.
   */
  private getVideoResolution(): string {
    const screenWidth = window.screen.width;

    if (screenWidth <= 768) {
      return '360p';
    } else if (screenWidth <= 1024) {
      return '720p';
    } else {
      return '1080p';
    }
  }

  /**
   * @param {ApiService} apiService Service to fetch video data from the API.
   * @param {ToastrService} toastr Service to display toast notifications.
   * @param {ChangeDetectorRef} cdRef Service to manually trigger change detection.
   */
  constructor(private apiService: ApiService, private toastr: ToastrService, private cdRef: ChangeDetectorRef) { }

  /**
   * Lifecycle hook called after component initialization.
   * Calls {@link loadVideoData} to fetch and display video content.
   */
  ngOnInit() {
    this.loadVideoData()
  }

  /**
   * Lifecycle hook called when the component is destroyed.
   * Emits a complete signal to the destroy$ Subject to unsubscribe from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Lifecycle hook called after the component's view and child views are initialized.
   * Currently empty, but can be used for actions needed immediately after view initialization.
   */
  ngAfterViewInit(): void { }

  /**
   * Lifecycle hook called after every check of the component's view.
   * Checks if carousels need to be scrollable and triggers change detection.
   */
  ngAfterViewChecked(): void {
    this.checkCarouselNeeds('newOnVideoflix', this.newOnVideoflixCarouselRef);
    this.checkCarouselNeeds('documentary', this.documentaryCarouselRef);
    this.checkCarouselNeeds('drama', this.dramaCarouselRef);
    this.checkCarouselNeeds('comedy', this.comedyCarouselRef);
    this.checkCarouselNeeds('action', this.actionCarouselRef);
    this.checkCarouselNeeds('continueWatching', this.continueWatchingCarouselRef);
    this.cdRef.detectChanges();
  }

  /**
   * Checks if a carousel element's content width exceeds its container width, determining if scrolling is needed.
   *
   * @private
   * @param {string} category Category name of the carousel (e.g., 'newOnVideoflix').
   * @param {ElementRef | undefined} carouselRef Reference to the carousel element.
   */
  private checkCarouselNeeds(category: string, carouselRef: ElementRef | undefined) {
    if (carouselRef) {
      const carousel = carouselRef.nativeElement;
      this.carouselNeeded[category] = carousel.scrollWidth > carousel.offsetWidth;
    } else {
      this.carouselNeeded[category] = false;
    }
  }

  /**
   * Scrolls a carousel horizontally by a specified direction.
   *
   * @param {string} category Category of the carousel to scroll.
   * @param {number} direction Direction of scroll: -1 for left, 1 for right.
   */
  scrollCarousel(category: string, direction: number) {
    let carouselRef: ElementRef | undefined;

    switch (category) {
      case 'newOnVideoflix':
        carouselRef = this.newOnVideoflixCarouselRef;
        break;
      case 'documentary':
        carouselRef = this.documentaryCarouselRef;
        break;
      case 'drama':
        carouselRef = this.dramaCarouselRef;
        break;
      case 'comedy':
        carouselRef = this.comedyCarouselRef;
        break;
      case 'action':
        carouselRef = this.actionCarouselRef;
        break;
      case 'continueWatching':
        carouselRef = this.continueWatchingCarouselRef;
        break;
      default:
        return;
    }

    if (carouselRef) {
      const carousel = carouselRef.nativeElement;
      const cardWidth = 215;
      const scrollAmount = cardWidth * direction;

      carousel.scrollLeft += scrollAmount;
    }
  }

  /**
   * Opens the video modal and sets up the video URL for playback.
   *
   * @param {VideoResponse} video Video object containing video details and resolutions.
   */
  openVideoModal(video: VideoResponse) {
    this.showVideoModal = false;
    this.selectedVideoUrl = '';
    this.selectedVideo = video;

    setTimeout(() => {
      const resolutions = video.resolutions || {};
      const videoPath = resolutions['720p'] ||
        resolutions['1080p'] ||
        resolutions['360p'] ||
        resolutions['120p'] ||
        video.video_file;

      this.selectedVideoUrl = `http://localhost:8000${videoPath}`;
      this.showVideoModal = true;
    }, 100);
  }

  /**
   * Loads video data from the API for different categories and initializes the hero video.
   * Subscribes to API service calls and handles success and error scenarios using toast notifications.
   */
  loadVideoData() {
    this.apiService.getVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videos: VideoResponse[]) => {
          if (videos && videos.length > 0) {
            this.heroVideo = videos[0];

            setTimeout(() => {
              this.initializeVideoPlayer(this.heroVideo);
            }, 0);

            this.newOnVideoflixVideos = videos.filter(video => video.genre === 'NewOnVideoflix');
            this.documentaryVideos = videos.filter(video => video.genre === 'Documentary');
            this.dramaVideos = videos.filter(video => video.genre === 'Drama');
            this.comedyVideos = videos.filter(video => video.genre === 'Comedy');
            this.actionVideos = videos.filter(video => video.genre === 'Action');

          } else {
            this.toastr.warning('No videos found.', 'Warning');
          }
        },
        error: (error) => {
          this.toastr.error('Error loading videos. Please try again later.', 'Error');
        }
      });


    this.apiService.getContinueWatchingVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (continueWatchingVideos: VideoResponse[]) => {
          this.continueWatchingVideos = continueWatchingVideos || [];
        },
        error: (error) => {
          this.toastr.error('Error loading "Continue Watching" videos. Please try again later.', 'Error');
        }
      });
  }

  /**
   * Initializes the Video.js player for the hero video section.
   * Sets up player configurations like controls, autoplay, muted, preload, and loop, and sets the video source based on resolution.
   *
   * @private
   * @param {VideoResponse} video Video object for the hero video, containing video URLs and resolutions.
   */
  private initializeVideoPlayer(video: VideoResponse) {
    if (this.heroVideoPlayerRef && video.resolutions) {
      const resolution = this.getVideoResolution() as VideoResolution;
      let videoUrl = video.resolutions[resolution] || video.video_file;

      videoUrl = `http://localhost:8000${videoUrl}`;

      this.player = videojs(this.heroVideoPlayerRef.nativeElement, {
        controls: false,
        autoplay: true,
        muted: true,
        preload: 'auto',
        loop: true,
      });

      this.player.src({
        src: videoUrl,
        type: 'video/mp4'
      });
    }
  }
}