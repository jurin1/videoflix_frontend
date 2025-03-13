import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { Subject, takeUntil } from 'rxjs';
import videojs from 'video.js';
import { ToastrService } from 'ngx-toastr';
import { VideoPlayerComponent } from '../video-player/video-player.component';

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

type VideoResolution = '120p' | '360p' | '720p' | '1080p';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, VideoPlayerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  heroVideo: VideoResponse | any;
  newOnVideoflixVideos: VideoResponse[] = [];
  documentaryVideos: VideoResponse[] = [];
  dramaVideos: VideoResponse[] = [];
  comedyVideos: VideoResponse[] = [];
  actionVideos: VideoResponse[] = [];
  continueWatchingVideos: VideoResponse[] = [];
  private destroy$ = new Subject<void>();

  player: any;

  @ViewChild('heroVideoPlayer', { static: false }) heroVideoPlayerRef: ElementRef | undefined;
  @ViewChild('newOnVideoflixCarousel', { static: false }) newOnVideoflixCarouselRef: ElementRef | undefined;
  @ViewChild('documentaryCarousel', { static: false }) documentaryCarouselRef: ElementRef | undefined;
  @ViewChild('dramaCarousel', { static: false }) dramaCarouselRef: ElementRef | undefined;
  @ViewChild('comedyCarousel', { static: false }) comedyCarouselRef: ElementRef | undefined;
  @ViewChild('actionCarousel', { static: false }) actionCarouselRef: ElementRef | undefined;
  @ViewChild('continueWatchingCarousel', { static: false }) continueWatchingCarouselRef: ElementRef | undefined;


  carouselNeeded: { [key: string]: boolean } = {};
  selectedVideoUrl: string = '';
  showVideoModal: boolean = false;

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

  constructor(private apiService: ApiService, private toastr: ToastrService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadVideoData()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void { }

  ngAfterViewChecked(): void {
    this.checkCarouselNeeds('newOnVideoflix', this.newOnVideoflixCarouselRef);
    this.checkCarouselNeeds('documentary', this.documentaryCarouselRef);
    this.checkCarouselNeeds('drama', this.dramaCarouselRef);
    this.checkCarouselNeeds('comedy', this.comedyCarouselRef);
    this.checkCarouselNeeds('action', this.actionCarouselRef);
    this.checkCarouselNeeds('continueWatching', this.continueWatchingCarouselRef);
    this.cdRef.detectChanges();
  }


  private checkCarouselNeeds(category: string, carouselRef: ElementRef | undefined) {
    if (carouselRef) {
      const carousel = carouselRef.nativeElement;
      this.carouselNeeded[category] = carousel.scrollWidth > carousel.offsetWidth;
    } else {
      this.carouselNeeded[category] = false;
    }
  }


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

  openVideoModal(video: VideoResponse) {
    let videoUrl = video.resolutions['720p'] || video.resolutions['1080p'] || video.resolutions['360p'] || video.resolutions['120p'] || video.video_file;
    let fullVideoUrl = `http://localhost:8000${videoUrl}`;

    this.showVideoModal = false;
    this.selectedVideoUrl = '';

    setTimeout(() => {
      this.selectedVideoUrl = fullVideoUrl;
      this.showVideoModal = true;
    }, 50);
  }

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
            this.toastr.warning('Keine Videos gefunden.', 'Warnung');
          }
        },
        error: (error) => {
          this.toastr.error('Fehler beim Laden der Videos. Bitte versuche es später noch einmal.', 'Fehler');
        }
      });


    this.apiService.getContinueWatchingVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (continueWatchingVideos: VideoResponse[]) => {
          this.continueWatchingVideos = continueWatchingVideos || [];
        },
        error: (error) => {
          this.toastr.error('Fehler beim Laden der "Continue Watching" Videos. Bitte versuche es später noch einmal.', 'Fehler');
        }
      });
  }

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