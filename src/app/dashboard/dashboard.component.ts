import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ApiService, VideoResponse } from '../api.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  heroVideo: VideoResponse | null = null;
  newOnVideoflixVideos: VideoResponse[] = [];
  documentaryVideos: VideoResponse[] = [];
  dramaVideos: VideoResponse[] = [];
  comedyVideos: VideoResponse[] = [];
  continueWatchingVideos: VideoResponse[] = [];
  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadVideoData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadVideoData() {
    this.apiService.getVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videos: VideoResponse[]) => {
          console.log('Video Daten vom Backend erhalten:', videos);

          if (videos && videos.length > 0) {
            this.heroVideo = videos[0];

            this.newOnVideoflixVideos = videos.filter(video => video.genre === 'Action');
            this.documentaryVideos = videos.filter(video => video.genre === 'Documentary');
            this.dramaVideos = videos.filter(video => video.genre === 'Drama');
            this.comedyVideos = videos.filter(video => video.genre === 'Comedy');

          } else {
            console.warn('Keine Videos vom Backend erhalten oder Response ist leer.');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Video Daten:', error);
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
        }
      });
  }

}