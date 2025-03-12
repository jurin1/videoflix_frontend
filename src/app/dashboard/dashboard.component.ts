import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core'; // AfterViewInit, ElementRef, ViewChild importieren
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { Subject, takeUntil } from 'rxjs';
import videojs from 'video.js';



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


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit { // AfterViewInit implementieren

  heroVideo: VideoResponse | null = null;
  newOnVideoflixVideos: VideoResponse[] = [];
  documentaryVideos: VideoResponse[] = [];
  dramaVideos: VideoResponse[] = [];
  comedyVideos: VideoResponse[] = [];
  actionVideos: VideoResponse[] = [];
  continueWatchingVideos: VideoResponse[] = [];
  private destroy$ = new Subject<void>();

  player: any;

  @ViewChild('heroVideoPlayer', { static: false }) heroVideoPlayerRef: ElementRef | undefined; // Referenz auf das <video>-Element im Template

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

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadVideoData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (this.heroVideo && this.heroVideoPlayerRef) {
      this.initializeVideoPlayer(this.heroVideo); 
    }
  }


  loadVideoData() {
    this.apiService.getVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videos: VideoResponse[]) => {
          console.log('Video Daten vom Backend erhalten:', videos);

          if (videos && videos.length > 0) {
            this.heroVideo = videos[0];

            if (this.heroVideoPlayerRef) {
              this.initializeVideoPlayer(this.heroVideo);
            }


            this.newOnVideoflixVideos = videos.filter(video => video.genre === 'NewOnVideoflix');
            this.documentaryVideos = videos.filter(video => video.genre === 'Documentary');
            this.dramaVideos = videos.filter(video => video.genre === 'Drama');
            this.comedyVideos = videos.filter(video => video.genre === 'Comedy');
            this.actionVideos = videos.filter(video => video.genre === 'Action');

          } else {
            console.warn('Keine Videos vom Backend erhalten oder Response ist leer.');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Video Daten:', error);
          // TODO: Toast Nachricht
        }
      });


    this.apiService.getContinueWatchingVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (continueWatchingVideos: VideoResponse[]) => {
          console.log('"Continue Watching" Videos vom Backend erhalten:', continueWatchingVideos);
          this.continueWatchingVideos = continueWatchingVideos || [];
        },
        error: (error) => {
          console.error('Fehler beim Laden der "Continue Watching" Videos:', error);
          // TODO: Toast Nachricht
        }
      });
  }

  private initializeVideoPlayer(video: VideoResponse) { 
    if (this.heroVideoPlayerRef && video.resolutions) { 

      const resolution = this.getVideoResolution(); 
      const videoUrl = video.resolutions[resolution as keyof VideoResponse['resolutions']] || video.video_file; 

      console.log(`Video URL wird gesetzt (Auflösung: ${resolution}):`, videoUrl); 

      this.player = videojs(this.heroVideoPlayerRef.nativeElement, {
        controls: true,
        autoplay: true,
        muted: true,
        preload: 'auto',
        loop: false,
      });

      this.player.src({
        src: videoUrl,
        type: 'video/mp4'
      });
    }
  }

}