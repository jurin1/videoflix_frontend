import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { Subject, takeUntil } from 'rxjs';
import videojs from 'video.js';
import { ToastrService } from 'ngx-toastr'; // ToastrService importieren

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

type VideoResolution = '120p' | '360p' | '720p' | '1080p'; // Definieren des VideoResolution Typs

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

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

  constructor(private apiService: ApiService, private toastr: ToastrService) { } // ToastrService injecten

  ngOnInit(): void {
    this.loadVideoData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit wurde aufgerufen!'); // Keep this to verify ngAfterViewInit is called
    // Remove the initialization from here - we will do it in the 'next' block
    // if (this.heroVideo && this.heroVideoPlayerRef) {
    //   this.initializeVideoPlayer(this.heroVideo);
    // }
  }


  loadVideoData() {
    this.apiService.getVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videos: VideoResponse[]) => {
          console.log('Video Daten vom Backend erhalten:', videos);

          if (videos && videos.length > 0) {
            this.heroVideo = videos[0];

            console.log('heroVideoPlayerRef before init:', this.heroVideoPlayerRef);
            console.log('heroVideo:', this.heroVideo);

            // **Füge setTimeout HIER hinzu, um die Initialisierung zu verzögern**
            setTimeout(() => {
              this.initializeVideoPlayer(this.heroVideo);
              console.log('heroVideoPlayerRef after init (setTimeout):', this.heroVideoPlayerRef); // Log innerhalb setTimeout
            }, 0); // 0 Millisekunden Verzögerung (so kurz wie möglich)


            console.log('heroVideoPlayerRef after init (outside setTimeout):', this.heroVideoPlayerRef); // Log außerhalb setTimeout - zum Vergleich


            this.newOnVideoflixVideos = videos.filter(video => video.genre === 'NewOnVideoflix');
            this.documentaryVideos = videos.filter(video => video.genre === 'Documentary');
            this.dramaVideos = videos.filter(video => video.genre === 'Drama');
            this.comedyVideos = videos.filter(video => video.genre === 'Comedy');
            this.actionVideos = videos.filter(video => video.genre === 'Action');

          } else {
            console.warn('Keine Videos vom Backend erhalten oder Response ist leer.');
            this.toastr.warning('Keine Videos gefunden.', 'Warnung'); // Toast-Nachricht bei leeren Videos
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Video Daten:', error);
          this.toastr.error('Fehler beim Laden der Videos. Bitte versuche es später noch einmal.', 'Fehler'); // Toast-Fehlermeldung
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
          this.toastr.error('Fehler beim Laden der "Continue Watching" Videos. Bitte versuche es später noch einmal.', 'Fehler'); // Toast-Fehlermeldung
        }
      });
  }

  private initializeVideoPlayer(video: VideoResponse) {
    if (this.heroVideoPlayerRef && video.resolutions) { // Keep the condition inside initializePlayer for safety
      const resolution = this.getVideoResolution() as VideoResolution;
      let videoUrl = video.resolutions[resolution] || video.video_file;

      // **Basis-URL HIER voranstellen**
      videoUrl = `http://localhost:8000${videoUrl}`;

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
    } else {
      console.warn('heroVideoPlayerRef is still undefined or video.resolutions missing in initializeVideoPlayer'); // Add warning log
    }
  }

}